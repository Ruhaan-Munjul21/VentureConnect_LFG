#!/usr/bin/env python3
"""
Complete Biotech Startup Analysis Pipeline
Runs PDF extraction, GPT-4o Vision analysis, and comprehensive positioning analysis
"""

import sys
import os
import time
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

# Import all analyzer components
try:
    from pdf_processor import PDFProcessor
    from gpt4o_analyzer import GPT4oBiotechAnalyzer
    from startup_analyzer import ComprehensiveStartupAnalyzer
    from content_optimizer import BiotechContentOptimizer
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("💡 Make sure all required files are in the same directory")
    sys.exit(1)

class FullAnalysisPipeline:
    """Complete pipeline for biotech startup analysis"""
    
    def __init__(self):
        """Initialize all components"""
        # Check API key
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OpenAI API key not found. Set OPENAI_API_KEY in .env file")
        
        self.pdf_processor = PDFProcessor()
        self.vision_analyzer = GPT4oBiotechAnalyzer(api_key)
        self.content_optimizer = BiotechContentOptimizer(api_key)
        self.startup_analyzer = ComprehensiveStartupAnalyzer(api_key)
        
        print("✅ Full analysis pipeline initialized")
    
    def run_complete_analysis(self, pdf_path: str, skip_pdf: bool = False, 
                            skip_vision: bool = False, optimize_content: bool = True) -> Dict:
        """Run the complete analysis pipeline"""
        
        print("🚀 BIOTECH STARTUP ANALYSIS PIPELINE")
        print("=" * 50)
        
        results = {
            "pdf_info": None,
            "vision_analysis": None,
            "comprehensive_analysis": None,
            "files_generated": [],
            "errors": []
        }
        
        # Step 1: PDF Processing
        if not skip_pdf:
            print("\n📄 STEP 1: PDF Processing")
            print("-" * 25)
            
            try:
                if not Path(pdf_path).exists():
                    raise FileNotFoundError(f"PDF file not found: {pdf_path}")
                
                # Get PDF info
                results["pdf_info"] = self.pdf_processor.get_slide_info(pdf_path)
                print(f"📊 PDF Info: {results['pdf_info']['total_slides']} slides, "
                      f"{results['pdf_info']['file_size_mb']} MB")
                
                # Convert to images
                image_paths = self.pdf_processor.convert_pdf_to_images(pdf_path)
                results["files_generated"].extend(image_paths)
                print(f"✅ Generated {len(image_paths)} slide images")
                
            except Exception as e:
                error_msg = f"PDF processing failed: {str(e)}"
                print(f"❌ {error_msg}")
                results["errors"].append(error_msg)
                return results
        else:
            print("⏭️  Skipping PDF processing (using existing slides)")
        
        # Step 2: GPT-4o Vision Analysis
        if not skip_vision:
            print("\n🔬 STEP 2: GPT-4o Vision Analysis")
            print("-" * 35)
            
            try:
                # Check for slides
                slides_folder = Path("slides")
                if not slides_folder.exists():
                    raise FileNotFoundError("Slides folder not found. Run PDF processing first.")
                
                # Analyze all slides
                vision_analyses = self.vision_analyzer.analyze_all_slides()
                results["vision_analysis"] = vision_analyses
                
                # Show summary
                summary = self.vision_analyzer.get_analysis_summary()
                print(f"✅ Vision analysis complete: {summary['successful']}/{summary['total_slides']} slides")
                print(f"💰 Token usage: {summary.get('total_tokens', 0)} tokens")
                
                results["files_generated"].extend([
                    "analysis_results/combined_gpt4o_analysis.json"
                ])
                
            except Exception as e:
                error_msg = f"Vision analysis failed: {str(e)}"
                print(f"❌ {error_msg}")
                results["errors"].append(error_msg)
                if not Path("analysis_results/combined_gpt4o_analysis.json").exists():
                    return results  # Cannot continue without vision analysis
        else:
            print("⏭️  Skipping vision analysis (using existing analysis)")
        
        # Step 3: Content Optimization (optional)
        if optimize_content:
            print("\n🧹 STEP 3: Content Optimization")
            print("-" * 30)
            
            try:
                optimized_file = self.content_optimizer.optimize_analysis_file()
                results["files_generated"].append(optimized_file)
                print("✅ Content optimized for field extraction")
                
                # Use optimized file for subsequent analysis
                analysis_input_file = optimized_file
                
            except Exception as e:
                error_msg = f"Content optimization failed: {str(e)}"
                print(f"⚠️  {error_msg}")
                results["errors"].append(error_msg)
                # Continue with original file
                analysis_input_file = "analysis_results/combined_gpt4o_analysis.json"
        else:
            analysis_input_file = "analysis_results/combined_gpt4o_analysis.json"
        
        # Step 4: Comprehensive Startup Analysis
        print("\n📈 STEP 4: Comprehensive Startup Analysis")
        print("-" * 40)
        
        try:
            # Generate comprehensive analysis
            startup_analysis = self.startup_analyzer.analyze_from_file(analysis_input_file)
            
            if "error" in startup_analysis:
                raise Exception(startup_analysis["error"])
            
            results["comprehensive_analysis"] = startup_analysis
            
            # Generate report
            report = self.startup_analyzer.generate_analysis_report(startup_analysis)
            company_name = startup_analysis.get("company_overview", {}).get("name", "startup").replace(" ", "_")
            
            report_file = Path("startup_analysis") / f"{company_name}_analysis_report.md"
            analysis_file = Path("startup_analysis") / f"{company_name}_comprehensive_analysis.json"
            
            results["files_generated"].extend([str(analysis_file), str(report_file)])
            
            # Show key results
            scores = startup_analysis.get("overall_score", {})
            print(f"✅ Comprehensive analysis complete!")
            print(f"📊 Overall Score: {scores.get('overall', 'N/A')}/10")
            
        except Exception as e:
            error_msg = f"Comprehensive analysis failed: {str(e)}"
            print(f"❌ {error_msg}")
            results["errors"].append(error_msg)
        
        return results
    
    def print_final_summary(self, results: Dict):
        """Print final summary of all results"""
        
        print("\n" + "="*60)
        print("🎉 ANALYSIS PIPELINE COMPLETE")
        print("="*60)
        
        # Show PDF info
        if results["pdf_info"]:
            pdf_info = results["pdf_info"]
            print(f"\n📄 PDF Processed:")
            print(f"  • File: {pdf_info['filename']}")
            print(f"  • Slides: {pdf_info['total_slides']}")
            print(f"  • Size: {pdf_info['file_size_mb']} MB")
        
        # Show vision analysis results
        if results["vision_analysis"]:
            successful = len([a for a in results["vision_analysis"] if not a["analysis"].startswith("Error:")])
            total = len(results["vision_analysis"])
            print(f"\n🔬 Vision Analysis:")
            print(f"  • Slides analyzed: {successful}/{total}")
        
        # Show comprehensive analysis results
        if results["comprehensive_analysis"]:
            analysis = results["comprehensive_analysis"]
            company_name = analysis.get("company_overview", {}).get("name", "Unknown")
            scores = analysis.get("overall_score", {})
            
            print(f"\n📈 Startup Analysis: {company_name}")
            print(f"  • Overall Score: {scores.get('overall', 'N/A')}/10")
            print(f"  • Technology: {scores.get('technology', 'N/A')}/10")
            print(f"  • Market: {scores.get('market', 'N/A')}/10")
            print(f"  • Team: {scores.get('team', 'N/A')}/10")
            
            # Show key insights
            exec_summary = analysis.get('executive_summary', '')
            if exec_summary:
                print(f"\n🎯 Executive Summary:")
                summary_preview = exec_summary[:150] + "..." if len(exec_summary) > 150 else exec_summary
                print(f"  {summary_preview}")
            
            strengths = analysis.get('strengths', [])
            if strengths:
                print(f"\n💪 Key Strengths:")
                for i, strength in enumerate(strengths[:2], 1):
                    strength_preview = strength[:80] + "..." if len(strength) > 80 else strength
                    print(f"  {i}. {strength_preview}")
        
        # Show files generated
        if results["files_generated"]:
            print(f"\n📁 Files Generated ({len(results['files_generated'])}):")
            for file_path in results["files_generated"][-5:]:  # Show last 5 files
                print(f"  • {file_path}")
            if len(results["files_generated"]) > 5:
                print(f"  • ... and {len(results['files_generated']) - 5} more")
        
        # Show errors
        if results["errors"]:
            print(f"\n⚠️  Errors Encountered ({len(results['errors'])}):")
            for error in results["errors"]:
                print(f"  • {error}")
        
        print(f"\n🎊 Analysis complete! Check the 'startup_analysis' folder for detailed results.")

def main():
    """Main execution function"""
    
    # Parse command line arguments
    import argparse
    parser = argparse.ArgumentParser(description="Complete biotech startup analysis pipeline")
    parser.add_argument("pdf_path", nargs='?', help="Path to PDF pitch deck")
    parser.add_argument("--skip-pdf", action="store_true", help="Skip PDF processing")
    parser.add_argument("--skip-vision", action="store_true", help="Skip vision analysis")
    parser.add_argument("--no-optimize", action="store_true", help="Skip content optimization")
    parser.add_argument("--analysis-only", action="store_true", help="Run only comprehensive analysis")
    
    args = parser.parse_args()
    
    # Validate inputs
    if not args.pdf_path and not args.skip_pdf and not args.analysis_only:
        print("❌ Error: PDF path required unless using --skip-pdf or --analysis-only")
        print("💡 Usage: python run_full_analysis.py <pdf_path>")
        print("💡 Or: python run_full_analysis.py --analysis-only")
        sys.exit(1)
    
    try:
        # Initialize pipeline
        pipeline = FullAnalysisPipeline()
        
        # Run analysis
        if args.analysis_only:
            # Run only comprehensive analysis
            print("🎯 Running comprehensive analysis only...")
            results = {
                "pdf_info": None,
                "vision_analysis": None,
                "comprehensive_analysis": None,
                "files_generated": [],
                "errors": []
            }
            
            try:
                startup_analysis = pipeline.startup_analyzer.analyze_from_file()
                results["comprehensive_analysis"] = startup_analysis
            except Exception as e:
                results["errors"].append(f"Analysis failed: {str(e)}")
        else:
            # Run full pipeline
            results = pipeline.run_complete_analysis(
                pdf_path=args.pdf_path,
                skip_pdf=args.skip_pdf,
                skip_vision=args.skip_vision,
                optimize_content=not args.no_optimize
            )
        
        # Show final summary
        pipeline.print_final_summary(results)
        
        # Exit with error code if there were failures
        if results["errors"] and not results["comprehensive_analysis"]:
            sys.exit(1)
        
    except KeyboardInterrupt:
        print("\n🛑 Analysis interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Fatal error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()