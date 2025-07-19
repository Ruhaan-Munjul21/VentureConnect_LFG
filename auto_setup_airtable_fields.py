#!/usr/bin/env python3
"""
Automated Airtable Field Setup
Automatically creates all required fields for startup analysis in your Airtable base
"""

import requests
import json
import os
import time
from dotenv import load_dotenv

load_dotenv()

class AirtableFieldSetup:
    """Automatically sets up required fields in Airtable"""
    
    def __init__(self):
        self.airtable_api_key = os.getenv('AIRTABLE_API_KEY') or 'patPnlxR05peVEnUc.e5a8cfe5a3f88676da4b3c124c99ed46026b4f869bb5b6a3f54cd45db17fd58f'
        self.base_id = os.getenv('AIRTABLE_BASE_ID') or 'app768aQ07mCJoyu8'
        self.table_name = 'Startup Submissions'
        
        self.headers = {
            'Authorization': f'Bearer {self.airtable_api_key}',
            'Content-Type': 'application/json'
        }
        
        print("🔧 Airtable Field Setup Tool initialized")
    
    def get_table_info(self):
        """Get current table structure"""
        
        try:
            url = f"https://api.airtable.com/v0/meta/bases/{self.base_id}/tables"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            data = response.json()
            tables = data.get('tables', [])
            
            # Find target table
            target_table = None
            for table in tables:
                if table['name'] == self.table_name:
                    target_table = table
                    break
            
            if not target_table:
                print(f"❌ Table '{self.table_name}' not found")
                print(f"Available tables: {[t['name'] for t in tables]}")
                return None
            
            return target_table
            
        except Exception as e:
            print(f"❌ Error getting table info: {str(e)}")
            return None
    
    def create_field(self, table_id: str, field_config: dict):
        """Create a single field in the table"""
        
        try:
            url = f"https://api.airtable.com/v0/meta/bases/{self.base_id}/tables/{table_id}/fields"
            
            response = requests.post(url, headers=self.headers, json=field_config)
            
            if response.status_code == 200:
                field_data = response.json()
                print(f"✅ Created field: {field_config['name']}")
                return True
            else:
                error_data = response.json()
                print(f"❌ Failed to create field '{field_config['name']}': {error_data.get('error', {}).get('message', 'Unknown error')}")
                return False
                
        except Exception as e:
            print(f"❌ Error creating field '{field_config['name']}': {str(e)}")
            return False
    
    def get_required_fields(self):
        """Define all required fields with their configurations"""
        
        return [
            {
                "name": "AI Analysis Status",
                "type": "singleSelect",
                "options": {
                    "choices": [
                        {"name": "Pending", "color": "yellowBright"},
                        {"name": "Processing", "color": "blueBright"},
                        {"name": "Complete", "color": "greenBright"},
                        {"name": "Error", "color": "redBright"}
                    ]
                }
            },
            {
                "name": "Overall Score",
                "type": "number",
                "options": {
                    "precision": 1
                }
            },
            {
                "name": "Technology Score",
                "type": "number",
                "options": {
                    "precision": 1
                }
            },
            {
                "name": "Market Score",
                "type": "number",
                "options": {
                    "precision": 1
                }
            },
            {
                "name": "Team Score",
                "type": "number",
                "options": {
                    "precision": 1
                }
            },
            {
                "name": "Technology Score Reasoning",
                "type": "multilineText"
            },
            {
                "name": "Market Score Reasoning",
                "type": "multilineText"
            },
            {
                "name": "Team Score Reasoning",
                "type": "multilineText"
            },
            {
                "name": "AI Analysis Summary",
                "type": "multilineText"
            },
            {
                "name": "Investment Thesis",
                "type": "multilineText"
            },
            {
                "name": "Competitive Differentiation",
                "type": "multilineText"
            },
            {
                "name": "AI Detected Therapeutic Focus",
                "type": "singleLineText"
            },
            {
                "name": "Analysis Last Updated",
                "type": "dateTime",
                "options": {
                    "dateFormat": {
                        "name": "us"
                    },
                    "timeFormat": {
                        "name": "24hour"
                    },
                    "timeZone": "utc"
                }
            },
            {
                "name": "Analysis Notes",
                "type": "multilineText"
            }
        ]
    
    def setup_all_fields(self):
        """Automatically create all required fields"""
        
        print("🚀 AUTOMATIC AIRTABLE FIELD SETUP")
        print("=" * 40)
        
        # Get table info
        table_info = self.get_table_info()
        if not table_info:
            return False
        
        table_id = table_info['id']
        existing_fields = [field['name'] for field in table_info.get('fields', [])]
        
        print(f"📊 Target table: {self.table_name} ({table_id})")
        print(f"📋 Existing fields: {len(existing_fields)}")
        
        # Get required fields
        required_fields = self.get_required_fields()
        
        # Check which fields need to be created
        fields_to_create = []
        fields_already_exist = []
        
        for field_config in required_fields:
            if field_config['name'] in existing_fields:
                fields_already_exist.append(field_config['name'])
            else:
                fields_to_create.append(field_config)
        
        print(f"\n✅ Already exist ({len(fields_already_exist)}):")
        for field in fields_already_exist:
            print(f"  • {field}")
        
        if not fields_to_create:
            print(f"\n🎉 All required fields already exist!")
            return True
        
        print(f"\n🔧 Need to create ({len(fields_to_create)}):")
        for field in fields_to_create:
            print(f"  • {field['name']} ({field['type']})")
        
        # Confirm before proceeding
        print(f"\n⚠️  This will create {len(fields_to_create)} new fields in your Airtable.")
        confirm = input("Do you want to proceed? (y/N): ").lower().strip()
        
        if confirm != 'y':
            print("❌ Setup cancelled")
            return False
        
        # Create fields
        print(f"\n🔨 Creating fields...")
        successful = 0
        failed = 0
        
        for field_config in fields_to_create:
            print(f"\n📝 Creating: {field_config['name']}")
            
            if self.create_field(table_id, field_config):
                successful += 1
            else:
                failed += 1
            
            # Rate limiting - pause between requests
            time.sleep(1)
        
        # Summary
        print(f"\n" + "="*50)
        print(f"🎉 FIELD SETUP COMPLETE")
        print(f"✅ Successfully created: {successful}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Total fields in table: {len(existing_fields) + successful}")
        
        if successful > 0:
            print(f"\n💡 Your Airtable is now ready for startup analysis!")
            print(f"🚀 Next steps:")
            print(f"   1. Upload a pitch deck PDF to test")
            print(f"   2. Run: python airtable_analyzer.py --process")
            print(f"   3. Check your Airtable for analysis results!")
        
        return failed == 0
    
    def validate_setup(self):
        """Validate that all required fields exist"""
        
        print("🔍 Validating field setup...")
        
        table_info = self.get_table_info()
        if not table_info:
            return False
        
        existing_fields = [field['name'] for field in table_info.get('fields', [])]
        required_field_names = [field['name'] for field in self.get_required_fields()]
        
        missing_fields = []
        for field_name in required_field_names:
            if field_name not in existing_fields:
                missing_fields.append(field_name)
        
        if missing_fields:
            print(f"❌ Missing fields ({len(missing_fields)}):")
            for field in missing_fields:
                print(f"  • {field}")
            return False
        else:
            print(f"✅ All {len(required_field_names)} required fields are present!")
            return True
    
    def show_field_summary(self):
        """Show a summary of what fields will be created"""
        
        print("📋 REQUIRED FIELD SUMMARY")
        print("=" * 30)
        
        required_fields = self.get_required_fields()
        
        print(f"\nTotal fields to create: {len(required_fields)}")
        
        field_types = {}
        for field in required_fields:
            field_type = field['type']
            if field_type not in field_types:
                field_types[field_type] = []
            field_types[field_type].append(field['name'])
        
        for field_type, fields in field_types.items():
            print(f"\n📊 {field_type.upper()} ({len(fields)}):")
            for field in fields:
                print(f"  • {field}")
                
                # Show options for select fields
                if field_type == 'singleSelect' and 'options' in [f for f in required_fields if f['name'] == field][0]:
                    options = [f for f in required_fields if f['name'] == field][0]['options']['choices']
                    print(f"    Options: {', '.join([opt['name'] for opt in options])}")

def main():
    """Main execution function"""
    
    import argparse
    parser = argparse.ArgumentParser(description="Automatically setup Airtable fields for startup analysis")
    parser.add_argument("--create", action="store_true", help="Create all required fields")
    parser.add_argument("--validate", action="store_true", help="Validate existing field setup")
    parser.add_argument("--show", action="store_true", help="Show field summary without creating")
    parser.add_argument("--table", default="Startup Submissions", help="Table name (default: Startup Submissions)")
    
    args = parser.parse_args()
    
    try:
        setup = AirtableFieldSetup()
        setup.table_name = args.table
        
        if args.show:
            setup.show_field_summary()
        
        elif args.validate:
            if setup.validate_setup():
                print("\n🎉 Your Airtable setup is ready for startup analysis!")
            else:
                print("\n💡 Run --create to add missing fields")
        
        elif args.create:
            success = setup.setup_all_fields()
            if success:
                print("\n🎊 Setup complete! Your Airtable is ready for AI analysis!")
            else:
                print("\n⚠️ Some fields may not have been created. Check the errors above.")
        
        else:
            # Default: show status and options
            print("🔧 AIRTABLE FIELD SETUP TOOL")
            print("=" * 30)
            
            table_info = setup.get_table_info()
            if table_info:
                existing_fields = len(table_info.get('fields', []))
                required_fields = len(setup.get_required_fields())
                
                print(f"📊 Current table: {setup.table_name}")
                print(f"📋 Existing fields: {existing_fields}")
                print(f"🎯 Required fields: {required_fields}")
                
                if setup.validate_setup():
                    print(f"\n✅ All required fields exist!")
                else:
                    print(f"\n❌ Some fields are missing")
                
                print(f"\n💡 Available commands:")
                print(f"   --show     Show what fields will be created")
                print(f"   --create   Automatically create missing fields")
                print(f"   --validate Check if setup is complete")
    
    except KeyboardInterrupt:
        print("\n🛑 Setup cancelled")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    main()