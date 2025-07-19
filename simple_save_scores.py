#!/usr/bin/env python3
"""
Simple Save Scores
Save just the basic scores first to test
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

def simple_save_scores():
    """Save just the basic scores to test"""
    
    airtable_api_key = os.getenv('AIRTABLE_API_KEY')
    base_id = os.getenv('BASE_ID', 'app768aQ07mCJoyu8')
    table_name = 'Startup Submissions'
    
    headers = {
        'Authorization': f'Bearer {airtable_api_key}',
        'Content-Type': 'application/json'
    }
    
    # Find the Protirna record
    url = f'https://api.airtable.com/v0/{base_id}/{table_name}'
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Error accessing Airtable: {response.status_code}")
        return
    
    data = response.json()
    records = data.get('records', [])
    protirna_record = None
    
    for record in records:
        if 'Protirna' in record['fields'].get('Startup Name', ''):
            protirna_record = record
            break
    
    if not protirna_record:
        print("❌ Protirna record not found")
        return
    
    record_id = protirna_record['id']
    print(f"✅ Found Protirna record: {record_id}")
    
    # Simple update with just scores
    simple_data = {
        "fields": {
            "Overall Score": 6.0,
            "Technology Score": 6,
            "Market Score": 6, 
            "Team Score": 6
        }
    }
    
    # Update the record
    update_url = f'https://api.airtable.com/v0/{base_id}/{table_name}/{record_id}'
    response = requests.patch(update_url, headers=headers, json=simple_data)
    
    if response.status_code == 200:
        print("✅ Scores successfully saved to Airtable!")
        print("📊 Saved scores:")
        print(f"  Overall Score: 6.0/10")
        print(f"  Technology: 6/10")
        print(f"  Market: 6/10") 
        print(f"  Team: 6/10")
    else:
        print(f"❌ Error saving scores: {response.status_code}")
        print(f"Response: {response.text}")

if __name__ == "__main__":
    simple_save_scores()