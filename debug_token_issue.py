#!/usr/bin/env python3
"""
Debug Token Issue
Create a mock large analysis and test optimization
"""

import json
from startup_analyzer import ComprehensiveStartupAnalyzer

def create_mock_large_analysis():
    """Create a mock analysis that would exceed token limits"""
    
    # Simulate 21 slides with verbose analysis
    mock_analysis = {
        "company_name": "Protirna Therapeutics, Inc.",
        "analyses": []
    }
    
    # Create verbose slide content that would cause token overflow
    for i in range(1, 22):  # 21 slides
        verbose_content = f"""
        Slide {i} Analysis: This slide contains extensive biotech information about Protirna Therapeutics, including detailed molecular mechanisms, comprehensive market analysis, extensive competitive landscape evaluation, detailed regulatory pathway discussions, comprehensive intellectual property analysis, detailed clinical trial design considerations, extensive preclinical data presentation, comprehensive manufacturing and scale-up plans, detailed financial projections and modeling, extensive team background and qualifications, comprehensive strategic partnership discussions, detailed risk assessment and mitigation strategies, extensive market penetration strategies, comprehensive competitive differentiation analysis, detailed regulatory approval timelines, extensive intellectual property portfolio analysis, comprehensive clinical development plans, detailed market access strategies, extensive partnership and collaboration opportunities, comprehensive exit strategy considerations, detailed funding requirements and use of proceeds, extensive competitive intelligence analysis, comprehensive market opportunity assessment, detailed technology platform capabilities, extensive scientific advisory board qualifications, comprehensive regulatory strategy development, detailed commercial strategy implementation plans, extensive clinical trial operational considerations, comprehensive market research and validation data, detailed competitive positioning analysis, extensive strategic alliance opportunities, comprehensive intellectual property landscape analysis, detailed clinical development risk assessment, extensive market entry strategy evaluation, comprehensive competitive advantage analysis, detailed regulatory pathway optimization, extensive partnership development strategies, comprehensive market opportunity quantification, detailed technology differentiation analysis, extensive clinical development planning considerations, comprehensive competitive intelligence gathering, detailed market penetration strategy development, extensive regulatory approval strategy implementation, comprehensive partnership evaluation criteria, detailed competitive positioning optimization, extensive market opportunity validation research, comprehensive clinical development execution planning, detailed regulatory strategy implementation considerations, extensive partnership negotiation strategies, comprehensive market access planning considerations, detailed competitive differentiation strategy development, extensive regulatory approval pathway optimization planning, comprehensive partnership development execution strategies, detailed market opportunity assessment validation procedures, extensive competitive positioning strategy implementation planning, comprehensive regulatory strategy optimization considerations.
        """
        
        mock_analysis["analyses"].append({
            "slide_number": i,
            "analysis": verbose_content
        })
    
    return mock_analysis

def test_optimization():
    """Test the optimization with mock data"""
    
    print("🧪 Testing token optimization with mock data...")
    
    # Create mock large analysis
    mock_data = create_mock_large_analysis()
    
    # Calculate original size
    original_content = ""
    for slide in mock_data["analyses"]:
        original_content += slide["analysis"] + "\n"
    
    print(f"📏 Mock original content: {len(original_content)} characters")
    print(f"🎯 Estimated tokens: {len(original_content) // 4}")
    
    # Test optimization
    analyzer = ComprehensiveStartupAnalyzer()
    optimized_content = analyzer._optimize_slide_content(mock_data)
    
    print(f"🔧 Optimized content: {len(optimized_content)} characters")
    print(f"✅ Estimated optimized tokens: {len(optimized_content) // 4}")
    
    # Test if it's small enough for the prompt
    company_info = {"name": "Protirna Therapeutics, Inc."}
    tech_info = {"drug_modality": "mRNA", "mechanism_of_action": "test"}
    market_info = {"target_market": "test"}
    team_info = {"leadership_team": []}
    funding_info = {"funding_stage": "Series A"}
    
    test_prompt = analyzer._create_optimized_analysis_prompt(
        company_info, tech_info, market_info, team_info, funding_info, optimized_content
    )
    
    print(f"📝 Full prompt length: {len(test_prompt)} characters")
    print(f"🎯 Estimated prompt tokens: {len(test_prompt) // 4}")
    
    if len(test_prompt) // 4 < 7000:  # Leave room for response
        print("✅ Prompt should fit within token limits!")
    else:
        print("❌ Prompt still too large - need more aggressive optimization")
        
        # Show the optimization in action
        print(f"\n📝 Optimized content sample:")
        print(optimized_content[:500] + "...")

if __name__ == "__main__":
    test_optimization()