#!/usr/bin/env python3
"""
Test Upgraded Analysis
Test the new comprehensive VC analysis system
"""

import json
from startup_analyzer import ComprehensiveStartupAnalyzer

def test_upgraded_analysis():
    """Test the upgraded analysis with mock data"""
    
    print("🧪 Testing upgraded comprehensive VC analysis...")
    
    # Create realistic mock data for testing
    mock_pitch_data = {
        "total_slides": 5,
        "analyses": [
            {
                "slide_number": 1,
                "analysis": "Protirna Therapeutics, Inc. - mRNA therapeutics company founded by Dr. Sarah Chen (PhD Stanford, former Moderna scientist) and Dr. Michael Rodriguez (MD/PhD Harvard, 10 years pharma experience at Pfizer). Targeting rare genetic diseases with proprietary delivery platform."
            },
            {
                "slide_number": 2,
                "analysis": "Problem: Current gene therapies have poor delivery efficiency (only 5-10% reach target cells). Our proprietary lipid nanoparticle platform achieves 85% delivery efficiency in preclinical studies. Platform validated in 3 disease models. Filed 4 patents, 2 granted."
            },
            {
                "slide_number": 3,
                "analysis": "Market: Rare disease gene therapy market is $8.2B globally, growing 15% annually. TAM $45B by 2030. Target initial indication: Duchenne Muscular Dystrophy (DMD) - 300,000 patients globally, current treatments only $2-5B market but poor efficacy."
            },
            {
                "slide_number": 4,
                "analysis": "Traction: Completed successful IND-enabling studies. Partnership discussions with Roche and Novartis. Received $2.5M NIH SBIR grant. 3 patients enrolled in compassionate use program showing 40% improvement in muscle function."
            },
            {
                "slide_number": 5,
                "analysis": "Funding: Raising $15M Series A. Use of funds: 60% clinical trial execution, 25% manufacturing scale-up, 15% team expansion. Timeline: IND filing Q2 2025, Phase 1 start Q4 2025. Team of 12 including 3 PhDs and regulatory consultant."
            }
        ]
    }
    
    # Test the analysis
    analyzer = ComprehensiveStartupAnalyzer()
    
    print("🔬 Running comprehensive analysis...")
    result = analyzer.analyze_startup_positioning(mock_pitch_data)
    
    if "error" in result:
        print(f"❌ Analysis failed: {result['error']}")
        return
    
    print("✅ Analysis completed!")
    
    # Show results
    scores = result.get("overall_score", {})
    detailed = result.get("detailed_scores", {})
    
    print(f"\n📊 COMPREHENSIVE SCORING:")
    print(f"Overall Score: {scores.get('overall', 'N/A')}/10")
    print(f"Weighting: {scores.get('weighting', 'N/A')}")
    print()
    
    print("🔍 DETAILED CATEGORY SCORES:")
    for category, data in detailed.items():
        if isinstance(data, dict) and data.get('score'):
            print(f"{category.upper()}: {data['score']}/10")
            if data.get('justification'):
                print(f"  Justification: {data['justification'][:150]}...")
            if data.get('reasoning'):
                print(f"  Reasoning: {data['reasoning'][:150]}...")
            print()
    
    # Show SWOT
    swot = result.get("swot_analysis", {})
    if swot:
        print("📈 SWOT ANALYSIS:")
        for key, value in swot.items():
            if value:
                print(f"{key.upper()}: {value[:200]}...")
        print()
    
    # Show recommendations
    recommendations = result.get("strategic_recommendations", [])
    if recommendations:
        print("🎯 STRATEGIC RECOMMENDATIONS:")
        for i, rec in enumerate(recommendations[:3], 1):
            print(f"{i}. {rec[:150]}...")
        print()
    
    # Save detailed results
    with open("test_analysis_result.json", "w") as f:
        json.dump(result, f, indent=2)
    
    print("💾 Saved detailed results to test_analysis_result.json")
    
    return True

if __name__ == "__main__":
    test_upgraded_analysis()