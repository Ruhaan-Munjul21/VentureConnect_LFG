#!/usr/bin/env python3
"""
Test Enhanced Analysis
Test the new enhanced content extraction system
"""

from startup_analyzer import ComprehensiveStartupAnalyzer

def test_enhanced_analysis():
    """Test the enhanced analysis system with detailed content"""
    
    print("🚀 Testing Enhanced Analysis System...")
    
    # Mock data with technical slide like the dark genome example
    mock_pitch_data = {
        "total_slides": 3,
        "analyses": [
            {
                "slide_number": 1,
                "analysis": "Protirna Therapeutics, Inc. - Precision immunotherapy company founded by PhD team from Stanford and Harvard. $15M Series A funding completed."
            },
            {
                "slide_number": 4,
                "analysis": """The Dark Genome: A New Frontier in Precision Immunotherapy. The dark genome comprises 98% of the human genome, but its protein-coding potential has been largely overlooked. In cancer, epigenetic dysregulation and genomic instability can activate these normally silent regions, resulting in aberrant transcription and translation of novel peptides and proteins. These "dark antigens", including those derived from transposable elements (TEs), are often tumor-specific, immunogenic, and absent in normal tissues. AI-powered platform enables systematic discovery of dark antigens across large-scale multi-omics datasets. Scalable, high-throughput validation through multi-omics and immune profiling accelerates target confirmation and therapeutic development."""
            },
            {
                "slide_number": 16,
                "analysis": "Team: Dr. Sarah Chen (CEO, PhD Stanford, former Moderna), Dr. Michael Rodriguez (CTO, MD/PhD Harvard, 10 years Pfizer). Advisory board includes Nobel laureate and former FDA commissioner."
            }
        ]
    }
    
    analyzer = ComprehensiveStartupAnalyzer()
    
    print("🔬 Running enhanced analysis...")
    result = analyzer.analyze_startup_positioning(mock_pitch_data)
    
    if "error" in result:
        print(f"❌ Analysis failed: {result['error']}")
        return
    
    print("✅ Enhanced analysis completed!")
    
    # Show what content was extracted
    print(f"\n📊 CONTENT EXTRACTION RESULTS:")
    
    # Test the detailed scores
    detailed = result.get("detailed_scores", {})
    scores = result.get("overall_score", {})
    
    print(f"\n🎯 SCORES:")
    print(f"Overall: {scores.get('overall', 'N/A')}/10")
    for category, data in detailed.items():
        if isinstance(data, dict) and data.get('score'):
            print(f"{category.title()}: {data['score']}/10")
    
    # Show SWOT if available
    swot = result.get("swot_analysis", {})
    if swot.get("strengths"):
        print(f"\n💪 Strengths: {swot['strengths'][:200]}...")
    
    return result

if __name__ == "__main__":
    test_enhanced_analysis()