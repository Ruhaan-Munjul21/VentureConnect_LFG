#!/usr/bin/env python3
"""
Debug Analysis Output
Check what the actual GPT-4 output looks like
"""

import json
from startup_analyzer import ComprehensiveStartupAnalyzer

def debug_analysis_output():
    """Debug the actual analysis output format"""
    
    print("🐛 Debugging analysis output format...")
    
    # Simple mock data
    mock_pitch_data = {
        "total_slides": 2,
        "analyses": [
            {
                "slide_number": 1,
                "analysis": "Protirna Therapeutics - mRNA company with $15M Series A funding round. Founded by PhD team from Stanford."
            },
            {
                "slide_number": 2,
                "analysis": "Technology: proprietary lipid nanoparticles for gene therapy delivery. 4 patents filed. Targeting DMD market worth $8B."
            }
        ]
    }
    
    # Temporarily modify the analyzer to capture raw output
    analyzer = ComprehensiveStartupAnalyzer()
    
    # Extract content
    optimized_content = analyzer._optimize_slide_content(mock_pitch_data)
    print(f"📝 Optimized content: {optimized_content}")
    
    # Create prompt
    company_info = {"name": "Protirna Therapeutics"}
    tech_info = {"drug_modality": "mRNA", "mechanism_of_action": "gene therapy"}
    market_info = {"target_market": "DMD"}
    team_info = {"leadership_team": ["PhD team"]}
    funding_info = {"funding_stage": "Series A"}
    
    prompt = analyzer._create_optimized_analysis_prompt(
        company_info, tech_info, market_info, team_info, funding_info, optimized_content
    )
    
    print(f"\n📋 PROMPT LENGTH: {len(prompt)} chars")
    print(f"🎯 Estimated tokens: {len(prompt) // 4}")
    
    # Make the API call manually to see raw response
    try:
        response = analyzer.client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=3000,
            temperature=0.2
        )
        
        raw_analysis = response.choices[0].message.content
        print(f"\n📜 RAW GPT-4 OUTPUT:")
        print("=" * 80)
        print(raw_analysis)
        print("=" * 80)
        
        # Save raw output for inspection
        with open("raw_analysis_output.txt", "w") as f:
            f.write(raw_analysis)
        
        print(f"\n💾 Saved raw output to raw_analysis_output.txt")
        
        # Test parsing
        detailed = analyzer._extract_detailed_scores(raw_analysis)
        print(f"\n🔍 PARSED SCORES:")
        for category, data in detailed.items():
            print(f"{category}: {data}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    debug_analysis_output()