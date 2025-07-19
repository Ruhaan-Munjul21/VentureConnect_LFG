#!/usr/bin/env python3
"""
Background Analysis Runner
Runs the PDF analysis and saves progress updates
"""

import time
import json
from datetime import datetime
from airtable_pdf_analyzer import AirtablePDFAnalyzer

def run_background_analysis():
    """Run analysis with progress logging"""
    
    log_file = "analysis_progress.log"
    
    def log_progress(message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_msg = f"[{timestamp}] {message}"
        print(log_msg)
        with open(log_file, "a") as f:
            f.write(log_msg + "\n")
    
    log_progress("🚀 Starting background analysis...")
    
    try:
        analyzer = AirtablePDFAnalyzer()
        
        # Get pending submissions
        pending = analyzer.get_pending_submissions()
        if not pending:
            log_progress("❌ No pending submissions found")
            return
        
        record = pending[0]
        startup_name = record['fields'].get('Startup Name', 'Unknown')
        log_progress(f"📄 Analyzing: {startup_name}")
        
        # Run analysis
        result = analyzer.analyze_startup_submission(record)
        
        if result['status'] == 'success':
            scores = result['analysis']['overall_score']
            log_progress(f"✅ Analysis complete!")
            log_progress(f"📊 Overall Score: {scores['overall']}/10")
            log_progress(f"🔬 Technology: {scores['technology']}/10")
            log_progress(f"📈 Market: {scores['market']}/10")
            log_progress(f"👥 Team: {scores['team']}/10")
            log_progress(f"💾 Results saved to Airtable!")
        else:
            log_progress(f"❌ Analysis failed: {result.get('error', 'Unknown error')}")
    
    except Exception as e:
        log_progress(f"💥 Error: {str(e)}")
        import traceback
        log_progress(f"Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    run_background_analysis()