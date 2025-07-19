#!/usr/bin/env python3
"""
Setup and Test Airtable Integration
Helps configure the startup analysis system with your Airtable base
"""

import requests
import json
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class AirtableIntegrationSetup:
    """Setup helper for Airtable integration"""
    
    def __init__(self):
        self.airtable_api_key = os.getenv('AIRTABLE_API_KEY') or 'patPnlxR05peVEnUc.e5a8cfe5a3f88676da4b3c124c99ed46026b4f869bb5b6a3f54cd45db17fd58f'
        self.base_id = os.getenv('AIRTABLE_BASE_ID') or 'app768aQ07mCJoyu8'
        self.headers = {
            'Authorization': f'Bearer {self.airtable_api_key}',
            'Content-Type': 'application/json'
        }
    
    def test_airtable_connection(self):
        """Test connection to Airtable"""
        
        print("🔗 Testing Airtable connection...")
        
        try:
            # Get base schema
            url = f"https://api.airtable.com/v0/meta/bases/{self.base_id}/tables"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            data = response.json()
            tables = data.get('tables', [])
            
            print(f"✅ Connected to Airtable base: {self.base_id}")
            print(f"📊 Found {len(tables)} tables:")
            
            for table in tables:
                print(f"  • {table['name']} ({table['id']})")
            
            return True
            
        except Exception as e:
            print(f"❌ Connection failed: {str(e)}")
            return False
    
    def check_required_fields(self, table_name: str = "Startup Submissions"):
        """Check if required fields exist in the table"""
        
        print(f"\n🔍 Checking required fields in '{table_name}'...")
        
        try:
            # Get table schema
            url = f"https://api.airtable.com/v0/meta/bases/{self.base_id}/tables"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            data = response.json()
            tables = data.get('tables', [])
            
            # Find the target table
            target_table = None
            for table in tables:
                if table['name'] == table_name:
                    target_table = table
                    break
            
            if not target_table:
                print(f"❌ Table '{table_name}' not found")
                return False
            
            # Check required fields
            fields = target_table.get('fields', [])
            field_names = [field['name'] for field in fields]
            
            required_fields = {
                'Non-Confidential Pitch Deck': 'multipleAttachments',
                'Startup Name': 'singleLineText',
                'AI Analysis Status': 'singleSelect',
                'Overall Score': 'number',
                'Technology Score': 'number',
                'Market Score': 'number', 
                'Team Score': 'number',
                'Technology Score Reasoning': 'multilineText',
                'Market Score Reasoning': 'multilineText',
                'Team Score Reasoning': 'multilineText',
                'AI Analysis Summary': 'multilineText',
                'Investment Thesis': 'multilineText',
                'Competitive Differentiation': 'multilineText',
                'AI Detected Therapeutic Focus': 'singleLineText',
                'Analysis Last Updated': 'dateTime',
                'Analysis Notes': 'multilineText'
            }
            
            missing_fields = []
            existing_fields = []
            
            for field_name, field_type in required_fields.items():
                if field_name in field_names:
                    existing_fields.append(field_name)
                else:
                    missing_fields.append((field_name, field_type))
            
            print(f"✅ Existing fields ({len(existing_fields)}):")
            for field in existing_fields:
                print(f"  • {field}")
            
            if missing_fields:
                print(f"\n❌ Missing fields ({len(missing_fields)}):")
                for field_name, field_type in missing_fields:
                    print(f"  • {field_name} ({field_type})")
                
                print(f"\n💡 Add these fields to your '{table_name}' table:")
                self.print_field_creation_guide(missing_fields)
            else:
                print(f"\n🎉 All required fields are present!")
            
            return len(missing_fields) == 0
            
        except Exception as e:
            print(f"❌ Error checking fields: {str(e)}")
            return False
    
    def print_field_creation_guide(self, missing_fields):
        """Print guide for creating missing fields"""
        
        field_type_map = {
            'singleLineText': 'Single line text',
            'multilineText': 'Long text',
            'multipleAttachments': 'Attachment',
            'singleSelect': 'Single select',
            'number': 'Number',
            'dateTime': 'Date and time'
        }
        
        for field_name, field_type in missing_fields:
            type_description = field_type_map.get(field_type, field_type)
            print(f"\n📝 {field_name}:")
            print(f"   Type: {type_description}")
            
            if field_name == 'AI Analysis Status':
                print("   Options: Pending, Processing, Complete, Error")
            elif 'Score' in field_name:
                print("   Format: Number (0-10)")
            elif field_name == 'Analysis Last Updated':
                print("   Include time: Yes")
    
    def test_analysis_workflow(self, record_limit: int = 1):
        """Test the analysis workflow with existing records"""
        
        print(f"\n🧪 Testing analysis workflow (limit: {record_limit})...")
        
        try:
            from airtable_analyzer import AirtableStartupAnalyzer
            
            analyzer = AirtableStartupAnalyzer()
            
            # Get test records
            records = analyzer.get_pending_submissions()
            
            if not records:
                print("❌ No records found for testing")
                print("💡 Upload a pitch deck PDF to test the workflow")
                return False
            
            test_records = records[:record_limit]
            print(f"📊 Found {len(test_records)} test records")
            
            for record in test_records:
                startup_name = record['fields'].get('Startup Name', 'Unknown')
                pdf_attachments = record['fields'].get('Non-Confidential Pitch Deck', [])
                
                print(f"\n🔬 Test record: {startup_name}")
                print(f"   Record ID: {record['id']}")
                print(f"   Has PDF: {'✅' if pdf_attachments else '❌'}")
                
                if pdf_attachments:
                    pdf_info = pdf_attachments[0]
                    print(f"   PDF: {pdf_info.get('filename', 'Unknown')} ({pdf_info.get('size', 0)/1024/1024:.1f} MB)")
            
            print(f"\n💡 To run analysis on these records:")
            print(f"   python airtable_analyzer.py --process")
            
            return True
            
        except Exception as e:
            print(f"❌ Test failed: {str(e)}")
            return False
    
    def create_sample_webhook_automation(self):
        """Provide instructions for webhook automation"""
        
        print(f"\n🔗 WEBHOOK AUTOMATION SETUP")
        print("=" * 35)
        
        webhook_url = os.getenv('WEBHOOK_URL', 'https://your-server.com')
        
        automation_config = {
            "name": "Auto-Analyze Startup Submissions",
            "trigger": {
                "type": "record_matches_conditions",
                "table": "Startup Submissions",
                "conditions": [
                    {
                        "field": "Non-Confidential Pitch Deck",
                        "operator": "is_not_empty"
                    },
                    {
                        "field": "AI Analysis Status",
                        "operator": "is",
                        "value": "Pending"
                    }
                ]
            },
            "action": {
                "type": "webhook",
                "url": f"{webhook_url}/webhook/airtable",
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": "{{all_fields}}"
            }
        }
        
        print("📋 Automation Configuration:")
        print(json.dumps(automation_config, indent=2))
        
        print(f"\n🚀 To set up webhook automation:")
        print(f"1. Go to your Airtable base")
        print(f"2. Click 'Automations' tab")
        print(f"3. Create automation with these settings:")
        print(f"   • Trigger: When record matches conditions")
        print(f"   • Table: Startup Submissions")
        print(f"   • Condition: Non-Confidential Pitch Deck is not empty")
        print(f"   • Action: Send webhook")
        print(f"   • URL: {webhook_url}/webhook/airtable")
        print(f"   • Method: POST")
        print(f"   • Body: Include all fields")

def main():
    """Main setup and testing function"""
    
    print("🚀 AIRTABLE INTEGRATION SETUP")
    print("=" * 35)
    
    setup = AirtableIntegrationSetup()
    
    # Test connection
    if not setup.test_airtable_connection():
        print("\n💡 Check your Airtable API key and Base ID in .env file")
        return
    
    # Check required fields
    fields_ok = setup.check_required_fields()
    
    if fields_ok:
        print(f"\n✅ Field setup complete!")
        
        # Test workflow
        setup.test_analysis_workflow()
        
        # Show webhook setup
        setup.create_sample_webhook_automation()
        
        print(f"\n🎉 Setup complete! You can now:")
        print(f"   • Process existing submissions: python airtable_analyzer.py --process")
        print(f"   • Start webhook server: python webhook_handler.py")
        print(f"   • Upload PDFs to Airtable for automatic analysis")
    
    else:
        print(f"\n⚠️ Please add the missing fields to your Airtable table first")
        print(f"💡 Then run this setup script again to verify")

if __name__ == "__main__":
    main()