#!/usr/bin/env python3
"""
Test Token Optimization
Quick test to verify the token optimization is working
"""

import json
from pathlib import Path
from startup_analyzer import ComprehensiveStartupAnalyzer

def test_optimization():
    """Test the token optimization functions"""
    
    print("🧪 Testing token optimization...")
    
    # Load the problematic analysis file
    analysis_file = "analysis_results/combined_gpt4o_analysis.json"
    if not Path(analysis_file).exists():
        print(f"❌ Analysis file not found: {analysis_file}")
        return
    
    with open(analysis_file, 'r', encoding='utf-8') as f:
        pitch_data = json.load(f)
    
    # Initialize analyzer
    analyzer = ComprehensiveStartupAnalyzer()
    
    # Test content optimization
    print(f"📊 Original slide count: {len(pitch_data.get('analyses', []))}")
    
    # Calculate original content size
    original_content = ""
    for slide in pitch_data.get('analyses', []):
        original_content += slide.get('analysis', '') + "\n"
    
    print(f"📏 Original content length: {len(original_content)} characters")
    
    # Test optimization
    optimized_content = analyzer._optimize_slide_content(pitch_data)
    print(f"🔧 Optimized content length: {len(optimized_content)} characters")
    print(f"📉 Reduction: {len(original_content) - len(optimized_content)} characters ({((len(original_content) - len(optimized_content)) / len(original_content) * 100):.1f}%)")
    
    # Estimate token count (rough approximation: 1 token ≈ 4 characters)
    estimated_original_tokens = len(original_content) // 4
    estimated_optimized_tokens = len(optimized_content) // 4
    
    print(f"🎯 Estimated original tokens: {estimated_original_tokens}")
    print(f"✅ Estimated optimized tokens: {estimated_optimized_tokens}")
    
    if estimated_optimized_tokens < 8000:
        print("✅ Token count should be within limits!")
    else:
        print("❌ Still too many tokens - need further optimization")
    
    # Show sample of optimized content
    print(f"\n📝 Sample optimized content (first 500 chars):")
    print(optimized_content[:500] + "...")

if __name__ == "__main__":
    test_optimization()