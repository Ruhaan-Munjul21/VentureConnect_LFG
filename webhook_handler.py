#!/usr/bin/env python3
"""
Webhook Handler for Automatic Startup Analysis
Processes new Airtable submissions automatically via webhooks
"""

import json
import threading
import time
from flask import Flask, request, jsonify
from typing import Dict
import os
from dotenv import load_dotenv

# Import the Airtable analyzer
from airtable_analyzer import AirtableStartupAnalyzer

load_dotenv()

app = Flask(__name__)

class WebhookAnalysisHandler:
    """Handles webhook-triggered analysis"""
    
    def __init__(self):
        """Initialize the handler"""
        self.analyzer = AirtableStartupAnalyzer()
        self.processing_queue = []
        self.processing_lock = threading.Lock()
        
        print("✅ Webhook handler initialized")
    
    def queue_analysis(self, record_id: str, startup_name: str = ""):
        """Add record to processing queue"""
        
        with self.processing_lock:
            # Avoid duplicates
            if record_id not in [item['record_id'] for item in self.processing_queue]:
                self.processing_queue.append({
                    'record_id': record_id,
                    'startup_name': startup_name,
                    'queued_at': time.time()
                })
                print(f"📝 Queued for analysis: {startup_name or record_id}")
            else:
                print(f"⏭️ Already queued: {startup_name or record_id}")
    
    def process_queue_async(self):
        """Process queued items in background thread"""
        
        def worker():
            while True:
                with self.processing_lock:
                    if self.processing_queue:
                        item = self.processing_queue.pop(0)
                    else:
                        item = None
                
                if item:
                    record_id = item['record_id']
                    startup_name = item.get('startup_name', record_id)
                    
                    print(f"🔄 Processing: {startup_name}")
                    
                    try:
                        # Get the record data and analyze
                        record = self.get_record_by_id(record_id)
                        if record:
                            result = self.analyzer.analyze_startup_submission(record)
                            
                            if result['status'] == 'success':
                                print(f"✅ Analysis complete: {startup_name}")
                            else:
                                print(f"❌ Analysis failed: {startup_name} - {result.get('error', 'Unknown error')}")
                        else:
                            print(f"⚠️ Could not retrieve record: {record_id}")
                    
                    except Exception as e:
                        print(f"💥 Error processing {startup_name}: {str(e)}")
                
                else:
                    # No items in queue, wait a bit
                    time.sleep(5)
        
        # Start background worker thread
        worker_thread = threading.Thread(target=worker, daemon=True)
        worker_thread.start()
        print("🚀 Background analysis worker started")
    
    def get_record_by_id(self, record_id: str) -> Dict:
        """Get a specific record from Airtable"""
        
        try:
            import requests
            
            url = f"https://api.airtable.com/v0/{self.analyzer.base_id}/{self.analyzer.table_name}/{record_id}"
            
            response = requests.get(url, headers=self.analyzer.headers)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            print(f"❌ Error fetching record {record_id}: {str(e)}")
            return None

# Initialize handler
webhook_handler = WebhookAnalysisHandler()

@app.route('/webhook/airtable', methods=['POST'])
def airtable_webhook():
    """Handle Airtable webhook for new submissions"""
    
    try:
        # Verify webhook signature if needed (recommended for production)
        # webhook_signature = request.headers.get('X-Airtable-Webhook-Signature')
        
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data received"}), 400
        
        print(f"📨 Webhook received: {json.dumps(data, indent=2)}")
        
        # Process webhook payload
        if 'payloads' in data:
            for payload in data['payloads']:
                if payload.get('action') in ['create', 'update']:
                    changed_tables = payload.get('changedTablesById', {})
                    
                    for table_id, table_data in changed_tables.items():
                        if 'changedRecordsById' in table_data:
                            for record_id, record_data in table_data['changedRecordsById'].items():
                                
                                # Check if this is a new submission with PDF
                                current_fields = record_data.get('current', {}).get('fields', {})
                                previous_fields = record_data.get('previous', {}).get('fields', {})
                                
                                # Check if PDF was added or analysis status changed
                                pdf_added = (
                                    current_fields.get('Non-Confidential Pitch Deck') and 
                                    not previous_fields.get('Non-Confidential Pitch Deck')
                                )
                                
                                analysis_requested = (
                                    current_fields.get('AI Analysis Status') == 'Pending' and
                                    previous_fields.get('AI Analysis Status') != 'Pending'
                                )
                                
                                new_record = payload.get('action') == 'create' and current_fields.get('Non-Confidential Pitch Deck')
                                
                                if pdf_added or analysis_requested or new_record:
                                    startup_name = current_fields.get('Startup Name', 'Unknown')
                                    
                                    print(f"🔔 New analysis request: {startup_name}")
                                    print(f"   Trigger: {'PDF added' if pdf_added else 'Status changed' if analysis_requested else 'New record'}")
                                    
                                    # Queue for analysis
                                    webhook_handler.queue_analysis(record_id, startup_name)
        
        return jsonify({"status": "success", "message": "Webhook processed"}), 200
        
    except Exception as e:
        print(f"❌ Webhook error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/webhook/manual', methods=['POST'])
def manual_trigger():
    """Manual trigger for testing"""
    
    try:
        data = request.get_json()
        record_id = data.get('record_id')
        startup_name = data.get('startup_name', '')
        
        if not record_id:
            return jsonify({"error": "record_id required"}), 400
        
        print(f"🎯 Manual trigger for: {startup_name or record_id}")
        webhook_handler.queue_analysis(record_id, startup_name)
        
        return jsonify({
            "status": "success", 
            "message": f"Analysis queued for {startup_name or record_id}"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/status', methods=['GET'])
def get_status():
    """Get current processing status"""
    
    with webhook_handler.processing_lock:
        queue_size = len(webhook_handler.processing_queue)
        queue_items = [
            {
                'record_id': item['record_id'],
                'startup_name': item['startup_name'],
                'queued_minutes_ago': round((time.time() - item['queued_at']) / 60, 1)
            }
            for item in webhook_handler.processing_queue
        ]
    
    return jsonify({
        "status": "running",
        "queue_size": queue_size,
        "queued_items": queue_items,
        "timestamp": time.strftime('%Y-%m-%d %H:%M:%S')
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Startup Analysis Webhook Handler",
        "timestamp": time.strftime('%Y-%m-%d %H:%M:%S')
    })

def setup_airtable_webhook():
    """Instructions for setting up Airtable webhook"""
    
    print("\n📋 AIRTABLE WEBHOOK SETUP")
    print("=" * 30)
    print("\n1. Go to your Airtable base")
    print("2. Click 'Automations' in the top toolbar")
    print("3. Create a new automation with trigger:")
    print("   • When record matches conditions")
    print("   • Table: Startup Submissions")
    print("   • Conditions: 'Non-Confidential Pitch Deck' is not empty")
    print("\n4. Add action:")
    print("   • Send webhook")
    print(f"   • URL: {os.getenv('WEBHOOK_URL', 'https://your-server.com')}/webhook/airtable")
    print("   • Method: POST")
    print("   • Include all fields")
    print("\n5. Test the automation")
    print("\n💡 Alternative: Use the manual processing command:")
    print("   python airtable_analyzer.py --process")

def main():
    """Main execution function"""
    
    import argparse
    parser = argparse.ArgumentParser(description="Webhook handler for startup analysis")
    parser.add_argument("--setup", action="store_true", help="Show webhook setup instructions")
    parser.add_argument("--port", type=int, default=5000, help="Port to run webhook server")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind webhook server")
    
    args = parser.parse_args()
    
    if args.setup:
        setup_airtable_webhook()
        return
    
    try:
        # Start background processor
        webhook_handler.process_queue_async()
        
        print(f"🚀 Starting webhook server on {args.host}:{args.port}")
        print(f"📡 Webhook endpoint: http://{args.host}:{args.port}/webhook/airtable")
        print(f"📊 Status endpoint: http://{args.host}:{args.port}/status")
        print(f"🔧 Manual trigger: http://{args.host}:{args.port}/webhook/manual")
        print("\n💡 Use --setup to see Airtable webhook configuration")
        
        # Run Flask app
        app.run(host=args.host, port=args.port, debug=False)
        
    except KeyboardInterrupt:
        print("\n🛑 Webhook server stopped")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    main()