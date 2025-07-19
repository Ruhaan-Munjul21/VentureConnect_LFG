#!/usr/bin/env python3
"""
Test Parsing Fix
Test the fixed regex parsing with the actual GPT-4 output
"""

from startup_analyzer import ComprehensiveStartupAnalyzer

def test_parsing_fix():
    """Test the fixed parsing with actual output"""
    
    print("🔧 Testing fixed parsing...")
    
    # Use the actual GPT-4 output from our debug
    raw_output = """🔹 CATEGORY 1: TEAM (Score: 3)
Justification: The pitch deck only identifies one team member, who holds a PhD. 
Reasoning: While a PhD suggests a high level of expertise, the lack of information about the team member's specific role, experience, and how they fit into the broader team (if there is one) is concerning. The team score is low due to the lack of information about the team's composition, track record, and founder-market fit.

🔹 CATEGORY 2: PRODUCT & TECHNOLOGY (Score: 7)
Justification: The company is working on mRNA targeting gene therapy, a cutting-edge technology in the biotech industry. They also have a patent, suggesting some level of defensibility.
Reasoning: mRNA technology is innovative and has high potential, especially in the current healthcare landscape. The existence of a patent suggests a level of technical differentiation and defensibility. However, without more information on the product's stage, it's hard to give a higher score.

🔹 CATEGORY 3: MARKET OPPORTUNITY (Score: 2)
Justification: The deck mentions DMD (Duchenne Muscular Dystrophy) as the market, but provides no further information.
Reasoning: While DMD is a serious condition with a potential market, the deck provides no information on the size of this market, segmentation, or the company's strategy to capture it. This lack of detail makes it difficult to assess the market opportunity.

🔹 CATEGORY 4: GO-TO-MARKET & TRACTION (Score: 1)
Justification: The deck provides no information on go-to-market strategy or traction.
Reasoning: Without information on the company's GTM strategy, customer acquisition plans, or any traction they've achieved so far, it's impossible to assess this category. 

🔹 CATEGORY 5: COMPETITIVE POSITIONING & DEFENSIBILITY (Score: 3)
Justification: The deck mentions a patent, suggesting some level of defensibility.
Reasoning: While a patent can provide a competitive edge, without information on the competitive landscape, the company's unique selling proposition, or how they plan to maintain their competitive position, it's hard to give a higher score.

📊 SWOT SUMMARY:
Strengths: Cutting-edge mRNA technology and a patent.
Weaknesses: Lack of information on team, market, GTM strategy, and competitive positioning.
Opportunities: mRNA technology is a hot area with high potential.
Threats: Without more information, it's hard to identify specific threats.

🎯 STRATEGIC RECOMMENDATIONS:
1. Provide more information on the team, their roles, and their experience.
2. Detail the market opportunity, including size, segmentation, and strategy to capture it.
3. Outline the go-to-market strategy and any traction achieved so far.
4. Explain the competitive landscape and how the company plans to maintain its competitive position."""
    
    analyzer = ComprehensiveStartupAnalyzer()
    
    # Test parsing
    detailed_scores = analyzer._extract_detailed_scores(raw_output)
    print("🔍 PARSED SCORES:")
    for category, data in detailed_scores.items():
        print(f"{category.upper()}: {data['score']}/10")
        if data['justification']:
            print(f"  Justification: {data['justification'][:100]}...")
        if data['reasoning']:
            print(f"  Reasoning: {data['reasoning'][:100]}...")
        print()
    
    # Test overall score calculation
    overall_scores = analyzer._calculate_score_from_detailed(raw_output)
    print("📊 CALCULATED OVERALL SCORES:")
    for key, value in overall_scores.items():
        print(f"{key}: {value}")
    
    # Test SWOT extraction
    import re
    swot_match = re.search(r'📊 SWOT SUMMARY:.*?Strengths:\s*(.*?)Weaknesses:\s*(.*?)Opportunities:\s*(.*?)Threats:\s*(.*?)(?=🎯|$)', 
                          raw_output, re.DOTALL | re.IGNORECASE)
    if swot_match:
        print("\n📈 PARSED SWOT:")
        print(f"Strengths: {swot_match.group(1).strip()}")
        print(f"Weaknesses: {swot_match.group(2).strip()}")
        print(f"Opportunities: {swot_match.group(3).strip()}")
        print(f"Threats: {swot_match.group(4).strip()}")
    else:
        print("❌ SWOT parsing failed")

if __name__ == "__main__":
    test_parsing_fix()