#!/usr/bin/env python3
"""
Simplified Airtable Analyzer
Works without the full PDF processing pipeline - focuses on analysis
"""

import requests
import json
import os
import time
import openai
from pathlib import Path
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

class SimplifiedAirtableAnalyzer:
    """Simplified version that works with existing infrastructure"""
    
    def __init__(self):
        """Initialize with minimal dependencies"""
        
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
        
        print("✅ Simplified Airtable Analyzer initialized")
    
    def get_pending_submissions(self) -> List[Dict]:
        """Get submissions that need analysis"""
        
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
            
            print(f"📊 Found {len(records)} submissions with PDF attachments pending analysis")
            return records
            
        except Exception as e:
            print(f"❌ Error fetching submissions: {str(e)}")
            return []
    
    def analyze_startup_from_pdf(self, record: Dict) -> Dict:
        """Analyze startup based on PDF attachment and form data"""
        
        record_id = record['id']
        fields = record['fields']
        startup_name = fields.get('Startup Name', 'Unknown Startup')
        pdf_attachments = fields.get('Non-Confidential Pitch Deck', [])
        
        print(f"\n🚀 Analyzing: {startup_name}")
        print(f"Record ID: {record_id}")
        
        if pdf_attachments:
            pdf_info = pdf_attachments[0]  # Get first PDF
            print(f"📄 PDF: {pdf_info.get('filename', 'Unknown')} ({pdf_info.get('size', 0)/1024/1024:.1f} MB)")
        
        # Update status
        self.update_analysis_status(record_id, "Processing", "Analysis in progress...")
        
        try:
            # Collect all available information
            company_info = {
                "name": startup_name,
                "has_pdf": bool(pdf_attachments),
                "pdf_filename": pdf_attachments[0].get('filename', '') if pdf_attachments else '',
                "drug_modality": fields.get('Drug Modality', ''),
                "disease_focus": fields.get('Disease Focus', ''),
                "investment_stage": fields.get('Investment Stage', ''),
                "geography": fields.get('Geography', ''),
                "investment_amount": fields.get('Investment Amount', ''),
                "description": fields.get('Company Description', ''),
                "contact": fields.get('Contact Name', ''),
                "email": fields.get('Email', '')
            }
            
            # Generate analysis using available data
            analysis = self.generate_comprehensive_analysis(company_info)
            
            # Save to Airtable
            self.save_analysis_to_airtable(record_id, analysis)
            
            return {
                "status": "success",
                "record_id": record_id,
                "startup_name": startup_name,
                "analysis": analysis
            }
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Analysis failed: {error_msg}")
            self.update_analysis_status(record_id, "Error", f"Analysis failed: {error_msg}")
            return {
                "status": "error",
                "record_id": record_id,
                "startup_name": startup_name,
                "error": error_msg
            }
    
    def generate_comprehensive_analysis(self, company_info: Dict) -> Dict:
        """Generate analysis using GPT-4 based on available information"""
        
        print("🔬 Generating comprehensive analysis...")
        
        prompt = f"""
You are a senior biotech investment analyst. Analyze this startup based on available information:

COMPANY INFORMATION:
- Name: {company_info['name']}
- Has PDF Pitch Deck: {'Yes - ' + company_info['pdf_filename'] if company_info['has_pdf'] else 'No'}
- Drug Modality: {company_info['drug_modality']}
- Disease Focus: {company_info['disease_focus']}
- Investment Stage: {company_info['investment_stage']}
- Geography: {company_info['geography']}
- Investment Amount Seeking: {company_info['investment_amount']}
- Description: {company_info['description']}

Provide a detailed analysis in the following structure:

## EXECUTIVE SUMMARY
Provide a 2-3 sentence executive summary of the company's position and prospects.

## SCORING WITH DETAILED REASONING (1-10 scale)

### TECHNOLOGY SCORE: [X]/10
**Reasoning:** Evaluate based on drug modality, innovation potential, and therapeutic approach. Consider the type of technology platform and its competitive advantages.

### MARKET SCORE: [X]/10
**Reasoning:** Assess market opportunity based on disease focus, geography, and investment stage. Consider market size, competition, and timing.

### TEAM SCORE: [X]/10
**Reasoning:** Evaluate based on available information about leadership and stage of company. Consider what team capabilities would be needed for this type of venture.

## STRENGTHS
List 3-4 potential strengths based on the information provided.

## WEAKNESSES & RISKS
Identify 3-4 potential weaknesses or risk factors.

## INVESTMENT THESIS
Provide a brief investment perspective based on available data.

## RECOMMENDATIONS
2-3 strategic recommendations for the company.

Note: This analysis is based on limited publicly available information. A full analysis would require reviewing the complete pitch deck and additional due diligence.
"""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2000,
                temperature=0.2
            )
            
            analysis_text = response.choices[0].message.content
            
            # Parse the analysis
            structured_analysis = self.parse_analysis(analysis_text)
            
            return structured_analysis
            
        except Exception as e:
            print(f"❌ GPT-4 analysis error: {str(e)}")
            raise
    
    def parse_analysis(self, analysis_text: str) -> Dict:
        """Parse GPT-4 analysis into structured format"""
        
        import re
        
        # Extract scores
        tech_match = re.search(r'### TECHNOLOGY SCORE:\s*(\d+(?:\.\d+)?)/10\s*\n\*\*Reasoning:\*\*(.*?)(?=###|##|\Z)', 
                              analysis_text, re.DOTALL | re.IGNORECASE)
        market_match = re.search(r'### MARKET SCORE:\s*(\d+(?:\.\d+)?)/10\s*\n\*\*Reasoning:\*\*(.*?)(?=###|##|\Z)', 
                                analysis_text, re.DOTALL | re.IGNORECASE)
        team_match = re.search(r'### TEAM SCORE:\s*(\d+(?:\.\d+)?)/10\s*\n\*\*Reasoning:\*\*(.*?)(?=###|##|\Z)', 
                              analysis_text, re.DOTALL | re.IGNORECASE)
        
        tech_score = float(tech_match.group(1)) if tech_match else 5.0
        market_score = float(market_match.group(1)) if market_match else 5.0
        team_score = float(team_match.group(1)) if team_match else 5.0
        
        tech_reasoning = tech_match.group(2).strip() if tech_match else "Score based on limited information"
        market_reasoning = market_match.group(2).strip() if market_match else "Score based on limited information"
        team_reasoning = team_match.group(2).strip() if team_match else "Score based on limited information"
        
        overall_score = round((tech_score + market_score + team_score) / 3, 1)
        
        # Extract sections
        exec_summary = ""
        if "## EXECUTIVE SUMMARY" in analysis_text:
            exec_match = re.search(r'## EXECUTIVE SUMMARY\s*\n(.*?)(?=##|\Z)', analysis_text, re.DOTALL)
            if exec_match:
                exec_summary = exec_match.group(1).strip()
        
        strengths = []
        if "## STRENGTHS" in analysis_text:
            strengths_match = re.search(r'## STRENGTHS\s*\n(.*?)(?=##|\Z)', analysis_text, re.DOTALL)
            if strengths_match:
                strengths_text = strengths_match.group(1)
                strengths = [line.strip('- •').strip() for line in strengths_text.split('\n') if line.strip().startswith(('-', '•'))]
        
        weaknesses = []
        if "## WEAKNESSES" in analysis_text:
            weak_match = re.search(r'## WEAKNESSES.*?\n(.*?)(?=##|\Z)', analysis_text, re.DOTALL)
            if weak_match:
                weak_text = weak_match.group(1)
                weaknesses = [line.strip('- •').strip() for line in weak_text.split('\n') if line.strip().startswith(('-', '•'))]
        
        investment_thesis = ""
        if "## INVESTMENT THESIS" in analysis_text:
            thesis_match = re.search(r'## INVESTMENT THESIS\s*\n(.*?)(?=##|\Z)', analysis_text, re.DOTALL)
            if thesis_match:
                investment_thesis = thesis_match.group(1).strip()
        
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
            "executive_summary": exec_summary,
            "strengths": strengths[:4],
            "weaknesses": weaknesses[:4],
            "investment_thesis": investment_thesis,
            "full_analysis": analysis_text
        }
    
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
            
            print(f"📝 Status updated: {status}")
            
        except Exception as e:
            print(f"⚠️ Failed to update status: {str(e)}")
    
    def save_analysis_to_airtable(self, record_id: str, analysis: Dict):
        """Save analysis results to Airtable"""
        
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
                    "Analysis Last Updated": time.strftime('%Y-%m-%d %H:%M:%S'),
                    "Analysis Notes": "Analysis based on available form data (no PDF processing)"
                }
            }
            
            response = requests.patch(url, headers=self.headers, json=update_data)
            response.raise_for_status()
            
            print("✅ Analysis saved to Airtable")
            
        except Exception as e:
            print(f"❌ Error saving analysis: {str(e)}")
            self.update_analysis_status(record_id, "Complete", f"Analysis complete but save error: {str(e)}")
    
    def process_all_pending_submissions(self):
        """Process all pending submissions"""
        
        print("🚀 AIRTABLE STARTUP ANALYZER (Simplified Version)")
        print("=" * 50)
        
        # Get pending submissions
        pending_records = self.get_pending_submissions()
        
        if not pending_records:
            print("✅ No pending submissions found")
            print("💡 Make sure startups have uploaded PDFs to the 'Non-Confidential Pitch Deck' field")
            return
        
        print(f"\n📋 Processing {len(pending_records)} submissions...")
        
        results = []
        successful = 0
        failed = 0
        
        for i, record in enumerate(pending_records, 1):
            print(f"\n--- Processing {i}/{len(pending_records)} ---")
            
            result = self.analyze_startup_from_pdf(record)
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

def main():
    """Main execution function"""
    
    import argparse
    parser = argparse.ArgumentParser(description="Simplified Airtable startup analysis")
    parser.add_argument("--process", action="store_true", help="Process pending submissions")
    parser.add_argument("--test", action="store_true", help="Test with first submission only")
    
    args = parser.parse_args()
    
    try:
        analyzer = SimplifiedAirtableAnalyzer()
        
        if args.test:
            # Process just one for testing
            pending = analyzer.get_pending_submissions()
            if pending:
                print(f"🧪 Testing with first submission...")
                result = analyzer.analyze_startup_from_pdf(pending[0])
                print(f"\n📊 Test result: {result['status']}")
            else:
                print("❌ No pending submissions to test")
        
        elif args.process:
            # Process all pending
            analyzer.process_all_pending_submissions()
        
        else:
            # Show status
            pending = analyzer.get_pending_submissions()
            print(f"📊 Found {len(pending)} submissions pending analysis")
            print(f"\n💡 Available commands:")
            print(f"   --process  Process all pending submissions")
            print(f"   --test     Test with first submission only")
            print(f"\n📝 Note: This simplified version analyzes based on form data")
            print(f"   For full PDF analysis, ensure all required modules are installed")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()