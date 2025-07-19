#!/usr/bin/env python3
"""
Test Calibrated Scoring
Test the new calibrated rubric for funded companies
"""

from startup_analyzer import ComprehensiveStartupAnalyzer

def test_calibrated_scoring():
    """Test the calibrated scoring system"""
    
    print("🧪 Testing calibrated scoring for funded companies...")
    
    # Mock data representing a funded biotech company (like Protirna)
    mock_pitch_data = {
        "total_slides": 5,
        "analyses": [
            {
                "slide_number": 1,
                "analysis": "Protirna Therapeutics, Inc. - Series A funded mRNA therapeutics company. Founded by experienced biotech team with previous exits."
            },
            {
                "slide_number": 2,
                "analysis": "Technology: Proprietary LNP delivery platform for mRNA therapeutics. Multiple patents filed. Targeting genetic diseases with high unmet need."
            },
            {
                "slide_number": 3,
                "analysis": "Market: $8B rare disease gene therapy market growing 15% annually. Partnership discussions ongoing with major pharma companies."
            },
            {
                "slide_number": 4,
                "analysis": "Progress: IND-enabling studies completed. $2.5M NIH grant received. Clinical trial planned for 2025."
            },
            {
                "slide_number": 5,
                "analysis": "Funding: $15M Series A round. Use of funds: clinical development 60%, manufacturing 25%, team expansion 15%."
            }
        ]
    }
    
    analyzer = ComprehensiveStartupAnalyzer()
    
    print("🔬 Running calibrated analysis...")
    result = analyzer.analyze_startup_positioning(mock_pitch_data)
    
    if "error" in result:
        print(f"❌ Analysis failed: {result['error']}")
        return
    
    print("✅ Analysis completed with calibrated scoring!")
    
    # Show results
    scores = result.get("overall_score", {})
    detailed = result.get("detailed_scores", {})
    
    print(f"\n📊 CALIBRATED SCORES (for funded company):")
    print(f"Overall Score: {scores.get('overall', 'N/A')}/10")
    print(f"Expected range: 5.5-7.5 for typical funded biotech")
    print()
    
    print("🔍 CATEGORY BREAKDOWN:")
    for category, data in detailed.items():
        if isinstance(data, dict) and data.get('score'):
            score = data['score']
            print(f"{category.upper()}: {score}/10")
            if score >= 5:
                print(f"  ✅ Above baseline for funded company")
            else:
                print(f"  ⚠️  Below baseline - potential concern")
            if data.get('reasoning'):
                print(f"  Reasoning: {data['reasoning'][:100]}...")
            print()

if __name__ == "__main__":
    test_calibrated_scoring()