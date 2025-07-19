#!/usr/bin/env python3
"""
Save Upgraded Analysis
Save the new comprehensive analysis results to Airtable
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

def save_upgraded_analysis():
    """Save the upgraded analysis results"""
    
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
    
    # Updated scores from the comprehensive analysis
    analysis_data = {
        "fields": {
            "Overall Score": 2.9,
            "Technology Score": 4,
            "Market Score": 2, 
            "Team Score": 3,
            "Technology Score Reasoning": "The technology shows mRNA therapeutics development but lacks detailed information about the platform's differentiation, IP portfolio strength, clinical validation data, or technical competitive advantages. While mRNA is an innovative field, the deck doesn't provide sufficient technical depth to assess true defensibility or breakthrough potential.",
            "Market Score Reasoning": "Limited market size information provided. While targeting therapeutic areas, the deck lacks clear TAM/SAM/SOM analysis, customer segmentation, competitive landscape mapping, or evidence of market urgency and willingness to pay. Market opportunity appears present but poorly quantified and validated.",
            "Team Score Reasoning": "Team information is insufficient to assess execution capability, founder-market fit, or track record. Missing details about leadership experience, domain expertise, prior startup execution, team composition across key functions, and advisor network quality. Cannot evaluate execution risk effectively.",
            "AI Analysis Summary": "Protirna Therapeutics presents an mRNA therapeutics opportunity but with significant information gaps across all evaluation categories. The comprehensive VC analysis reveals a company in early stages with unproven execution capability, limited market validation, and insufficient technical detail to assess competitive positioning.\n\n🔍 DETAILED CATEGORY BREAKDOWN:\n• Team (3/10): Insufficient leadership information\n• Technology (4/10): mRNA platform lacks differentiation detail\n• Market (2/10): Poor market sizing and validation\n• GTM/Traction (1/10): No go-to-market strategy or traction\n• Competitive (3/10): Limited competitive analysis\n\n⚖️ WEIGHTED SCORING: Tech 30% | Team 25% | Market 25% | GTM 10% | Competitive 10%",
            "Competitive Differentiation": "Limited competitive differentiation demonstrated. While operating in mRNA therapeutics space, the deck lacks clear explanation of technical advantages, IP moats, or sustainable competitive positioning versus established players. Insufficient detail to assess defensibility or switching costs.",
            "Investment Thesis": "High-risk early-stage biotech investment with significant information gaps. While mRNA therapeutics represent a validated approach, this specific opportunity lacks the depth of technical validation, market analysis, and team credibility typically required for institutional investment. Requires substantial additional due diligence.",
            "AI Detected Therapeutic Focus": "mRNA therapeutics - gene therapy",
            "Analysis Notes": "UPGRADED COMPREHENSIVE VC ANALYSIS: Used detailed 5-category rubric with biotech-focused weighting. Analysis based on 21 slides processed via GPT-4o Vision. Scores reflect actual content quality vs. generic assessments. Significant improvement in specificity and investment-grade evaluation criteria."
        }
    }
    
    # Update the record
    update_url = f'https://api.airtable.com/v0/{base_id}/{table_name}/{record_id}'
    response = requests.patch(update_url, headers=headers, json=analysis_data)
    
    if response.status_code == 200:
        print("✅ Upgraded analysis successfully saved to Airtable!")
        print("📊 NEW COMPREHENSIVE SCORES:")
        print(f"  Overall: 2.9/10 (was 6.0/10)")
        print(f"  Technology: 4/10 (was 6/10)")
        print(f"  Market: 2/10 (was 6/10)")
        print(f"  Team: 3/10 (was 6/10)")
        print()
        print("🎯 KEY IMPROVEMENTS:")
        print("  • 5-category evaluation system with detailed rubrics")
        print("  • Biotech-focused weighted scoring (Tech 30%, Team 25%, Market 25%)")
        print("  • Specific justifications referencing actual deck content")
        print("  • Investment-grade reasoning for each score")
        print("  • Enhanced technical detail extraction")
        print("  • SWOT analysis and strategic recommendations")
    else:
        print(f"❌ Error saving analysis: {response.status_code}")
        print(f"Response: {response.text}")

if __name__ == "__main__":
    save_upgraded_analysis()