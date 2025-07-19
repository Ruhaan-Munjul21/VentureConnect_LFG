#!/usr/bin/env python3
"""
Test Vision Analysis Only
Test just the GPT-4o Vision step to see if that's where it hangs
"""

from airtable_pdf_analyzer import AirtablePDFAnalyzer
import tempfile
import os
from pathlib import Path

def test_vision_analysis():
    """Test just the vision analysis step"""
    
    print("🧪 Testing Vision Analysis Only...")
    
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
        
        print(f"📄 Testing vision analysis for: {startup_name}")
        
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
            if not pdf_path:
                print("❌ Failed to download PDF")
                return
            
            # Convert to images
            print("🖼️  Converting PDF to images...")
            image_paths = analyzer.convert_pdf_to_images(pdf_path, slides_dir)
            if not image_paths:
                print("❌ Failed to convert PDF to images")
                return
            
            print(f"✅ Created {len(image_paths)} slide images")
            
            # Test with just first 3 slides to avoid timeout
            test_images = image_paths[:3]
            print(f"🧪 Testing vision analysis on first {len(test_images)} slides...")
            
            # Change output directory temporarily
            original_output_dir = analyzer.vision_analyzer.output_dir
            analyzer.vision_analyzer.output_dir = Path(analysis_dir)
            
            try:
                # Analyze just the test slides
                vision_analyses = []
                for i, image_path in enumerate(test_images, 1):
                    print(f"🔬 Analyzing slide {i}/{len(test_images)}...")
                    slide_analysis = analyzer.vision_analyzer.analyze_slide(image_path, i)
                    vision_analyses.append(slide_analysis)
                    print(f"✅ Slide {i} analysis complete")
                
                print(f"🎉 Vision analysis complete for {len(vision_analyses)} slides!")
                
                # Check content size
                total_content = ""
                for analysis in vision_analyses:
                    content = analysis.get('analysis', '')
                    total_content += content + "\n"
                    print(f"Slide {analysis.get('slide_number', 0)}: {len(content)} chars")
                
                print(f"📊 Total content: {len(total_content)} chars (~{len(total_content)//4} tokens)")
                
                if len(total_content) // 4 > 1000:
                    print("⚠️  High token count detected - this could cause issues with 21 slides")
                else:
                    print("✅ Token count looks reasonable for scaling")
                
            finally:
                analyzer.vision_analyzer.output_dir = original_output_dir
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_vision_analysis()