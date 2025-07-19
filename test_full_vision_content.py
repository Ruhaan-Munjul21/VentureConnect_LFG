#!/usr/bin/env python3
"""
Test Full Vision Content Size
Simulate what happens with 21 slides of content like we saw
"""

from startup_analyzer import ComprehensiveStartupAnalyzer

def simulate_21_slides():
    """Simulate the token issue with 21 slides"""
    
    print("🧪 Simulating 21-slide content size...")
    
    # Create realistic slide analysis content based on our test
    slide_contents = [
        "Slide 1 analysis with 1921 characters: " + "x" * 1900,
        "Slide 2 analysis with 2108 characters: " + "x" * 2087,
        "Slide 3 analysis with 3250 characters: " + "x" * 3229,
    ]
    
    # Extend to 21 slides with similar content
    all_slides = []
    for i in range(21):
        base_content = slide_contents[i % 3]  # Cycle through our 3 examples
        slide_analysis = {
            "slide_number": i + 1,
            "analysis": f"Slide {i+1}: {base_content}"
        }
        all_slides.append(slide_analysis)
    
    # Create pitch data structure
    pitch_data = {
        "total_slides": 21,
        "analyses": all_slides
    }
    
    # Calculate original size
    original_content = ""
    for slide in pitch_data["analyses"]:
        original_content += slide["analysis"] + "\n"
    
    print(f"📏 Original 21-slide content: {len(original_content)} chars")
    print(f"🎯 Estimated tokens: {len(original_content) // 4}")
    
    # Test optimization
    analyzer = ComprehensiveStartupAnalyzer()
    optimized_content = analyzer._optimize_slide_content(pitch_data)
    
    print(f"🔧 Optimized content: {len(optimized_content)} chars")
    print(f"✅ Estimated optimized tokens: {len(optimized_content) // 4}")
    
    # Test full prompt
    company_info = {"name": "Protirna Therapeutics, Inc."}
    tech_info = {"drug_modality": "mRNA", "mechanism_of_action": "test"}
    market_info = {"target_market": "test"}
    team_info = {"leadership_team": []}
    funding_info = {"funding_stage": "Series A"}
    
    full_prompt = analyzer._create_optimized_analysis_prompt(
        company_info, tech_info, market_info, team_info, funding_info, optimized_content
    )
    
    print(f"📝 Full prompt: {len(full_prompt)} chars")
    print(f"🎯 Estimated prompt tokens: {len(full_prompt) // 4}")
    
    if len(full_prompt) // 4 < 7000:
        print("✅ Should work within token limits!")
        return True
    else:
        print("❌ Still too large - need even more aggressive optimization")
        print(f"\n📝 Sample optimized content:")
        print(optimized_content[:300] + "...")
        return False

if __name__ == "__main__":
    simulate_21_slides()