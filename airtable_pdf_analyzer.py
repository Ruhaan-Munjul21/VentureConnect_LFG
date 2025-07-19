#!/usr/bin/env python3
"""
Airtable PDF Analyzer using existing GPT-4o Vision components
Integrates your existing analyzer with Airtable workflow
"""

import requests
import json
import os
import time
import tempfile
import fitz  # PyMuPDF
from pathlib import Path
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Import your existing components
from gpt4o_analyzer import GPT4oBiotechAnalyzer
from startup_analyzer import ComprehensiveStartupAnalyzer

load_dotenv()

class AirtablePDFAnalyzer:
    """Integrates your existing PDF analysis pipeline with Airtable"""
    
    def __init__(self):
        """Initialize with your existing components"""
        
        # Airtable configuration
        self.airtable_api_key = os.getenv('AIRTABLE_API_KEY') or 'patPnlxR05peVEnUc.e5a8cfe5a3f88676da4b3c124c99ed46026b4f869bb5b6a3f54cd45db17fd58f'
        self.base_id = os.getenv('AIRTABLE_BASE_ID') or 'app768aQ07mCJoyu8'
        self.table_name = 'Startup Submissions'
        
        # OpenAI configuration
        openai_key = os.getenv('OPENAI_API_KEY')
        if not openai_key:
            raise ValueError("OpenAI API key required. Set OPENAI_API_KEY in .env file")
        
        # Initialize your existing analyzers
        self.vision_analyzer = GPT4oBiotechAnalyzer(openai_key)
        self.startup_analyzer = ComprehensiveStartupAnalyzer(openai_key)
        
        # Airtable headers
        self.headers = {
            'Authorization': f'Bearer {self.airtable_api_key}',
            'Content-Type': 'application/json'
        }
        
        print("✅ Airtable PDF Analyzer initialized with existing components")
    
    def get_pending_submissions(self) -> List[Dict]:
        """Get submissions with PDFs that need analysis"""
        
        print("🔍 Checking for pending submissions...")
        
        # Get records with PDF attachment but no analysis
        filter_formula = "AND({Non-Confidential Pitch Deck} != '', OR({AI Analysis Status} = '', {AI Analysis Status} = 'Pending'))"
        
        url = f"https://api.airtable.com/v0/{self.base_id}/{self.table_name}"
        params = {
            'filterByFormula': filter_formula,
            'maxRecords': 10
        }
        
        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            records = data.get('records', [])
            
            print(f"📊 Found {len(records)} submissions with PDFs pending analysis")
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
    
    def convert_pdf_to_images(self, pdf_path: str, output_dir: str) -> List[str]:
        """Convert PDF pages to images using PyMuPDF"""
        
        print(f"🔄 Converting PDF to images...")
        
        try:
            doc = fitz.open(pdf_path)
            image_paths = []
            pdf_name = Path(pdf_path).stem
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                # High resolution for better analysis
                mat = fitz.Matrix(300/72, 300/72)  # 300 DPI
                pix = page.get_pixmap(matrix=mat)
                
                # Use naming convention expected by your analyzer
                filename = f"{pdf_name}_slide_{page_num+1:02d}.png"
                image_path = os.path.join(output_dir, filename)
                pix.save(image_path)
                image_paths.append(image_path)
                
                print(f"  ✅ Converted slide {page_num+1}/{len(doc)}")
            
            doc.close()
            print(f"🎉 Converted {len(image_paths)} slides successfully!")
            return image_paths
            
        except Exception as e:
            print(f"❌ Error converting PDF: {str(e)}")
            return []
    
    def analyze_startup_submission(self, record: Dict) -> Dict:
        """Analyze a single startup submission using your existing pipeline"""
        
        record_id = record['id']
        fields = record['fields']
        startup_name = fields.get('Startup Name', 'Unknown Startup')
        
        print(f"\n🚀 Analyzing: {startup_name}")
        print(f"Record ID: {record_id}")
        
        # Update status
        self.update_analysis_status(record_id, "Processing", "Starting PDF analysis...")
        
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
            
            pdf_attachment = pdf_attachments[0]
            
            # Create temporary directory
            with tempfile.TemporaryDirectory() as temp_dir:
                # Create subdirectories
                slides_dir = os.path.join(temp_dir, "slides")
                analysis_dir = os.path.join(temp_dir, "analysis_results")
                os.makedirs(slides_dir, exist_ok=True)
                os.makedirs(analysis_dir, exist_ok=True)
                
                # Download PDF
                pdf_path = self.download_pdf_from_airtable(pdf_attachment, temp_dir)
                if not pdf_path:
                    raise ValueError("Failed to download PDF")
                
                # Convert to images
                self.update_analysis_status(record_id, "Processing", "Converting PDF to slides...")
                image_paths = self.convert_pdf_to_images(pdf_path, slides_dir)
                
                if not image_paths:
                    raise ValueError("Failed to convert PDF to images")
                
                print(f"📊 Analyzing {len(image_paths)} slides with GPT-4o Vision...")
                
                # Use your existing GPT-4o Vision analyzer
                # Temporarily change output directory
                original_output_dir = self.vision_analyzer.output_dir
                self.vision_analyzer.output_dir = Path(analysis_dir)
                
                try:
                    # Analyze all slides with your existing analyzer
                    self.update_analysis_status(record_id, "Processing", f"Analyzing {len(image_paths)} slides...")
                    vision_analyses = self.vision_analyzer.analyze_all_slides(slides_dir)
                    
                    # Get the analysis summary
                    summary = self.vision_analyzer.get_analysis_summary()
                    print(f"✅ Vision analysis complete: {summary['successful']}/{summary['total_slides']} slides")
                    
                    # Create pitch data structure for comprehensive analysis
                    pitch_data = {
                        "total_slides": len(vision_analyses),
                        "analyses": vision_analyses,
                        "summary": summary
                    }
                    
                    # Generate comprehensive analysis using your existing analyzer
                    self.update_analysis_status(record_id, "Processing", "Generating comprehensive analysis...")
                    comprehensive_analysis = self.startup_analyzer.analyze_startup_positioning(pitch_data)
                    
                    if "error" in comprehensive_analysis:
                        raise ValueError(f"Analysis failed: {comprehensive_analysis['error']}")
                    
                    print("✅ Comprehensive analysis complete!")
                    
                    analysis_result.update({
                        "status": "success",
                        "analysis": comprehensive_analysis,
                        "slides_processed": len(image_paths),
                        "vision_success_rate": summary['successful'] / summary['total_slides'],
                        "total_tokens": summary.get('total_tokens', 0)
                    })
                    
                finally:
                    # Restore original output directory
                    self.vision_analyzer.output_dir = original_output_dir
                
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Analysis failed: {error_msg}")
            analysis_result["error"] = error_msg
            self.update_analysis_status(record_id, "Error", f"Analysis failed: {error_msg}")
            return analysis_result
        
        # Save to Airtable
        self.save_analysis_to_airtable(record_id, comprehensive_analysis)
        
        return analysis_result
    
    def update_analysis_status(self, record_id: str, status: str, message: str = ""):
        """Update analysis status in Airtable"""
        
        try:
            url = f"https://api.airtable.com/v0/{self.base_id}/{self.table_name}/{record_id}"
            
            update_data = {
                "fields": {
                    "AI Analysis Status": status,
                    "Analysis Last Updated": time.strftime('%Y-%m-%d %H:%M:%S')
                }
            }
            
            if message:
                update_data["fields"]["Analysis Notes"] = message
            
            response = requests.patch(url, headers=self.headers, json=update_data)
            response.raise_for_status()
            
        except Exception as e:
            print(f"⚠️  Failed to update status: {str(e)}")
    
    def save_analysis_to_airtable(self, record_id: str, analysis: Dict):
        """Save comprehensive analysis to Airtable"""
        
        try:
            print("💾 Saving analysis to Airtable...")
            
            scores = analysis.get("overall_score", {})
            detailed_scores = analysis.get("detailed_scores", {})
            company_info = analysis.get("company_overview", {})
            
            # Prepare summary
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
            
            # Update record
            url = f"https://api.airtable.com/v0/{self.base_id}/{self.table_name}/{record_id}"
            
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
                    "AI Analysis Summary": analysis_summary[:5000],
                    "Investment Thesis": analysis.get("investment_thesis", "")[:2000],
                    "Competitive Differentiation": analysis.get("differentiation", "")[:2000],
                    "Analysis Last Updated": time.strftime('%Y-%m-%d %H:%M:%S'),
                    "Analysis Notes": "Complete PDF analysis using GPT-4o Vision"
                }
            }
            
            # Add therapeutic focus if detected
            if company_info.get("therapeutic_focus"):
                update_data["fields"]["AI Detected Therapeutic Focus"] = company_info["therapeutic_focus"][:500]
            
            response = requests.patch(url, headers=self.headers, json=update_data)
            response.raise_for_status()
            
            print("✅ Analysis saved to Airtable!")
            
        except Exception as e:
            print(f"❌ Error saving analysis: {str(e)}")
            self.update_analysis_status(record_id, "Complete", f"Analysis complete but save error: {str(e)}")
    
    def process_all_pending_submissions(self):
        """Process all pending submissions"""
        
        print("🚀 AIRTABLE PDF ANALYSIS (Using Existing Components)")
        print("=" * 50)
        
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
            print(f"\n{'='*50}")
            print(f"Processing {i}/{len(pending_records)}")
            print('='*50)
            
            result = self.analyze_startup_submission(record)
            results.append(result)
            
            if result["status"] == "success":
                successful += 1
            else:
                failed += 1
            
            # Pause between submissions
            if i < len(pending_records):
                print("\n⏳ Pausing before next submission...")
                time.sleep(3)
        
        # Final summary
        print(f"\n" + "="*50)
        print(f"🎉 PROCESSING COMPLETE")
        print(f"✅ Successful: {successful}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Total: {len(pending_records)}")
        
        if successful > 0:
            print(f"\n💡 Check your Airtable for detailed analysis results!")
        
        return results

def main():
    """Main execution function"""
    
    import argparse
    parser = argparse.ArgumentParser(description="Airtable PDF analysis using existing components")
    parser.add_argument("--process", action="store_true", help="Process all pending submissions")
    parser.add_argument("--test", action="store_true", help="Test with first submission only")
    
    args = parser.parse_args()
    
    try:
        # Check for PyMuPDF
        try:
            import fitz
        except ImportError:
            print("❌ PyMuPDF not installed. Installing...")
            os.system("pip install PyMuPDF")
            print("✅ Please run the script again")
            return
        
        # Check for required modules
        try:
            from gpt4o_analyzer import GPT4oBiotechAnalyzer
            from startup_analyzer import ComprehensiveStartupAnalyzer
        except ImportError:
            print("❌ Required modules not found!")
            print("💡 Make sure these files exist:")
            print("   - gpt4o_analyzer.py")
            print("   - startup_analyzer.py")
            print("\n📁 These should be from your PDF analyzer project")
            return
        
        analyzer = AirtablePDFAnalyzer()
        
        if args.test:
            # Test with one submission
            pending = analyzer.get_pending_submissions()
            if pending:
                print(f"🧪 Testing with first submission...")
                result = analyzer.analyze_startup_submission(pending[0])
                print(f"\n📊 Test result: {result['status']}")
                if result["status"] == "success":
                    print(f"📈 Overall Score: {result['analysis']['overall_score']['overall']}/10")
            else:
                print("❌ No pending submissions to test")
        
        elif args.process:
            # Process all pending
            analyzer.process_all_pending_submissions()
        
        else:
            # Show status
            pending = analyzer.get_pending_submissions()
            print(f"📊 Found {len(pending)} PDFs pending analysis")
            print(f"\n💡 Available commands:")
            print(f"   --process  Process all pending PDFs")
            print(f"   --test     Test with first PDF only")
            print(f"\n🔬 This version uses your existing:")
            print(f"   ✅ GPT-4o Vision analyzer (gpt4o_analyzer.py)")
            print(f"   ✅ Comprehensive startup analyzer (startup_analyzer.py)")
            print(f"   ✅ Full PDF processing with slide analysis")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()