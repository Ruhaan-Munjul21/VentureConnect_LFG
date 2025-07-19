#!/usr/bin/env python3
"""
Test Analysis with Limited Slides
Process only 5 slides to test if the comprehensive analysis works
"""

import tempfile
import os
from pathlib import Path
from airtable_pdf_analyzer import AirtablePDFAnalyzer

def test_limited_analysis():
    """Test analysis with only 5 slides"""
    
    print("🧪 Testing analysis with limited slides...")
    
    try:
        analyzer = AirtablePDFAnalyzer()
        
        # Get pending submissions
        pending = analyzer.get_pending_submissions()
        if not pending:
            print("❌ No pending submissions found")
            return
        
        record = pending[0]
        fields = record['fields']
        startup_name = fields.get('Startup Name', 'Unknown')
        
        print(f"📄 Testing limited analysis for: {startup_name}")
        
        # Get PDF attachment
        pdf_attachments = fields.get('Non-Confidential Pitch Deck', [])
        if not pdf_attachments:
            print("❌ No PDF attachment found")
            return
        
        pdf_attachment = pdf_attachments[0]
        
        # Create temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            slides_dir = os.path.join(temp_dir, "slides")
            analysis_dir = os.path.join(temp_dir, "analysis_results")
            os.makedirs(slides_dir, exist_ok=True)
            os.makedirs(analysis_dir, exist_ok=True)
            
            # Download PDF
            print("📥 Downloading PDF...")
            pdf_path = analyzer.download_pdf_from_airtable(pdf_attachment, temp_dir)
            
            # Convert to images
            print("🖼️  Converting PDF to images...")
            image_paths = analyzer.convert_pdf_to_images(pdf_path, slides_dir)
            
            # Limit to first 5 slides for testing
            limited_images = image_paths[:5]
            print(f"🧪 Testing with {len(limited_images)} slides...")
            
            # Change output directory temporarily
            original_output_dir = analyzer.vision_analyzer.output_dir
            analyzer.vision_analyzer.output_dir = Path(analysis_dir)
            
            try:
                # Analyze limited slides
                print("🔬 Running Vision analysis...")
                vision_analyses = []
                for i, image_path in enumerate(limited_images, 1):
                    slide_analysis = analyzer.vision_analyzer.analyze_slide(image_path, i)
                    vision_analyses.append(slide_analysis)
                    print(f"✅ Completed slide {i}/{len(limited_images)}")
                
                # Create pitch data structure
                pitch_data = {
                    "total_slides": len(vision_analyses),
                    "analyses": vision_analyses,
                    "summary": {"successful": len(vision_analyses), "total_slides": len(vision_analyses)}
                }
                
                print("🧠 Running comprehensive analysis...")
                comprehensive_analysis = analyzer.startup_analyzer.analyze_startup_positioning(pitch_data)
                
                if "error" in comprehensive_analysis:
                    print(f"❌ Comprehensive analysis failed: {comprehensive_analysis['error']}")
                else:
                    scores = comprehensive_analysis.get('overall_score', {})
                    print("✅ Analysis complete!")
                    print(f"📊 Overall Score: {scores.get('overall', 'N/A')}/10")
                    print(f"🔬 Technology: {scores.get('technology', 'N/A')}/10")
                    print(f"📈 Market: {scores.get('market', 'N/A')}/10")
                    print(f"👥 Team: {scores.get('team', 'N/A')}/10")
                    
                    # Show some analysis content
                    exec_summary = comprehensive_analysis.get('executive_summary', '')
                    if exec_summary:
                        print(f"\n🎯 Executive Summary: {exec_summary[:200]}...")
                    
                    strengths = comprehensive_analysis.get('strengths', [])
                    if strengths:
                        print(f"\n💪 Key Strengths:")
                        for i, strength in enumerate(strengths[:3], 1):
                            print(f"  {i}. {strength[:100]}...")
                
            finally:
                analyzer.vision_analyzer.output_dir = original_output_dir
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_limited_analysis()