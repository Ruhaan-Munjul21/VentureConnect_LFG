# 🧬 Biotech Startup Analysis Pipeline

A comprehensive AI-powered system for analyzing biotech startup pitch decks and generating detailed competitive positioning reports.

## 🚀 Features

### 📄 PDF Processing
- Converts pitch deck PDFs to high-quality images
- Supports multi-slide presentations
- Optimized for biotech content

### 🔬 GPT-4o Vision Analysis
- Deep biotech-specific slide analysis
- Extracts scientific, business, and technical details
- Specialized prompts for different slide types (title, science, team, funding, etc.)

### 🧹 Content Optimization
- Removes noise and redundant information
- Summarizes key facts for better extraction
- Optimizes token usage for downstream analysis

### 📈 Comprehensive Startup Analysis
**Provides detailed analysis of:**
- ✅ **Strengths & Weaknesses**
- 🎯 **Competitive Differentiation** 
- 📊 **Market Positioning**
- 💰 **Investment Thesis**
- 📋 **Strategic Recommendations**
- 🏆 **Scoring System** (Technology, Market, Team)

## 🛠️ Installation

### Prerequisites
```bash
# Install required packages
pip install openai python-dotenv pymupdf pathlib
```

### Environment Setup
Create a `.env` file:
```bash
OPENAI_API_KEY=your-openai-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

## 🎯 Usage

### Option 1: Complete Pipeline (Recommended)
```bash
# Run full analysis on a PDF
python run_full_analysis.py biotech_startup.pdf

# Skip PDF processing if slides already exist
python run_full_analysis.py --skip-pdf

# Run only the comprehensive analysis
python run_full_analysis.py --analysis-only
```

### Option 2: Step-by-Step
```bash
# Step 1: Convert PDF to slides
python pdf_processor.py biotech_startup.pdf

# Step 2: GPT-4o Vision analysis
python step2a_gpt4o.py

# Step 3: Content optimization (optional)
python content_optimizer.py

# Step 4: Comprehensive analysis
python startup_analyzer.py
```

## 📊 Output Files

### Generated Directories
```
├── slides/                     # Converted slide images
├── analysis_results/           # GPT-4o vision analysis
└── startup_analysis/           # Final comprehensive reports
```

### Key Output Files
- **`combined_gpt4o_analysis.json`** - Raw vision analysis data
- **`{company}_comprehensive_analysis.json`** - Structured analysis data
- **`{company}_analysis_report.md`** - Human-readable summary report

## 📋 Analysis Structure

### Executive Summary
High-level assessment of the company's position and prospects.

### Scoring System (1-10 scale)
- **Overall Score** - Weighted average assessment
- **Technology Score** - Scientific innovation and differentiation
- **Market Score** - Market opportunity and positioning
- **Team Score** - Leadership and execution capability

### Detailed Sections
1. **Key Strengths** - Technology, market, team, and strategic advantages
2. **Weaknesses & Risks** - Technical, commercial, execution, and financial risks
3. **Competitive Differentiation** - Unique advantages and barriers to entry
4. **Market Positioning** - Target market strategy and competitive landscape
5. **Investment Thesis** - Value proposition and potential returns
6. **Strategic Recommendations** - Growth strategies and risk mitigation

## 🧬 Biotech-Specific Features

### Technology Analysis
- Drug modality identification (small molecule, mRNA, antibody, etc.)
- Mechanism of action extraction
- Platform technology assessment
- IP and patent analysis

### Market Intelligence
- Therapeutic area focus
- Regulatory pathway analysis
- Competitive landscape mapping
- Market size and opportunity assessment

### Team Evaluation
- Scientific expertise and credentials
- Industry experience assessment
- Academic affiliations and publications
- Leadership team composition

## 💡 Example Usage

```python
# Quick analysis from existing data
from startup_analyzer import ComprehensiveStartupAnalyzer

analyzer = ComprehensiveStartupAnalyzer()
analysis = analyzer.analyze_from_file("analysis_results/combined_gpt4o_analysis.json")

# Get overall score
score = analysis["overall_score"]["overall"]
print(f"Overall Score: {score}/10")

# Generate report
report = analyzer.generate_analysis_report(analysis)
print(report)
```

## 📈 Sample Output

```
# COMPREHENSIVE STARTUP ANALYSIS: Ribogenics Therapeutics

## EXECUTIVE SUMMARY
Ribogenics Therapeutics is developing RNA-modulating therapies with a focus on 
mRNA and protein modulation for various therapeutic applications...

## OVERALL SCORING (1-10 scale)
- Overall Score: 7.2/10
- Technology: 8/10
- Market: 7/10  
- Team: 7/10

## KEY STRENGTHS
• Strong proprietary platform technology for RNA modulation
• Experienced scientific team with relevant expertise
• Clear therapeutic focus with multiple pipeline opportunities
• Well-defined regulatory pathway

## KEY WEAKNESSES & RISKS
• Early-stage development with unproven clinical efficacy
• Competitive market with established players
• Significant funding requirements for clinical advancement
• Regulatory risks associated with novel modalities
```

## 🔧 Customization

### Modify Analysis Prompts
Edit `startup_analyzer.py` to customize the analysis criteria:
```python
def _create_comprehensive_analysis_prompt(self, ...):
    # Customize the analysis prompt for your specific needs
```

### Adjust Scoring System
Modify the scoring algorithm in `_calculate_score()`:
```python
def _calculate_score(self, analysis_text: str) -> Dict:
    # Customize scoring weights and criteria
```

### Add New Analysis Sections
Extend the analysis structure in `_structure_analysis()`:
```python
sections = {
    "executive_summary": "",
    "your_custom_section": "",  # Add new sections
    # ...
}
```

## 📊 Token Usage & Costs

### Estimated Costs (per analysis)
- **GPT-4o Vision**: ~2,000-4,000 tokens per slide (~$0.02-0.04 per slide)
- **GPT-4 Analysis**: ~3,000 tokens (~$0.09 per analysis)
- **Content Optimization**: ~500 tokens (~$0.005 per analysis)

### For a 15-slide deck:
- **Total Cost**: ~$0.40-0.70 per complete analysis
- **Total Tokens**: ~8,000-12,000 tokens

## 🚨 Error Handling

The system includes robust error handling:
- Continues analysis even if individual slides fail
- Provides fallback options for missing data
- Generates partial reports when possible
- Logs all errors for debugging

## 🤝 Contributing

To extend the analyzer:
1. Add new extraction methods in `startup_analyzer.py`
2. Extend the prompt system for specialized analysis
3. Add industry-specific scoring criteria
4. Implement new output formats

## 📞 Support

For questions or issues:
- Check error logs in the output
- Verify OpenAI API key configuration
- Ensure all input files are accessible
- Review the generated analysis files for partial results

## 🔮 Future Enhancements

- **Multi-company comparison analysis**
- **Industry benchmarking**
- **Due diligence checklist generation**
- **Integration with external data sources**
- **Custom scoring model training**
- **Real-time market data integration**

---

*Built with OpenAI GPT-4o Vision for comprehensive biotech startup analysis*