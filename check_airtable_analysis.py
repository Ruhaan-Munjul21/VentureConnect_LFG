#!/usr/bin/env python3
"""
Check Airtable Analysis
Quick check to see if analysis was saved to Airtable
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

def check_airtable_analysis():
    """Check if analysis exists in Airtable"""
    
    airtable_api_key = os.getenv('AIRTABLE_API_KEY')
    base_id = os.getenv('BASE_ID', 'app768aQ07mCJoyu8')
    table_name = 'Startup Submissions'
    
    headers = {
        'Authorization': f'Bearer {airtable_api_key}',
        'Content-Type': 'application/json'
    }
    
    # Get records
    url = f'https://api.airtable.com/v0/{base_id}/{table_name}'
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        records = data.get('records', [])
        
        for record in records:
            fields = record['fields']
            startup_name = fields.get('Startup Name', 'Unknown')
            
            if 'Protirna' in startup_name:
                print(f"🏢 Found: {startup_name}")
                
                # Check for analysis fields
                analysis_fields = {
                    'Overall Score': fields.get('Overall Score'),
                    'Technology Score': fields.get('Technology Score'),
                    'Market Score': fields.get('Market Score'),
                    'Team Score': fields.get('Team Score'),
                    'Strengths': fields.get('Strengths'),
                    'Weaknesses': fields.get('Weaknesses'),
                    'Executive Summary': fields.get('Executive Summary')
                }
                
                has_analysis = any(value for value in analysis_fields.values())
                
                if has_analysis:
                    print("✅ Analysis data found:")
                    for field, value in analysis_fields.items():
                        if value:
                            if isinstance(value, str) and len(value) > 100:
                                print(f"  {field}: {value[:100]}...")
                            else:
                                print(f"  {field}: {value}")
                else:
                    print("❌ No analysis data found - 422 errors prevented saving")
                    
                return has_analysis
        
        print("❌ Protirna record not found")
        return False
    else:
        print(f"❌ Error accessing Airtable: {response.status_code}")
        return False

if __name__ == "__main__":
    check_airtable_analysis()