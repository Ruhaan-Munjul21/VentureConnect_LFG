#!/usr/bin/env python3
"""
Get Analysis Results
Retrieve the completed analysis from Airtable or run again to save locally
"""

import json
from airtable_pdf_analyzer import AirtablePDFAnalyzer
from pathlib import Path

def get_analysis_results():
    """Get the analysis results"""
    
    print("📊 Retrieving analysis results...")
    
    try:
        analyzer = AirtablePDFAnalyzer()
        
        # Get submissions to check if analysis was saved
        pending = analyzer.get_pending_submissions()
        if pending:
            record = pending[0]
            startup_name = record['fields'].get('Startup Name', 'Unknown')
            
            # Check if analysis fields exist
            fields = record['fields']
            
            print(f"🏢 Company: {startup_name}")
            
            # Check for analysis fields
            analysis_fields = [
                'Overall Score', 'Technology Score', 'Market Score', 'Team Score',
                'Technology Score Reasoning', 'Market Score Reasoning', 'Team Score Reasoning',
                'Strengths', 'Weaknesses', 'Competitive Differentiation', 
                'Market Positioning', 'Investment Thesis'
            ]
            
            has_analysis = False
            for field in analysis_fields:
                if field in fields and fields[field]:
                    has_analysis = True
                    print(f"✅ {field}: {str(fields[field])[:100]}...")
            
            if not has_analysis:
                print("❌ No analysis found in Airtable - the 422 errors prevented saving")
                print("💡 But the analysis was completed! Let me run it again to save locally...")
                
                # Run analysis again but save locally this time
                return run_analysis_save_local(analyzer, record)
            else:
                print("✅ Analysis found in Airtable!")
                return True
                
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def run_analysis_save_local(analyzer, record):
    """Run analysis and save locally"""
    
    print("\n🚀 Running analysis to save locally...")
    
    try:
        # Run the analysis
        result = analyzer.analyze_startup_submission(record)
        
        if result['status'] == 'success':
            analysis = result['analysis']
            startup_name = result['startup_name'].replace(' ', '_').replace(',', '')
            
            # Create output directory
            output_dir = Path("analysis_results")
            output_dir.mkdir(exist_ok=True)
            
            # Save comprehensive analysis
            analysis_file = output_dir / f"{startup_name}_analysis.json"
            with open(analysis_file, 'w') as f:
                json.dump(analysis, f, indent=2, ensure_ascii=False)
            
            print(f"💾 Saved analysis: {analysis_file}")
            
            # Create readable report
            scores = analysis.get('overall_score', {})
            detailed_scores = analysis.get('detailed_scores', {})
            
            report = f"""
# STARTUP ANALYSIS REPORT: {result['startup_name']}

## OVERALL SCORING
- Overall Score: {scores.get('overall', 'N/A')}/10
- Technology: {scores.get('technology', 'N/A')}/10
- Market: {scores.get('market', 'N/A')}/10
- Team: {scores.get('team', 'N/A')}/10

## DETAILED SCORE REASONING

### TECHNOLOGY SCORE: {scores.get('technology', 'N/A')}/10
{detailed_scores.get('technology', {}).get('reasoning', 'No reasoning available')}

### MARKET SCORE: {scores.get('market', 'N/A')}/10
{detailed_scores.get('market', {}).get('reasoning', 'No reasoning available')}

### TEAM SCORE: {scores.get('team', 'N/A')}/10
{detailed_scores.get('team', {}).get('reasoning', 'No reasoning available')}

## EXECUTIVE SUMMARY
{analysis.get('executive_summary', 'No summary available')}

## STRENGTHS
"""
            
            for strength in analysis.get('strengths', []):
                report += f"• {strength}\n"
            
            report += f"""
## WEAKNESSES & RISKS
"""
            
            for weakness in analysis.get('weaknesses', []):
                report += f"• {weakness}\n"
            
            report += f"""
## COMPETITIVE DIFFERENTIATION
{analysis.get('differentiation', 'No differentiation analysis available')}

## MARKET POSITIONING
{analysis.get('market_positioning', 'No market positioning analysis available')}

## INVESTMENT THESIS
{analysis.get('investment_thesis', 'No investment thesis available')}
"""
            
            # Save report
            report_file = output_dir / f"{startup_name}_report.md"
            with open(report_file, 'w') as f:
                f.write(report)
            
            print(f"📄 Saved report: {report_file}")
            
            # Show summary
            print(f"\n📊 ANALYSIS SUMMARY:")
            print(f"🏢 Company: {result['startup_name']}")
            print(f"📈 Overall Score: {scores.get('overall', 'N/A')}/10")
            print(f"🔬 Technology: {scores.get('technology', 'N/A')}/10")
            print(f"📊 Market: {scores.get('market', 'N/A')}/10")
            print(f"👥 Team: {scores.get('team', 'N/A')}/10")
            
            exec_summary = analysis.get('executive_summary', '')
            if exec_summary:
                print(f"\n🎯 Executive Summary:")
                print(f"   {exec_summary[:300]}...")
            
            return True
        else:
            print(f"❌ Analysis failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Error running analysis: {e}")
        return False

if __name__ == "__main__":
    get_analysis_results()