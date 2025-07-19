#!/usr/bin/env python3
"""
Airtable-Integrated Startup Analysis System
Automatically processes pitch deck PDFs from Airtable and generates comprehensive analysis
"""

import requests
import json
import os
import time
import tempfile
from pathlib import Path
from typing import Dict, List, Optional
from dotenv import load_dotenv
import base64

# Import existing analysis components
from startup_analyzer import ComprehensiveStartupAnalyzer
from gpt4o_analyzer import GPT4oBiotechAnalyzer
from pdf_processor import PDFProcessor

load_dotenv()

class AirtableStartupAnalyzer:
    """Integrates startup analysis with Airtable submissions"""
    
    def __init__(self):
        """Initialize Airtable and analysis components"""
        
        # Airtable configuration
        self.airtable_api_key = os.getenv('AIRTABLE_API_KEY') or 'patPnlxR05peVEnUc.e5a8cfe5a3f88676da4b3c124c99ed46026b4f869bb5b6a3f54cd45db17fd58f'
        self.base_id = os.getenv('AIRTABLE_BASE_ID') or 'app768aQ07mCJoyu8'
        self.table_name = 'Startup Submissions'  # Adjust based on your table name
        
        # OpenAI API key
        openai_key = os.getenv('OPENAI_API_KEY')
        if not openai_key:
            raise ValueError("OpenAI API key required for analysis")
        
        # Initialize analysis components
        self.pdf_processor = PDFProcessor()
        self.vision_analyzer = GPT4oBiotechAnalyzer(openai_key)
        self.startup_analyzer = ComprehensiveStartupAnalyzer(openai_key)
        
        # Airtable headers
        self.headers = {
            'Authorization': f'Bearer {self.airtable_api_key}',
            'Content-Type': 'application/json'
        }
        
        print("✅ Airtable Startup Analyzer initialized")
    
    def get_pending_submissions(self) -> List[Dict]:
        """Get submissions that need analysis"""
        
        print("🔍 Checking for pending submissions...")
        
        # Formula to find records with PDFs but no analysis
        filter_formula = "AND({Non-Confidential Pitch Deck} != '', OR({AI Analysis Status} = '', {AI Analysis Status} = 'Pending'))"
        
        url = f"https://api.airtable.com/v0/{self.base_id}/{self.table_name}"
        params = {
            'filterByFormula': filter_formula,
            'maxRecords': 10  # Process 10 at a time
        }
        
        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            records = data.get('records', [])
            
            print(f"📊 Found {len(records)} submissions pending analysis")
            return records
            
        except Exception as e:
            print(f"❌ Error fetching submissions: {str(e)}")
            return []
    
    def download_pdf_from_airtable(self, attachment: Dict, temp_dir: str) -> Optional[str]:
        """Download PDF from Airtable attachment"""
        
        try:
            pdf_url = attachment.get('url')
            filename = attachment.get('filename', 'pitch_deck.pdf')
            
            if not pdf_url:
                return None
            
            print(f"📥 Downloading: {filename}")
            
            # Download PDF
            response = requests.get(pdf_url)
            response.raise_for_status()
            
            # Save to temp file
            pdf_path = os.path.join(temp_dir, filename)
            with open(pdf_path, 'wb') as f:
                f.write(response.content)
            
            print(f"✅ Downloaded: {pdf_path}")
            return pdf_path
            
        except Exception as e:
            print(f"❌ Error downloading PDF: {str(e)}")
            return None
    
    def analyze_startup_submission(self, record: Dict) -> Dict:
        """Analyze a single startup submission"""
        
        record_id = record['id']
        fields = record['fields']
        startup_name = fields.get('Startup Name', 'Unknown Startup')
        
        print(f"\n🚀 Analyzing: {startup_name}")
        print(f"Record ID: {record_id}")
        
        # Update status to "Processing"
        self.update_analysis_status(record_id, "Processing", "Analysis started...")
        
        analysis_result = {
            "record_id": record_id,
            "startup_name": startup_name,
            "status": "error",
            "analysis": None,
            "error": None
        }
        
        try:
            # Get PDF attachment
            pdf_attachments = fields.get('Non-Confidential Pitch Deck', [])
            if not pdf_attachments:
                raise ValueError("No PDF attachment found")
            
            pdf_attachment = pdf_attachments[0]  # Take first attachment
            
            # Create temporary directory for processing
            with tempfile.TemporaryDirectory() as temp_dir:
                # Download PDF
                pdf_path = self.download_pdf_from_airtable(pdf_attachment, temp_dir)
                if not pdf_path:
                    raise ValueError("Failed to download PDF")
                
                # Set up temporary output directories
                slides_dir = os.path.join(temp_dir, "slides")
                analysis_dir = os.path.join(temp_dir, "analysis_results")
                os.makedirs(slides_dir, exist_ok=True)
                os.makedirs(analysis_dir, exist_ok=True)
                
                # Update processor output directory
                self.pdf_processor.output_dir = Path(slides_dir)
                
                # Step 1: Convert PDF to images
                print("📄 Converting PDF to slides...")
                self.update_analysis_status(record_id, "Processing", "Converting PDF to slides...")
                
                image_paths = self.pdf_processor.convert_pdf_to_images(pdf_path)
                print(f"✅ Generated {len(image_paths)} slides")
                
                # Step 2: GPT-4o Vision Analysis
                print("🔬 Running GPT-4o Vision analysis...")
                self.update_analysis_status(record_id, "Processing", "Analyzing slides with AI vision...")
                
                # Temporarily set vision analyzer output directory
                original_output_dir = self.vision_analyzer.output_dir
                self.vision_analyzer.output_dir = Path(analysis_dir)
                
                try:
                    vision_analyses = self.vision_analyzer.analyze_all_slides(slides_dir)
                    print("✅ Vision analysis complete")
                finally:
                    # Restore original output directory
                    self.vision_analyzer.output_dir = original_output_dir
                
                # Step 3: Comprehensive Analysis
                print("📈 Generating comprehensive analysis...")
                self.update_analysis_status(record_id, "Processing", "Generating comprehensive analysis...")
                
                # Create pitch deck data structure
                pitch_data = {
                    "total_slides": len(vision_analyses),
                    "analyses": vision_analyses,
                    "summary": {
                        "successful": len([a for a in vision_analyses if not a["analysis"].startswith("Error:")]),
                        "failed": len([a for a in vision_analyses if a["analysis"].startswith("Error:")]),
                        "timestamp": time.time()
                    }
                }
                
                # Generate comprehensive analysis
                comprehensive_analysis = self.startup_analyzer.analyze_startup_positioning(pitch_data)
                
                if "error" in comprehensive_analysis:
                    raise ValueError(f"Analysis failed: {comprehensive_analysis['error']}")
                
                print("✅ Comprehensive analysis complete")
                
                analysis_result.update({
                    "status": "success",
                    "analysis": comprehensive_analysis,
                    "slides_processed": len(image_paths),
                    "vision_success_rate": len([a for a in vision_analyses if not a["analysis"].startswith("Error:")]) / len(vision_analyses)
                })
                
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Analysis failed: {error_msg}")
            analysis_result["error"] = error_msg
            self.update_analysis_status(record_id, "Error", f"Analysis failed: {error_msg}")
            return analysis_result
        
        # Update Airtable with results
        self.save_analysis_to_airtable(record_id, comprehensive_analysis)
        
        return analysis_result
    
    def update_analysis_status(self, record_id: str, status: str, message: str = ""):
        """Update analysis status in Airtable"""
        
        try:
            url = f"https://api.airtable.com/v0/{self.base_id}/{self.table_name}/{record_id}"
            
            update_data = {
                "fields": {
                    "AI Analysis Status": status,
                    "Analysis Last Updated": time.strftime('%Y-%m-%d %H:%M:%S'),
                }
            }
            
            if message:
                update_data["fields"]["Analysis Notes"] = message
            
            response = requests.patch(url, headers=self.headers, json=update_data)
            response.raise_for_status()
            
            print(f"📝 Status updated: {status}")
            
        except Exception as e:
            print(f"⚠️ Failed to update status: {str(e)}")
    
    def save_analysis_to_airtable(self, record_id: str, analysis: Dict):
        """Save comprehensive analysis results to Airtable"""
        
        try:
            print("💾 Saving analysis to Airtable...")
            
            # Extract key metrics
            scores = analysis.get("overall_score", {})
            company_info = analysis.get("company_overview", {})
            
            # Prepare summary text
            summary_sections = []
            
            if analysis.get("executive_summary"):
                summary_sections.append(f"EXECUTIVE SUMMARY:\n{analysis['executive_summary']}")
            
            if analysis.get("strengths"):
                strengths_text = "\n".join([f"• {s}" for s in analysis["strengths"][:3]])
                summary_sections.append(f"KEY STRENGTHS:\n{strengths_text}")
            
            if analysis.get("weaknesses"):
                weaknesses_text = "\n".join([f"• {w}" for w in analysis["weaknesses"][:3]])
                summary_sections.append(f"KEY RISKS:\n{weaknesses_text}")
            
            analysis_summary = "\n\n".join(summary_sections)
            
            # Prepare update data
            url = f"https://api.airtable.com/v0/{self.base_id}/{self.table_name}/{record_id}"
            
            # Get detailed scoring with reasoning
            detailed_scores = analysis.get("detailed_scores", {})
            
            update_data = {
                "fields": {
                    "AI Analysis Status": "Complete",
                    "Overall Score": scores.get("overall", 0),
                    "Technology Score": scores.get("technology", 0),
                    "Market Score": scores.get("market", 0),
                    "Team Score": scores.get("team", 0),
                    "Technology Score Reasoning": detailed_scores.get("technology", {}).get("reasoning", "")[:2000],
                    "Market Score Reasoning": detailed_scores.get("market", {}).get("reasoning", "")[:2000],
                    "Team Score Reasoning": detailed_scores.get("team", {}).get("reasoning", "")[:2000],
                    "AI Analysis Summary": analysis_summary[:5000],  # Limit to 5000 chars
                    "Investment Thesis": analysis.get("investment_thesis", "")[:2000],
                    "Competitive Differentiation": analysis.get("differentiation", "")[:2000],
                    "Analysis Last Updated": time.strftime('%Y-%m-%d %H:%M:%S'),
                    "Analysis Notes": "Analysis completed successfully"
                }
            }
            
            # Add extracted company info if available
            if company_info.get("therapeutic_focus"):
                update_data["fields"]["AI Detected Therapeutic Focus"] = company_info["therapeutic_focus"][:500]
            
            response = requests.patch(url, headers=self.headers, json=update_data)
            response.raise_for_status()
            
            print("✅ Analysis saved to Airtable")
            
        except Exception as e:
            print(f"❌ Error saving analysis: {str(e)}")
            # Still mark as complete but with error note
            self.update_analysis_status(record_id, "Complete", f"Analysis finished but save error: {str(e)}")
    
    def process_all_pending_submissions(self):
        """Process all pending submissions"""
        
        print("🚀 AIRTABLE STARTUP ANALYSIS PROCESSOR")
        print("=" * 45)
        
        # Get pending submissions
        pending_records = self.get_pending_submissions()
        
        if not pending_records:
            print("✅ No pending submissions found")
            return
        
        print(f"\n📋 Processing {len(pending_records)} submissions...")
        
        results = []
        successful = 0
        failed = 0
        
        for i, record in enumerate(pending_records, 1):
            print(f"\n--- Processing {i}/{len(pending_records)} ---")
            
            result = self.analyze_startup_submission(record)
            results.append(result)
            
            if result["status"] == "success":
                successful += 1
            else:
                failed += 1
            
            # Brief pause between submissions
            time.sleep(2)
        
        # Final summary
        print(f"\n" + "="*50)
        print(f"🎉 PROCESSING COMPLETE")
        print(f"✅ Successful: {successful}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Total: {len(pending_records)}")
        
        if successful > 0:
            print(f"\n💡 Check your Airtable for updated analysis results!")
        
        return results

def setup_airtable_fields():
    """Helper function to show required Airtable fields"""
    
    print("📋 REQUIRED AIRTABLE FIELDS")
    print("=" * 30)
    print("\nAdd these fields to your Startup Submissions table:")
    print("\n📊 ANALYSIS FIELDS:")
    print("• AI Analysis Status (Single select: Pending, Processing, Complete, Error)")
    print("• Overall Score (Number, 0-10)")
    print("• Technology Score (Number, 0-10)")
    print("• Market Score (Number, 0-10)")
    print("• Team Score (Number, 0-10)")
    print("• AI Analysis Summary (Long text)")
    print("• Investment Thesis (Long text)")
    print("• Competitive Differentiation (Long text)")
    print("• AI Detected Therapeutic Focus (Single line text)")
    print("• Analysis Last Updated (Date)")
    print("• Analysis Notes (Long text)")
    
    print("\n📎 REQUIRED EXISTING FIELDS:")
    print("• Non-Confidential Pitch Deck (Attachment)")
    print("• Startup Name (Single line text)")
    print("• Pitch Deck Public URL (URL - optional)")

def main():
    """Main execution function"""
    
    import argparse
    parser = argparse.ArgumentParser(description="Airtable-integrated startup analysis")
    parser.add_argument("--setup", action="store_true", help="Show required Airtable field setup")
    parser.add_argument("--process", action="store_true", help="Process pending submissions")
    parser.add_argument("--record-id", help="Process specific record ID")
    
    args = parser.parse_args()
    
    if args.setup:
        setup_airtable_fields()
        return
    
    try:
        analyzer = AirtableStartupAnalyzer()
        
        if args.record_id:
            # Process specific record (for testing)
            print(f"🎯 Processing specific record: {args.record_id}")
            # You'd need to implement get_record_by_id method
            print("💡 Use --process to process all pending submissions")
        
        elif args.process:
            # Process all pending submissions
            analyzer.process_all_pending_submissions()
        
        else:
            # Show status
            pending = analyzer.get_pending_submissions()
            print(f"📊 Found {len(pending)} submissions pending analysis")
            print("💡 Use --process to start analysis or --setup to see required fields")
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    main()