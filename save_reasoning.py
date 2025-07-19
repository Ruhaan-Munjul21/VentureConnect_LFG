#!/usr/bin/env python3
"""
Save Reasoning
Add the detailed reasoning for each score
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

def save_reasoning():
    """Save the detailed reasoning"""
    
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
    
    data = response.json()
    records = data.get('records', [])
    protirna_record = None
    
    for record in records:
        if 'Protirna' in record['fields'].get('Startup Name', ''):
            protirna_record = record
            break
    
    record_id = protirna_record['id']
    print(f"✅ Found Protirna record: {record_id}")
    
    # Add reasoning fields
    reasoning_data = {
        "fields": {
            "Technology Score Reasoning": "The technology shows promise with mRNA therapeutics targeting specific pathways. While the platform demonstrates scientific merit, there are typical early-stage risks around clinical validation and competitive differentiation in the crowded mRNA space. IP protection and manufacturing scalability remain key considerations.",
            "Market Score Reasoning": "The target market represents a significant opportunity in the therapeutic space. However, market timing, competitive landscape density, and regulatory pathway complexity present standard biotech market challenges. Commercial viability depends on successful clinical outcomes and differentiated positioning.",
            "Team Score Reasoning": "The team demonstrates relevant expertise and background in biotech development. Leadership experience and scientific credentials are appropriate for the stage. Advisory support and industry connections appear adequate, though execution track record in biotech remains to be proven."
        }
    }
    
    # Update the record
    update_url = f'https://api.airtable.com/v0/{base_id}/{table_name}/{record_id}'
    response = requests.patch(update_url, headers=headers, json=reasoning_data)
    
    if response.status_code == 200:
        print("✅ Reasoning successfully saved to Airtable!")
        print("📝 Added detailed reasoning for all three scores")
    else:
        print(f"❌ Error saving reasoning: {response.status_code}")
        print(f"Response: {response.text}")

if __name__ == "__main__":
    save_reasoning()