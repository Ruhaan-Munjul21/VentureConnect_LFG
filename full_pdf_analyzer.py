#!/usr/bin/env python3
"""
Complete PDF Analysis System for Airtable
Processes actual PDF content using GPT-4 Vision
"""

import requests
import json
import os
import time
import openai
import base64
import tempfile
import fitz  # PyMuPDF
from pathlib import Path
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

class CompletePDFAnalyzer:
    """Full PDF processing and analysis for Airtable startups"""
    
    def __init__(self):
        """Initialize all components"""
        
        # Airtable configuration
        self.airtable_api_key = os.getenv('AIRTABLE_API_KEY') or 'patPnlxR05peVEnUc.e5a8cfe5a3f88676da4b3c124c99ed46026b4f869bb5b6a3f54cd45db17fd58f'
        self.base_id = os.getenv('AIRTABLE_BASE_ID') or 'app768aQ07mCJoyu8'
        self.table_name = 'Startup Submissions'
        
        # OpenAI configuration
        openai_key = os.getenv('OPENAI_API_KEY')
        if not openai_key:
            raise ValueError("OpenAI API key required. Set OPENAI_API_KEY in .env file")
        
        self.client = openai.OpenAI(api_key=openai_key)
        
        # Airtable headers
        self.headers = {
            'Authorization': f'Bearer {self.airtable_api_key}',
            'Content-Type': 'application/json'
        }
        
        print("✅ Complete PDF Analyzer initialized")
    
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
        """Convert PDF pages to images for GPT-4 Vision"""
        
        print(f"🔄 Converting PDF to images...")
        
        try:
            doc = fitz.open(pdf_path)
            image_paths = []
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                # Higher resolution for better OCR
                mat = fitz.Matrix(300/72, 300/72)  # 300 DPI
                pix = page.get_pixmap(matrix=mat)
                
                image_path = os.path.join(output_dir, f"slide_{page_num+1:02d}.png")
                pix.save(image_path)
                image_paths.append(image_path)
                
                print(f"  ✅ Converted slide {page_num+1}/{len(doc)}")
            
            doc.close()
            print(f"🎉 Converted {len(image_paths)} slides successfully!")
            return image_paths
            
        except Exception as e:
            print(f"❌ Error converting PDF: {str(e)}")
            return []
    
    def encode_image(self, image_path: str) -> str:
        """Encode image to base64 for GPT-4 Vision"""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    
    def analyze_slide_with_gpt4v(self, image_path: str, slide_number: int, total_slides: int) -> Dict:
        """Analyze a single slide with GPT-4 Vision"""
        
        print(f"🔬 Analyzing slide {slide_number}/{total_slides} with GPT-4 Vision...")
        
        # Create specialized prompt based on slide position
        prompt = self._create_slide_prompt(slide_number, total_slides)
        
        # Encode image
        base64_image = self.encode_image(image_path)
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1500,
                temperature=0.1
            )
            
            analysis = response.choices[0].message.content
            
            return {
                "slide_number": slide_number,
                "analysis": analysis,
                "tokens_used": response.usage.total_tokens
            }
            
        except Exception as e:
            print(f"  ❌ Error analyzing slide {slide_number}: {str(e)}")
            return {
                "slide_number": slide_number,
                "analysis": f"Error: {str(e)}",
                "tokens_used": 0
            }
    
    def _create_slide_prompt(self, slide_number: int, total_slides: int) -> str:
        """Create specialized prompt based on slide position"""
        
        base_prompt = """
You are analyzing a biotech/startup pitch deck slide. Extract ALL key information including:

- Company name, logo, contact info
- Technology details (drug type, mechanism, platform)
- Disease/therapeutic areas
- Market size and opportunity
- Clinical trial data and results
- Team members and credentials
- Financial information (funding, valuation)
- Competitive advantages
- Intellectual property
- Partnerships and collaborations
- Milestones and timeline

Be extremely detailed and specific. Extract all text, numbers, and data visible on the slide.
"""
        
        # Add slide-specific guidance
        if slide_number == 1:
            return base_prompt + "\nThis is the TITLE SLIDE. Focus on company name, tagline, and contact information."
        elif slide_number == 2:
            return base_prompt + "\nThis is likely the PROBLEM/OPPORTUNITY slide. Focus on the problem being solved."
        elif slide_number <= 5:
            return base_prompt + "\nThis is likely about the SOLUTION/TECHNOLOGY. Focus on the scientific approach."
        elif slide_number >= total_slides - 2:
            return base_prompt + "\nThis is near the end - likely TEAM, FUNDING ASK, or CONTACT info."
        else:
            return base_prompt
    
    def analyze_full_pitch_deck(self, slide_analyses: List[Dict]) -> Dict:
        """Generate comprehensive analysis from all slides"""
        
        print("📈 Generating comprehensive startup analysis...")
        
        # Combine all slide analyses
        combined_content = "\n\n".join([
            f"SLIDE {s['slide_number']}:\n{s['analysis']}" 
            for s in slide_analyses if not s['analysis'].startswith('Error:')
        ])
        
        # Create comprehensive analysis prompt
        prompt = f"""
Based on this complete pitch deck analysis, provide a comprehensive startup evaluation:

{combined_content}

Provide a detailed analysis in the following structure:

## EXECUTIVE SUMMARY
Provide a 2-3 sentence executive summary of the company's position and prospects.

## SCORING WITH DETAILED REASONING (1-10 scale)

### TECHNOLOGY SCORE: [X]/10
**Reasoning:** Detailed explanation based on:
- Scientific innovation and differentiation seen in the deck
- Platform technology strength and validation
- Clinical/preclinical data quality
- IP protection and competitive advantages
- Technical risks and development stage

### MARKET SCORE: [X]/10
**Reasoning:** Detailed explanation based on:
- Market size and growth potential shown in deck
- Competitive positioning and landscape analysis
- Go-to-market strategy clarity
- Regulatory pathway and timeline
- Commercial viability assessment

### TEAM SCORE: [X]/10
**Reasoning:** Detailed explanation based on:
- Leadership team experience and credentials
- Scientific advisory board strength
- Previous successes and track record
- Team completeness for current stage
- Domain expertise alignment

## STRENGTHS
List 4-5 key strengths based on the pitch deck.

## WEAKNESSES & RISKS
Identify 3-4 key weaknesses or risks.

## COMPETITIVE DIFFERENTIATION
What makes this company unique based on their pitch.

## INVESTMENT THESIS
Investment perspective based on the pitch deck.

## RECOMMENDATIONS
3-4 strategic recommendations.

Be specific and reference actual content from the pitch deck.
"""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=3000,
                temperature=0.2
            )
            
            analysis_text = response.choices[0].message.content
            
            # Parse and structure the analysis
            return self._parse_comprehensive_analysis(analysis_text)
            
        except Exception as e:
            print(f"❌ Error generating comprehensive analysis: {str(e)}")
            raise
    
    def _parse_comprehensive_analysis(self, analysis_text: str) -> Dict:
        """Parse the comprehensive analysis into structured format"""
        
        import re
        
        # Extract scores with reasoning
        tech_match = re.search(r'### TECHNOLOGY SCORE:\s*(\d+(?:\.\d+)?)/10\s*\n\*\*Reasoning:\*\*(.*?)(?=###|##|\Z)', 
                              analysis_text, re.DOTALL | re.IGNORECASE)
        market_match = re.search(r'### MARKET SCORE:\s*(\d+(?:\.\d+)?)/10\s*\n\*\*Reasoning:\*\*(.*?)(?=###|##|\Z)', 
                                analysis_text, re.DOTALL | re.IGNORECASE)
        team_match = re.search(r'### TEAM SCORE:\s*(\d+(?:\.\d+)?)/10\s*\n\*\*Reasoning:\*\*(.*?)(?=###|##|\Z)', 
                              analysis_text, re.DOTALL | re.IGNORECASE)
        
        tech_score = float(tech_match.group(1)) if tech_match else 6.0
        market_score = float(market_match.group(1)) if market_match else 6.0
        team_score = float(team_match.group(1)) if team_match else 6.0
        
        tech_reasoning = tech_match.group(2).strip() if tech_match else "Unable to extract reasoning"
        market_reasoning = market_match.group(2).strip() if market_match else "Unable to extract reasoning"
        team_reasoning = team_match.group(2).strip() if team_match else "Unable to extract reasoning"
        
        overall_score = round((tech_score + market_score + team_score) / 3, 1)
        
        # Extract other sections
        sections = self._extract_sections(analysis_text)
        
        return {
            "overall_score": {
                "overall": overall_score,
                "technology": tech_score,
                "market": market_score,
                "team": team_score,
                "scale": "1-10 (10 = highest)"
            },
            "detailed_scores": {
                "technology": {"score": tech_score, "reasoning": tech_reasoning},
                "market": {"score": market_score, "reasoning": market_reasoning},
                "team": {"score": team_score, "reasoning": team_reasoning}
            },
            "executive_summary": sections.get("executive_summary", ""),
            "strengths": sections.get("strengths", []),
            "weaknesses": sections.get("weaknesses", []),
            "differentiation": sections.get("differentiation", ""),
            "investment_thesis": sections.get("investment_thesis", ""),
            "recommendations": sections.get("recommendations", []),
            "full_analysis": analysis_text
        }
    
    def _extract_sections(self, analysis_text: str) -> Dict:
        """Extract various sections from analysis text"""
        
        import re
        
        sections = {}
        
        # Executive Summary
        exec_match = re.search(r'## EXECUTIVE SUMMARY\s*\n(.*?)(?=##|\Z)', analysis_text, re.DOTALL)
        if exec_match:
            sections["executive_summary"] = exec_match.group(1).strip()
        
        # Strengths
        strengths_match = re.search(r'## STRENGTHS\s*\n(.*?)(?=##|\Z)', analysis_text, re.DOTALL)
        if strengths_match:
            strengths_text = strengths_match.group(1)
            sections["strengths"] = [line.strip('- •').strip() for line in strengths_text.split('\n') 
                                   if line.strip() and line.strip().startswith(('-', '•'))]
        
        # Weaknesses
        weak_match = re.search(r'## WEAKNESSES.*?\n(.*?)(?=##|\Z)', analysis_text, re.DOTALL)
        if weak_match:
            weak_text = weak_match.group(1)
            sections["weaknesses"] = [line.strip('- •').strip() for line in weak_text.split('\n') 
                                    if line.strip() and line.strip().startswith(('-', '•'))]
        
        # Differentiation
        diff_match = re.search(r'## COMPETITIVE DIFFERENTIATION\s*\n(.*?)(?=##|\Z)', analysis_text, re.DOTALL)
        if diff_match:
            sections["differentiation"] = diff_match.group(1).strip()
        
        # Investment Thesis
        thesis_match = re.search(r'## INVESTMENT THESIS\s*\n(.*?)(?=##|\Z)', analysis_text, re.DOTALL)
        if thesis_match:
            sections["investment_thesis"] = thesis_match.group(1).strip()
        
        # Recommendations
        rec_match = re.search(r'## RECOMMENDATIONS\s*\n(.*?)(?=##|\Z)', analysis_text, re.DOTALL)
        if rec_match:
            rec_text = rec_match.group(1)
            sections["recommendations"] = [line.strip('- •').strip() for line in rec_text.split('\n') 
                                         if line.strip() and line.strip().startswith(('-', '•'))]
        
        return sections
    
    def analyze_startup_submission(self, record: Dict) -> Dict:
        """Analyze a single startup submission with full PDF processing"""
        
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
                # Download PDF
                pdf_path = self.download_pdf_from_airtable(pdf_attachment, temp_dir)
                if not pdf_path:
                    raise ValueError("Failed to download PDF")
                
                # Convert to images
                self.update_analysis_status(record_id, "Processing", "Converting PDF to slides...")
                image_paths = self.convert_pdf_to_images(pdf_path, temp_dir)
                
                if not image_paths:
                    raise ValueError("Failed to convert PDF to images")
                
                print(f"📊 Analyzing {len(image_paths)} slides...")
                
                # Analyze each slide with GPT-4 Vision
                slide_analyses = []
                total_tokens = 0
                
                for i, image_path in enumerate(image_paths, 1):
                    self.update_analysis_status(record_id, "Processing", f"Analyzing slide {i}/{len(image_paths)}...")
                    
                    slide_analysis = self.analyze_slide_with_gpt4v(image_path, i, len(image_paths))
                    slide_analyses.append(slide_analysis)
                    total_tokens += slide_analysis.get("tokens_used", 0)
                    
                    # Brief pause to avoid rate limits
                    if i < len(image_paths):
                        time.sleep(1)
                
                print(f"💰 Total tokens used: {total_tokens}")
                
                # Generate comprehensive analysis
                self.update_analysis_status(record_id, "Processing", "Generating comprehensive analysis...")
                comprehensive_analysis = self.analyze_full_pitch_deck(slide_analyses)
                
                print("✅ Analysis complete!")
                
                analysis_result.update({
                    "status": "success",
                    "analysis": comprehensive_analysis,
                    "slides_processed": len(image_paths),
                    "total_tokens": total_tokens
                })
                
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
                    "Analysis Notes": "Complete PDF analysis with GPT-4 Vision"
                }
            }
            
            response = requests.patch(url, headers=self.headers, json=update_data)
            response.raise_for_status()
            
            print("✅ Analysis saved to Airtable!")
            
        except Exception as e:
            print(f"❌ Error saving analysis: {str(e)}")
            self.update_analysis_status(record_id, "Complete", f"Analysis complete but save error: {str(e)}")
    
    def process_all_pending_submissions(self):
        """Process all pending submissions"""
        
        print("🚀 COMPLETE PDF ANALYSIS SYSTEM")
        print("=" * 40)
        
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
    parser = argparse.ArgumentParser(description="Complete PDF analysis for Airtable startups")
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
        
        analyzer = CompletePDFAnalyzer()
        
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
            print(f"\n🔬 This version:")
            print(f"   ✅ Downloads and processes actual PDFs")
            print(f"   ✅ Converts to images for GPT-4 Vision")
            print(f"   ✅ Analyzes each slide individually")
            print(f"   ✅ Generates comprehensive analysis with scores")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()