#!/usr/bin/env python3
"""
Comprehensive Startup Analysis Engine
Provides AI-generated analysis of startup strengths, weaknesses, differentiation, and competitive positioning
Built on the existing GPT-4o Vision biotech analyzer pipeline
"""

import openai
import os
import json
import time
from pathlib import Path
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

class ComprehensiveStartupAnalyzer:
    """Analyzes startup competitive positioning using extracted pitch deck data"""
    
    def __init__(self, api_key: str = None):
        """Initialize OpenAI client"""
        if api_key:
            self.client = openai.OpenAI(api_key=api_key)
        else:
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                raise ValueError("Please provide OpenAI API key or set OPENAI_API_KEY environment variable")
            self.client = openai.OpenAI(api_key=api_key)
        
        print("✅ Startup Analyzer configured successfully")
        self.output_dir = Path("startup_analysis")
        self.output_dir.mkdir(exist_ok=True)
    
    def analyze_startup_positioning(self, pitch_deck_analysis: Dict) -> Dict:
        """Generate comprehensive startup analysis from pitch deck data"""
        
        print("🔬 Analyzing startup positioning and competitive landscape...")
        
        # Extract key information from slides
        company_info = self._extract_company_overview(pitch_deck_analysis)
        technology_info = self._extract_technology_details(pitch_deck_analysis)
        market_info = self._extract_market_analysis(pitch_deck_analysis)
        team_info = self._extract_team_details(pitch_deck_analysis)
        funding_info = self._extract_funding_details(pitch_deck_analysis)
        
        # Optimize content for token limits
        optimized_content = self._optimize_slide_content(pitch_deck_analysis)
        print(f"🔧 Content optimized: {len(optimized_content)} chars")
        
        # Generate comprehensive analysis with optimized content
        analysis_prompt = self._create_optimized_analysis_prompt(
            company_info, technology_info, market_info, team_info, funding_info, optimized_content
        )
        
        # Check token count before sending
        estimated_tokens = len(analysis_prompt) // 4
        print(f"📊 Estimated prompt tokens: {estimated_tokens}")
        
        if estimated_tokens > 7000:
            print(f"⚠️  Warning: Prompt may be too large ({estimated_tokens} tokens)")
            # Further reduce content if needed
            if len(optimized_content) > 2000:
                optimized_content = optimized_content[:2000] + "..."
                analysis_prompt = self._create_optimized_analysis_prompt(
                    company_info, technology_info, market_info, team_info, funding_info, optimized_content
                )
                print(f"🔧 Further reduced prompt to {len(analysis_prompt) // 4} estimated tokens")
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": analysis_prompt}],
                max_tokens=3000,
                temperature=0.2
            )
            
            analysis_text = response.choices[0].message.content
            
            # Structure the analysis
            structured_analysis = self._structure_analysis(analysis_text, company_info)
            
            # Add metadata
            structured_analysis.update({
                "company_overview": company_info,
                "technology_profile": technology_info,
                "market_analysis": market_info,
                "team_profile": team_info,
                "funding_profile": funding_info,
                "analysis_metadata": {
                    "model": "gpt-4",
                    "timestamp": time.time(),
                    "token_usage": response.usage.total_tokens
                }
            })
            
            return structured_analysis
            
        except Exception as e:
            print(f"❌ Error in startup analysis: {str(e)}")
            return {"error": str(e)}
    
    def _extract_company_overview(self, pitch_data: Dict) -> Dict:
        """Extract company overview from pitch deck analysis"""
        
        company_info = {
            "name": "Unknown",
            "description": "",
            "mission": "",
            "therapeutic_focus": "",
            "business_model": "",
            "stage": "Unknown"
        }
        
        # Analyze slides for company information
        analyses = pitch_data.get("analyses", [])
        
        for slide in analyses:
            slide_text = slide.get("analysis", "").lower()
            slide_num = slide.get("slide_number", 0)
            
            # Extract company name (usually on title slide)
            if slide_num <= 2 and any(keyword in slide_text for keyword in ["therapeutics", "inc", "ltd", "corp"]):
                # Use regex or simple extraction for company name
                lines = slide.get("analysis", "").split('\n')
                for line in lines:
                    if any(indicator in line.lower() for indicator in ["therapeutics", "inc.", "ltd.", "corp."]):
                        company_info["name"] = line.strip()
                        break
            
            # Extract mission and description
            if any(keyword in slide_text for keyword in ["mission", "vision", "develops", "focused on"]):
                company_info["description"] += " " + slide.get("analysis", "")
            
            # Extract therapeutic focus
            if any(keyword in slide_text for keyword in ["therapeutic", "disease", "indication", "treatment"]):
                company_info["therapeutic_focus"] += " " + slide.get("analysis", "")
        
        # Clean up extracted text
        for key in company_info:
            if isinstance(company_info[key], str):
                company_info[key] = company_info[key].strip()[:500]  # Limit length
        
        return company_info
    
    def _extract_technology_details(self, pitch_data: Dict) -> Dict:
        """Extract technology and platform information"""
        
        tech_info = {
            "drug_modality": "",
            "mechanism_of_action": "",
            "platform_technology": "",
            "pipeline": [],
            "differentiation": "",
            "ip_status": ""
        }
        
        analyses = pitch_data.get("analyses", [])
        
        for slide in analyses:
            slide_text = slide.get("analysis", "").lower()
            
            # Extract drug modality
            modalities = ["small molecule", "antibody", "mrna", "protein", "gene therapy", "cell therapy", "oligonucleotide"]
            for modality in modalities:
                if modality in slide_text:
                    tech_info["drug_modality"] += f"{modality}, "
            
            # Extract mechanism details
            if any(keyword in slide_text for keyword in ["mechanism", "pathway", "target", "binding"]):
                tech_info["mechanism_of_action"] += " " + slide.get("analysis", "")
            
            # Extract platform information
            if any(keyword in slide_text for keyword in ["platform", "technology", "proprietary", "discovery"]):
                tech_info["platform_technology"] += " " + slide.get("analysis", "")
            
            # Extract IP information
            if any(keyword in slide_text for keyword in ["patent", "intellectual property", "ip", "filing"]):
                tech_info["ip_status"] += " " + slide.get("analysis", "")
        
        # Clean up extracted text
        for key in tech_info:
            if isinstance(tech_info[key], str):
                tech_info[key] = tech_info[key].strip()[:500]
        
        return tech_info
    
    def _extract_market_analysis(self, pitch_data: Dict) -> Dict:
        """Extract market and competitive information"""
        
        market_info = {
            "target_market": "",
            "market_size": "",
            "competitive_landscape": "",
            "key_competitors": [],
            "market_opportunity": "",
            "regulatory_pathway": ""
        }
        
        analyses = pitch_data.get("analyses", [])
        
        for slide in analyses:
            slide_text = slide.get("analysis", "").lower()
            
            # Extract market size information
            if any(keyword in slide_text for keyword in ["market", "billion", "million", "tam", "sam"]):
                market_info["market_size"] += " " + slide.get("analysis", "")
            
            # Extract competitive information
            if any(keyword in slide_text for keyword in ["competitor", "competitive", "landscape", "vs", "compared"]):
                market_info["competitive_landscape"] += " " + slide.get("analysis", "")
            
            # Extract regulatory information
            if any(keyword in slide_text for keyword in ["fda", "regulatory", "approval", "clinical", "trial"]):
                market_info["regulatory_pathway"] += " " + slide.get("analysis", "")
        
        # Clean up extracted text
        for key in market_info:
            if isinstance(market_info[key], str):
                market_info[key] = market_info[key].strip()[:500]
        
        return market_info
    
    def _extract_team_details(self, pitch_data: Dict) -> Dict:
        """Extract team and leadership information"""
        
        team_info = {
            "leadership_team": [],
            "advisory_board": [],
            "key_expertise": "",
            "academic_affiliations": "",
            "industry_experience": ""
        }
        
        analyses = pitch_data.get("analyses", [])
        
        for slide in analyses:
            slide_text = slide.get("analysis", "").lower()
            slide_num = slide.get("slide_number", 0)
            
            # Team slides are typically later in the deck
            if slide_num >= 10 and any(keyword in slide_text for keyword in ["team", "ceo", "cto", "founder", "advisor"]):
                team_info["leadership_team"].append(slide.get("analysis", ""))
            
            # Extract academic information
            if any(keyword in slide_text for keyword in ["phd", "university", "professor", "harvard", "mit", "stanford"]):
                team_info["academic_affiliations"] += " " + slide.get("analysis", "")
            
            # Extract industry experience
            if any(keyword in slide_text for keyword in ["pharma", "biotech", "experience", "previously"]):
                team_info["industry_experience"] += " " + slide.get("analysis", "")
        
        # Clean up extracted text
        for key in team_info:
            if isinstance(team_info[key], str):
                team_info[key] = team_info[key].strip()[:500]
        
        return team_info
    
    def _extract_funding_details(self, pitch_data: Dict) -> Dict:
        """Extract funding and financial information"""
        
        funding_info = {
            "funding_stage": "",
            "amount_raising": "",
            "valuation": "",
            "use_of_funds": "",
            "investors": [],
            "milestones": ""
        }
        
        analyses = pitch_data.get("analyses", [])
        
        for slide in analyses:
            slide_text = slide.get("analysis", "").lower()
            
            # Extract funding information
            if any(keyword in slide_text for keyword in ["funding", "investment", "series", "seed", "million", "valuation"]):
                funding_info["amount_raising"] += " " + slide.get("analysis", "")
            
            # Extract use of funds
            if any(keyword in slide_text for keyword in ["use of funds", "capital", "budget", "allocation"]):
                funding_info["use_of_funds"] += " " + slide.get("analysis", "")
            
            # Extract investor information
            if any(keyword in slide_text for keyword in ["investor", "vc", "venture", "fund", "partner"]):
                funding_info["investors"].append(slide.get("analysis", ""))
        
        # Clean up extracted text
        for key in funding_info:
            if isinstance(funding_info[key], str):
                funding_info[key] = funding_info[key].strip()[:500]
        
        return funding_info
    
    def _optimize_slide_content(self, pitch_data: Dict) -> str:
        """Extract comprehensive summaries from slides preserving technical details"""
        
        # Use enhanced content extraction for much more detailed summaries
        from enhanced_content_extractor import EnhancedContentExtractor
        
        extractor = EnhancedContentExtractor()
        comprehensive_summary = extractor.extract_comprehensive_summary(pitch_data)
        
        print(f"📝 Enhanced extraction: {len(comprehensive_summary)} chars (preserves technical details)")
        
        return comprehensive_summary
    
    def _extract_slide_key_points(self, slide_text: str, slide_num: int) -> str:
        """Extract key points from a slide, focusing on important information"""
        
        # Remove verbose descriptions and keep key facts
        import re
        
        # Enhanced patterns to extract specific technical details
        key_patterns = [
            r'(\$[\d,]+[KMB]?\s*(?:million|billion|funding|valuation|market|revenue|ARR))',  # Money amounts
            r'(\d+%\s*(?:increase|decrease|improvement|efficacy|success|growth|reduction))',  # Percentages
            r'(Phase\s+[I1V2-3]+|clinical\s+trial|preclinical|IND)',                        # Clinical phases
            r'(\d+\s*(?:patients|subjects|trials|studies|customers|users|employees))',       # Numbers
            r'([A-Z][a-z]+\s+(?:therapeutics|pharmaceutical|biotech|inc|ltd|corp))',         # Company names
            r'(FDA\s+approval|regulatory|patent|IP|intellectual\s+property)',               # Regulatory
            r'(CEO|CTO|CFO|founder|co-founder|PhD|MD|professor)',                             # Team roles
            r'(mRNA|DNA|protein|antibody|small\s+molecule|gene\s+therapy)',                 # Drug types
            r'(Series\s+[ABC]|seed|pre-seed|angel|venture)',                                 # Funding stages
            r'(partnership|collaboration|agreement|license|acquisition)',                     # Business deals
            r'(Stanford|Harvard|MIT|Johns\s+Hopkins|UCSF|NIH)',                             # Institutions
            r'(Pfizer|Roche|Novartis|J&J|Johnson|Merck|Gilead|Biogen)',                     # Pharma companies
        ]
        
        key_facts = []
        for pattern in key_patterns:
            matches = re.findall(pattern, slide_text, re.IGNORECASE)
            key_facts.extend(matches[:2])  # Limit to 2 matches per pattern
        
        # Add slide-specific focus
        if slide_num <= 2:  # Title/overview slides
            if "therapeutics" in slide_text.lower() or "biotech" in slide_text.lower():
                company_match = re.search(r'([A-Z][a-zA-Z\s]+(?:Therapeutics|Biotech|Inc))', slide_text)
                if company_match:
                    key_facts.append(company_match.group(1))
        
        elif slide_num >= 10:  # Team/funding slides
            if "ceo" in slide_text.lower() or "founder" in slide_text.lower():
                key_facts.append("Leadership team present")
            if "million" in slide_text.lower() or "funding" in slide_text.lower():
                key_facts.append("Funding information")
        
        # Return summarized key points (max 150 chars to preserve details)
        if key_facts:
            summary = "; ".join(key_facts[:3])  # Max 3 key facts per slide
            return summary[:150] + "..." if len(summary) > 150 else summary
        
        # Fallback: first meaningful sentence (max 60 chars)
        sentences = slide_text.split('.')
        for sentence in sentences:
            clean_sentence = sentence.strip()
            if len(clean_sentence) > 15 and len(clean_sentence) < 60:
                return clean_sentence
        
        return ""
    
    def _create_optimized_analysis_prompt(self, company_info: Dict, tech_info: Dict, 
                                        market_info: Dict, team_info: Dict, funding_info: Dict, 
                                        optimized_content: str) -> str:
        """Create comprehensive VC analysis prompt using detailed rubric"""
        
        prompt = f"""
You are a senior VC associate reviewing a startup pitch deck for a FUNDED biotech company that has already raised capital. Adjust your expectations accordingly - this company has already passed initial investor scrutiny. Using only the content within the deck, extract and evaluate signals to assess startup quality across five core dimensions. Assign a score from 1 to 10 in each category using the CALIBRATED rubrics below.

PITCH DECK CONTENT:
{optimized_content}

EXTRACTED COMPANY INFO:
- Company: {company_info.get('name', 'Unknown')}
- Technology: {tech_info.get('drug_modality', 'Unknown')} targeting {tech_info.get('mechanism_of_action', 'Unknown')[:100]}
- Market: {market_info.get('target_market', 'Unknown')[:100]}
- Team: {len(team_info.get('leadership_team', []))} team members identified
- Stage: {funding_info.get('funding_stage', 'Unknown')}

CALIBRATED SCORING: This is a FUNDED biotech company that has raised millions - investors have already validated the opportunity. Default baseline should be 6-7/10. Scores below 5 only for major red flags. Most funded companies should score 6-8/10 range.

For each category, provide:
1. A justification referencing exact signals from the deck
2. A reasoning section explaining the score relative to FUNDING STAGE expectations
3. Credit what IS shown, note what's missing without over-penalizing

🔹 CATEGORY 1: TEAM (Score 1-10) - FUNDED COMPANY CALIBRATION
SCORING RUBRIC:
1-4: Major red flags (concerning backgrounds, missing key roles)
5: Below typical funding standards
6-7: BASELINE for funded company (competent team with domain fit - most funded biotechs)
8: Strong team with proven track record and good execution
9-10: Elite team with multiple successful exits and optimal composition

Justification: [Summarize who the team is, roles, experience from deck]
Reasoning: [Assess relative to funding stage - what does this team suggest about investor confidence?]

🔹 CATEGORY 2: PRODUCT & TECHNOLOGY (Score 1-10) - FUNDED COMPANY CALIBRATION
SCORING RUBRIC:
1-4: Major tech concerns (unclear feasibility, no differentiation)
5: Below typical biotech funding standards
6-7: BASELINE for funded biotech (real problem, technical merit, some differentiation)
8: Strong technology platform with clear competitive advantages
9-10: Breakthrough technology with significant IP moats and validation

Justification: [State product stage, tech approach, validation from deck]
Reasoning: [Assess tech strength relative to what investors likely saw when funding]

🔹 CATEGORY 3: MARKET OPPORTUNITY (Score 1-10) - FUNDED COMPANY CALIBRATION
SCORING RUBRIC:
1-4: Poor market sizing or unclear opportunity
5: Below typical biotech funding standards
6-7: BASELINE for funded biotech (decent market size, real medical need)
8: Strong market opportunity with excellent timing and clear strategy
9-10: Exceptional market with massive potential and perfect timing

Justification: [State market info, sizing, customers from deck]
Reasoning: [Evaluate market relative to biotech funding standards]

🔹 CATEGORY 4: GO-TO-MARKET & TRACTION (Score 1-10) - FUNDED COMPANY CALIBRATION
SCORING RUBRIC:
1-4: No clear path to market or concerning strategy gaps
5: Below typical biotech funding standards
6-7: BASELINE for funded biotech (clear pathway, some partnerships/validation)
8: Strong progress with meaningful partnerships and early traction
9-10: Exceptional execution with proven market validation and strong partnerships

Justification: [Describe strategy, partnerships, progress from deck]
Reasoning: [Assess traction relative to funding stage and biotech timelines]

🔹 CATEGORY 5: COMPETITIVE POSITIONING & DEFENSIBILITY (Score 1-10) - FUNDED COMPANY CALIBRATION
SCORING RUBRIC:
1-4: Poor competitive position or no clear differentiation
5: Below typical biotech funding standards
6-7: BASELINE for funded biotech (some competitive advantages, IP protection)
8: Strong competitive positioning with clear sustainable advantages
9-10: Dominant position with multiple strong defensibility layers

Justification: [Summarize competitive approach, advantages from deck]
Reasoning: [Evaluate defensibility relative to biotech investment standards]

📊 SWOT SUMMARY (1-2 sentences each):
Strengths: [Core differentiators and traction signals]
Weaknesses: [Missing roles, fuzzy pricing, execution gaps]  
Opportunities: [Tailwinds, new segments, emerging tech]
Threats: [Competitors, regulatory risks, customer behavior]

🎯 STRATEGIC RECOMMENDATIONS (3-5 actionable items):
[Specific recommendations that would materially improve viability/fundability]

Focus on clarity, investor reasoning, and strategic precision. Reference specific content from the pitch deck.
"""
        
        return prompt
    
    def _structure_analysis(self, analysis_text: str, company_info: Dict) -> Dict:
        """Structure the comprehensive VC analysis into organized sections"""
        
        import re
        
        sections = {
            "detailed_scores": self._extract_detailed_scores(analysis_text),
            "overall_score": self._calculate_score_from_detailed(analysis_text),
            "swot_analysis": {},
            "strategic_recommendations": []
        }
        
        # Extract SWOT Analysis
        swot_match = re.search(r'📊 SWOT SUMMARY.*?Strengths:\s*(.*?)Weaknesses:\s*(.*?)Opportunities:\s*(.*?)Threats:\s*(.*?)(?=🎯|$)', 
                              analysis_text, re.DOTALL | re.IGNORECASE)
        if swot_match:
            sections["swot_analysis"] = {
                "strengths": swot_match.group(1).strip(),
                "weaknesses": swot_match.group(2).strip(),
                "opportunities": swot_match.group(3).strip(),
                "threats": swot_match.group(4).strip()
            }
        
        # Extract Strategic Recommendations
        recommendations_match = re.search(r'🎯 STRATEGIC RECOMMENDATIONS.*?\n(.*?)(?=Focus on clarity|$)', 
                                        analysis_text, re.DOTALL | re.IGNORECASE)
        if recommendations_match:
            rec_text = recommendations_match.group(1).strip()
            # Split by bullet points or numbered items
            recommendations = []
            for line in rec_text.split('\n'):
                line = line.strip()
                if line and (line.startswith('-') or line.startswith('•') or re.match(r'^\d+\.', line)):
                    recommendations.append(line.lstrip('-•').lstrip('0123456789.').strip())
                elif line and len(recommendations) == 0:  # First recommendation might not have bullet
                    recommendations.append(line)
            sections["strategic_recommendations"] = recommendations
        
        # Create summary for compatibility
        detailed = sections["detailed_scores"]
        sections["executive_summary"] = f"Comprehensive VC analysis across 5 categories with weighted scoring."
        
        # Convert detailed scores to lists for compatibility
        sections["strengths"] = []
        sections["weaknesses"] = []
        
        for category, data in detailed.items():
            if data.get("justification"):
                sections["strengths"].append(f"{category.title()}: {data['justification'][:100]}...")
        
        if sections["swot_analysis"].get("weaknesses"):
            sections["weaknesses"] = [sections["swot_analysis"]["weaknesses"]]
        
        return sections
    
    def _extract_detailed_scores(self, analysis_text: str) -> Dict:
        """Extract detailed scores and reasoning from comprehensive VC analysis"""
        
        import re
        
        detailed_scores = {
            "team": {"score": 0, "justification": "", "reasoning": ""},
            "technology": {"score": 0, "justification": "", "reasoning": ""},
            "market": {"score": 0, "justification": "", "reasoning": ""},
            "gtm_traction": {"score": 0, "justification": "", "reasoning": ""},
            "competitive": {"score": 0, "justification": "", "reasoning": ""}
        }
        
        # Extract Team Score (Category 1) - Updated regex for actual GPT-4 format
        team_match = re.search(r'🔹 CATEGORY 1: TEAM \(Score:\s*(\d+)\).*?Justification:\s*(.*?)Reasoning:\s*(.*?)(?=🔹|📊|\Z)', 
                              analysis_text, re.DOTALL | re.IGNORECASE)
        if team_match:
            detailed_scores["team"]["score"] = int(team_match.group(1))
            detailed_scores["team"]["justification"] = team_match.group(2).strip()
            detailed_scores["team"]["reasoning"] = team_match.group(3).strip()
        
        # Extract Product & Technology Score (Category 2)
        tech_match = re.search(r'🔹 CATEGORY 2: PRODUCT & TECHNOLOGY \(Score:\s*(\d+)\).*?Justification:\s*(.*?)Reasoning:\s*(.*?)(?=🔹|📊|\Z)', 
                              analysis_text, re.DOTALL | re.IGNORECASE)
        if tech_match:
            detailed_scores["technology"]["score"] = int(tech_match.group(1))
            detailed_scores["technology"]["justification"] = tech_match.group(2).strip()
            detailed_scores["technology"]["reasoning"] = tech_match.group(3).strip()
        
        # Extract Market Opportunity Score (Category 3)
        market_match = re.search(r'🔹 CATEGORY 3: MARKET OPPORTUNITY \(Score:\s*(\d+)\).*?Justification:\s*(.*?)Reasoning:\s*(.*?)(?=🔹|📊|\Z)', 
                                analysis_text, re.DOTALL | re.IGNORECASE)
        if market_match:
            detailed_scores["market"]["score"] = int(market_match.group(1))
            detailed_scores["market"]["justification"] = market_match.group(2).strip()
            detailed_scores["market"]["reasoning"] = market_match.group(3).strip()
        
        # Extract GTM & Traction Score (Category 4)
        gtm_match = re.search(r'🔹 CATEGORY 4: GO-TO-MARKET & TRACTION \(Score:\s*(\d+)\).*?Justification:\s*(.*?)Reasoning:\s*(.*?)(?=🔹|📊|\Z)', 
                             analysis_text, re.DOTALL | re.IGNORECASE)
        if gtm_match:
            detailed_scores["gtm_traction"]["score"] = int(gtm_match.group(1))
            detailed_scores["gtm_traction"]["justification"] = gtm_match.group(2).strip()
            detailed_scores["gtm_traction"]["reasoning"] = gtm_match.group(3).strip()
        
        # Extract Competitive Positioning Score (Category 5)
        comp_match = re.search(r'🔹 CATEGORY 5: COMPETITIVE POSITIONING & DEFENSIBILITY \(Score:\s*(\d+)\).*?Justification:\s*(.*?)Reasoning:\s*(.*?)(?=🔹|📊|\Z)', 
                              analysis_text, re.DOTALL | re.IGNORECASE)
        if comp_match:
            detailed_scores["competitive"]["score"] = int(comp_match.group(1))
            detailed_scores["competitive"]["justification"] = comp_match.group(2).strip()
            detailed_scores["competitive"]["reasoning"] = comp_match.group(3).strip()
        
        return detailed_scores
    
    def _calculate_score_from_detailed(self, analysis_text: str) -> Dict:
        """Calculate overall score from new 5-category detailed scores"""
        
        detailed_scores = self._extract_detailed_scores(analysis_text)
        
        # Get individual scores from 5 categories
        team_score = detailed_scores["team"]["score"] or 5
        tech_score = detailed_scores["technology"]["score"] or 5  
        market_score = detailed_scores["market"]["score"] or 5
        gtm_score = detailed_scores["gtm_traction"]["score"] or 5
        competitive_score = detailed_scores["competitive"]["score"] or 5
        
        # Calculate weighted average - emphasize tech, market, and team for biotech
        weights = {
            "team": 0.25,        # 25% - critical in biotech
            "technology": 0.30,  # 30% - most important for biotech  
            "market": 0.25,      # 25% - market opportunity
            "gtm_traction": 0.10, # 10% - early stage, less critical
            "competitive": 0.10   # 10% - important but not dominant
        }
        
        overall_score = round(
            (team_score * weights["team"] + 
             tech_score * weights["technology"] + 
             market_score * weights["market"] +
             gtm_score * weights["gtm_traction"] +
             competitive_score * weights["competitive"]), 1)
        
        return {
            "overall": overall_score,
            "team": team_score,
            "technology": tech_score,
            "market": market_score,
            "gtm_traction": gtm_score,
            "competitive_positioning": competitive_score,
            "scale": "1-10 (10 = highest)",
            "weighting": "Tech 30%, Team 25%, Market 25%, GTM 10%, Competitive 10%"
        }
    
    def _calculate_score(self, analysis_text: str) -> Dict:
        """Calculate overall investment score based on analysis"""
        
        # Simple scoring based on keywords and sentiment
        positive_indicators = ["strong", "unique", "competitive advantage", "significant market", "experienced team"]
        negative_indicators = ["risk", "challenge", "weakness", "threat", "limited", "unproven"]
        
        text_lower = analysis_text.lower()
        
        positive_score = sum(1 for indicator in positive_indicators if indicator in text_lower)
        negative_score = sum(1 for indicator in negative_indicators if indicator in text_lower)
        
        # Calculate scores out of 10
        technology_score = min(8, max(4, positive_score - negative_score + 6))
        market_score = min(8, max(4, positive_score - negative_score + 5))
        team_score = min(8, max(4, positive_score - negative_score + 6))
        
        overall_score = round((technology_score + market_score + team_score) / 3, 1)
        
        return {
            "overall": overall_score,
            "technology": technology_score,
            "market": market_score,
            "team": team_score,
            "scale": "1-10 (10 = highest)"
        }
    
    def analyze_from_file(self, analysis_file: str = "analysis_results/combined_gpt4o_analysis.json") -> Dict:
        """Analyze startup from existing analysis file"""
        
        print(f"📊 Loading analysis from: {analysis_file}")
        
        if not Path(analysis_file).exists():
            raise FileNotFoundError(f"Analysis file not found: {analysis_file}")
        
        with open(analysis_file, 'r', encoding='utf-8') as f:
            pitch_data = json.load(f)
        
        # Generate comprehensive analysis
        startup_analysis = self.analyze_startup_positioning(pitch_data)
        
        # Save analysis
        company_name = startup_analysis.get("company_overview", {}).get("name", "startup").replace(" ", "_")
        output_file = self.output_dir / f"{company_name}_comprehensive_analysis.json"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(startup_analysis, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Saved comprehensive analysis: {output_file}")
        
        return startup_analysis
    
    def generate_analysis_report(self, analysis: Dict) -> str:
        """Generate a formatted text report from analysis"""
        
        company_name = analysis.get("company_overview", {}).get("name", "Unknown Company")
        scores = analysis.get("overall_score", {})
        
        report = f"""
# COMPREHENSIVE STARTUP ANALYSIS: {company_name}

## EXECUTIVE SUMMARY
{analysis.get('executive_summary', 'No summary available')}

## OVERALL SCORING ({scores.get('scale', '')})
- Overall Score: {scores.get('overall', 'N/A')}/10
- Technology: {scores.get('technology', 'N/A')}/10
- Market: {scores.get('market', 'N/A')}/10
- Team: {scores.get('team', 'N/A')}/10

## DETAILED SCORE REASONING

### TECHNOLOGY SCORE: {scores.get('technology', 'N/A')}/10
{analysis.get('detailed_scores', {}).get('technology', {}).get('reasoning', 'No reasoning available')}

### MARKET SCORE: {scores.get('market', 'N/A')}/10
{analysis.get('detailed_scores', {}).get('market', {}).get('reasoning', 'No reasoning available')}

### TEAM SCORE: {scores.get('team', 'N/A')}/10
{analysis.get('detailed_scores', {}).get('team', {}).get('reasoning', 'No reasoning available')}

## KEY STRENGTHS
"""
        
        for strength in analysis.get('strengths', []):
            report += f"• {strength}\n"
        
        report += f"""
## KEY WEAKNESSES & RISKS
"""
        
        for weakness in analysis.get('weaknesses', []):
            report += f"• {weakness}\n"
        
        report += f"""
## COMPETITIVE DIFFERENTIATION
{analysis.get('differentiation', 'No differentiation analysis available')}

## MARKET POSITIONING
{analysis.get('market_positioning', 'No market positioning analysis available')}

## INVESTMENT THESIS
{analysis.get('investment_thesis', 'No investment thesis available')}

## STRATEGIC RECOMMENDATIONS
"""
        
        for rec in analysis.get('recommendations', []):
            report += f"• {rec}\n"
        
        report += f"""
---
Analysis generated by AI-powered startup analyzer
Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}
"""
        
        return report

def main():
    """Run comprehensive startup analysis"""
    
    print("🚀 Comprehensive Startup Analyzer")
    print("=" * 40)
    
    try:
        # Initialize analyzer
        analyzer = ComprehensiveStartupAnalyzer()
        
        # Check for existing analysis file
        analysis_file = "analysis_results/combined_gpt4o_analysis.json"
        if not Path(analysis_file).exists():
            print(f"❌ No analysis file found: {analysis_file}")
            print("💡 Run the pitch deck analyzer first:")
            print("   python step2a_gpt4o.py")
            return
        
        # Generate comprehensive analysis
        startup_analysis = analyzer.analyze_from_file(analysis_file)
        
        if "error" in startup_analysis:
            print(f"❌ Analysis failed: {startup_analysis['error']}")
            return
        
        # Generate and save report
        report = analyzer.generate_analysis_report(startup_analysis)
        company_name = startup_analysis.get("company_overview", {}).get("name", "startup").replace(" ", "_")
        report_file = analyzer.output_dir / f"{company_name}_analysis_report.md"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        
        # Show results
        print("\n" + "="*50)
        print("✨ Comprehensive Analysis Complete!")
        
        scores = startup_analysis.get("overall_score", {})
        print(f"\n📊 Overall Assessment:")
        print(f"  • Overall Score: {scores.get('overall', 'N/A')}/10")
        print(f"  • Technology: {scores.get('technology', 'N/A')}/10")
        print(f"  • Market: {scores.get('market', 'N/A')}/10")
        print(f"  • Team: {scores.get('team', 'N/A')}/10")
        
        print(f"\n📁 Files generated:")
        print(f"  • Detailed analysis: startup_analysis/{company_name}_comprehensive_analysis.json")
        print(f"  • Summary report: startup_analysis/{company_name}_analysis_report.md")
        
        # Show key highlights
        exec_summary = startup_analysis.get('executive_summary', '')
        if exec_summary:
            print(f"\n🎯 Executive Summary:")
            print(f"  {exec_summary[:200]}...")
        
        strengths = startup_analysis.get('strengths', [])
        if strengths:
            print(f"\n💪 Top Strengths:")
            for i, strength in enumerate(strengths[:3], 1):
                print(f"  {i}. {strength[:100]}...")
        
        print(f"\n🎉 Analysis complete! Review the detailed report for full insights.")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()