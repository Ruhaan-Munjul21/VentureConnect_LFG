"""
GPT-4o Vision Analyzer for Biotech Pitch Decks
Deep biotech understanding of slide content using OpenAI
"""

import openai
import os
import json
import base64
from pathlib import Path
import time
from typing import Dict, List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class GPT4oBiotechAnalyzer:
    """Analyzes biotech slides using GPT-4o Vision"""
    
    def __init__(self, api_key: str = None):
        """Initialize OpenAI client"""
        if api_key:
            self.client = openai.OpenAI(api_key=api_key)
        else:
            # Try to get from environment
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                raise ValueError("Please provide OpenAI API key or set OPENAI_API_KEY environment variable")
            self.client = openai.OpenAI(api_key=api_key)
        
        print("✅ GPT-4o Vision configured successfully")
        self.output_dir = Path("analysis_results")
        self.output_dir.mkdir(exist_ok=True)
    
    def encode_image(self, image_path: str) -> str:
        """Encode image to base64"""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    
    def analyze_slide(self, image_path: str, slide_number: int) -> Dict:
        """Analyze a single biotech slide with GPT-4o Vision"""
        
        print(f"🔬 Analyzing slide {slide_number} with GPT-4o Vision...")
        
        # Create biotech-specific prompt
        prompt = self._create_biotech_prompt(slide_number)
        
        # Encode image
        base64_image = self.encode_image(image_path)
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=2000,
                temperature=0.1
            )
            
            analysis_text = response.choices[0].message.content
            
            # Create analysis result
            analysis = {
                "slide_number": slide_number,
                "image_path": image_path,
                "analysis": analysis_text,
                "model": "gpt-4o-vision",
                "timestamp": time.time(),
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }
            
            print(f"  ✅ Completed analysis for slide {slide_number}")
            return analysis
            
        except Exception as e:
            print(f"  ❌ Error analyzing slide {slide_number}: {str(e)}")
            return {
                "slide_number": slide_number,
                "image_path": image_path,
                "analysis": f"Error: {str(e)}",
                "model": "gpt-4o-vision",
                "timestamp": time.time()
            }
    
    def analyze_all_slides(self, slides_folder: str = "slides") -> List[Dict]:
        """Analyze all slides in the folder"""
        
        slides_path = Path(slides_folder)
        if not slides_path.exists():
            raise ValueError(f"Slides folder '{slides_folder}' not found")
        
        # Get all PNG files, sorted by slide number
        slide_files = sorted(
            slides_path.glob("*_slide_*.png"),
            key=lambda x: int(x.stem.split('_slide_')[1])
        )
        
        if not slide_files:
            raise ValueError(f"No slide images found in '{slides_folder}'")
        
        print(f"🚀 Found {len(slide_files)} slides to analyze")
        
        all_analyses = []
        total_tokens = 0
        
        for i, slide_file in enumerate(slide_files, 1):
            # Analyze slide
            analysis = self.analyze_slide(str(slide_file), i)
            all_analyses.append(analysis)
            
            # Track token usage
            if "usage" in analysis:
                total_tokens += analysis["usage"]["total_tokens"]
            
            # Save individual analysis
            self._save_analysis(analysis, f"slide_{i:02d}_gpt4o_analysis.json")
            
            # Rate limiting - pause between requests
            if i < len(slide_files):  # Don't pause after last slide
                time.sleep(1)  # 1 second pause between requests
        
        # Save combined analysis
        self._save_combined_analysis(all_analyses, total_tokens)
        
        return all_analyses
    
    def _create_biotech_prompt(self, slide_number: int) -> str:
        """Create specialized prompt based on expected slide content"""
        
        base_prompt = """
You are a biotech expert analyzing a pitch deck slide. Provide deep, scientifically accurate analysis of this biotech slide.

Extract and explain in detail:

SCIENTIFIC CONTENT:
- Drug compounds, targets, mechanisms of action
- Disease indications and therapeutic areas  
- Clinical trial phases, endpoints, patient populations
- Biomarkers, assays, and measurement techniques
- Regulatory pathways and approval strategies
- Experimental data, graphs, and statistical results

BUSINESS CONTENT:
- Market sizes and competitive landscape
- Intellectual property and patent status
- Team expertise and academic credentials
- Funding amounts, valuations, use of funds
- Partnership and collaboration details
- Timeline and milestones

TECHNICAL DETAILS:
- Experimental results and statistical significance
- Molecular pathways and biological mechanisms
- Manufacturing and scalability considerations
- Risk factors and technical challenges

Analyze all visible text, numbers, graphs, tables, diagrams, and images. Be specific and detailed with proper biotech terminology. If you see data visualizations, describe the trends, significance, and implications.
"""
        
        # Add slide-specific guidance
        slide_specific = {
            1: "This is likely a title slide. Focus on company mission, therapeutic focus, and contact information.",
            2: "Likely company overview/mission. Look for therapeutic approach, disease focus, and value proposition.",
            3: "May contain scientific background or mechanism information. Focus on biological pathways and mRNA processing.",
            4: "Could be foundation science or platform technology. Analyze core scientific concepts and publications.",
            5: "Likely discovery platform or technology. Focus on assays, screening methods, and capabilities.",
            6: "May show partnerships or validation. Look for collaboration details and proof points with pharma partners.",
            7: "Likely clinical data or proof of concept. Focus on experimental results, efficacy data, and statistical significance.",
            8: "May contain more clinical data or mechanism studies. Analyze drug performance and mechanism comparisons.",
            9: "Could be IP portfolio. Focus on patent protection, filing status, and competitive positioning.",
            10: "Likely investors or board. Focus on funding sources, governance, and investor credentials.",
            11: "Probably team slide. Focus on expertise, academic credentials, and relevant experience.",
            12: "May be advisory board. Look for scientific advisors and their backgrounds in relevant fields.",
            13: "Likely strategic plan or roadmap. Focus on development timeline, milestones, and strategic priorities.",
            14: "Probably competitive landscape. Analyze market positioning, differentiation, and competitive advantages.",
            15: "May show progress or achievements. Focus on value creation, milestones achieved, and progress metrics.",
            16: "Likely funding opportunity. Focus on investment terms, use of funds, valuation, and funding timeline."
        }
        
        specific_guidance = slide_specific.get(slide_number, "Analyze all visible content comprehensively.")
        
        return f"{base_prompt}\n\nSLIDE-SPECIFIC FOCUS:\n{specific_guidance}"
    
    def _save_analysis(self, analysis: Dict, filename: str):
        """Save individual analysis to JSON file"""
        filepath = self.output_dir / filename
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False)
    
    def _save_combined_analysis(self, analyses: List[Dict], total_tokens: int):
        """Save all analyses to a combined file"""
        combined = {
            "total_slides": len(analyses),
            "analyses": analyses,
            "summary": {
                "successful": len([a for a in analyses if not a["analysis"].startswith("Error:")]),
                "failed": len([a for a in analyses if a["analysis"].startswith("Error:")]),
                "total_tokens": total_tokens,
                "estimated_cost_usd": total_tokens * 0.00001,  # Rough estimate
                "timestamp": time.time()
            }
        }
        
        filepath = self.output_dir / "combined_gpt4o_analysis.json"
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(combined, f, indent=2, ensure_ascii=False)
        
        print(f"📁 Saved combined analysis to: {filepath}")
        print(f"💰 Token usage: {total_tokens} tokens (~${total_tokens * 0.00001:.3f})")
    
    def get_analysis_summary(self) -> Dict:
        """Get summary of analysis results"""
        combined_file = self.output_dir / "combined_gpt4o_analysis.json"
        
        if not combined_file.exists():
            return {"status": "No analysis found"}
        
        with open(combined_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return {
            "total_slides": data["total_slides"],
            "successful": data["summary"]["successful"],
            "failed": data["summary"]["failed"],
            "total_tokens": data["summary"].get("total_tokens", 0),
            "estimated_cost": data["summary"].get("estimated_cost_usd", 0),
            "output_files": list(self.output_dir.glob("*.json"))
        }