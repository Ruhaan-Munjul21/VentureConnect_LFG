#!/usr/bin/env python3
"""
Enhanced Content Extractor
Extract comprehensive word summaries from pitch deck slides instead of aggressive optimization
"""

import re
from typing import Dict, List

class EnhancedContentExtractor:
    """Extract detailed content summaries from slides for comprehensive analysis"""
    
    def __init__(self):
        self.biotech_keywords = [
            # Scientific terms
            'genome', 'genomic', 'epigenetic', 'transcription', 'translation', 'protein',
            'peptide', 'antigen', 'antibody', 'immunotherapy', 'cancer', 'tumor', 'oncology',
            'therapeutic', 'drug', 'clinical', 'preclinical', 'trial', 'study', 'efficacy',
            'safety', 'biomarker', 'assay', 'validation', 'discovery', 'development',
            
            # Technology terms
            'platform', 'algorithm', 'AI-powered', 'machine learning', 'high-throughput',
            'multi-omics', 'scalable', 'systematic', 'proprietary', 'novel', 'precision',
            
            # Business terms
            'market', 'TAM', 'SAM', 'SOM', 'revenue', 'funding', 'investment', 'partnership',
            'collaboration', 'license', 'patent', 'IP', 'regulatory', 'FDA', 'approval',
            
            # Specific biotech terms
            'mRNA', 'DNA', 'RNA', 'CRISPR', 'gene therapy', 'cell therapy', 'immunooncology',
            'checkpoint inhibitor', 'CAR-T', 'TCR', 'neoantigen', 'tumor antigen',
            'MHC', 'HLA', 'epitope', 'transposable elements', 'dark genome'
        ]
    
    def extract_comprehensive_summary(self, pitch_data: Dict) -> str:
        """Extract comprehensive summaries from all slides"""
        
        summaries = []
        analyses = pitch_data.get("analyses", [])
        
        for slide in analyses:
            slide_num = slide.get("slide_number", 0)
            slide_text = slide.get("analysis", "")
            
            # Skip error slides
            if slide_text.startswith("Error:"):
                continue
            
            # Extract comprehensive summary for each slide
            summary = self._extract_slide_summary(slide_text, slide_num)
            if summary:
                summaries.append(f"Slide {slide_num}: {summary}")
        
        # Combine all summaries with expanded length limits for maximum detail
        combined = "\n".join(summaries)
        
        # Increased limit to 8000 characters for maximum technical detail preservation
        if len(combined) > 8000:
            priority_slides = []
            other_slides = []
            
            for summary in summaries:
                slide_match = re.search(r'Slide (\d+):', summary)
                if slide_match:
                    slide_num = int(slide_match.group(1))
                    # Prioritize title, tech, market, team, and funding slides
                    if (slide_num <= 5 or slide_num >= 15 or 
                        self._contains_key_content(summary) or
                        self._contains_critical_tech_terms(summary)):
                        priority_slides.append(summary)
                    else:
                        other_slides.append(summary)
            
            # Include all priority slides + truncated others
            priority_content = "\n".join(priority_slides)
            remaining_space = 8000 - len(priority_content)
            
            if remaining_space > 1000:
                other_content = "\n".join(other_slides)
                if len(other_content) <= remaining_space:
                    combined = priority_content + "\n" + other_content
                else:
                    combined = priority_content + "\n" + other_content[:remaining_space] + "..."
            else:
                combined = priority_content
        
        return combined
    
    def _extract_slide_summary(self, slide_text: str, slide_num: int) -> str:
        """Extract comprehensive summary from a single slide"""
        
        # Clean the text
        text = self._clean_text(slide_text)
        
        # Extract different types of information
        key_facts = []
        
        # 1. Extract specific technical terms and concepts
        biotech_terms = self._extract_biotech_terms(text)
        if biotech_terms:
            key_facts.extend(biotech_terms[:3])
        
        # 2. Extract numbers, percentages, and metrics
        metrics = self._extract_metrics(text)
        if metrics:
            key_facts.extend(metrics[:2])
        
        # 3. Extract company/product names and key phrases
        entities = self._extract_entities(text)
        if entities:
            key_facts.extend(entities[:2])
        
        # 4. Extract slide-specific content based on slide number
        slide_specific = self._extract_slide_specific_content(text, slide_num)
        if slide_specific:
            key_facts.extend(slide_specific)
        
        # 5. If no specific extraction worked, get key sentences
        if not key_facts:
            sentences = self._extract_key_sentences(text)
            key_facts.extend(sentences[:2])
        
        # Combine with expanded length for maximum detail
        summary = "; ".join(key_facts[:5])  # Max 5 key points per slide
        return summary[:400] + "..." if len(summary) > 400 else summary
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        # Remove very verbose analysis phrases
        text = re.sub(r'This slide shows|The slide displays|This image contains', '', text)
        return text
    
    def _extract_biotech_terms(self, text: str) -> List[str]:
        """Extract specific biotech terminology"""
        found_terms = []
        text_lower = text.lower()
        
        for term in self.biotech_keywords:
            if term in text_lower:
                # Try to extract the context around the term
                pattern = rf'([^.]*{re.escape(term)}[^.]*)'
                matches = re.findall(pattern, text, re.IGNORECASE)
                for match in matches[:1]:  # Limit to 1 per term
                    clean_match = match.strip()
                    if len(clean_match) > 10 and len(clean_match) < 150:
                        found_terms.append(clean_match)
        
        return found_terms[:3]  # Max 3 biotech terms per slide
    
    def _extract_metrics(self, text: str) -> List[str]:
        """Extract numbers, percentages, and financial metrics"""
        metrics = []
        
        # Money amounts
        money_pattern = r'\$[\d,]+[KMB]?(?:\s*(?:million|billion|funding|valuation|revenue|ARR))?'
        money_matches = re.findall(money_pattern, text, re.IGNORECASE)
        for match in money_matches[:2]:
            metrics.append(f"Financial: {match}")
        
        # Percentages
        pct_pattern = r'\d+%(?:\s*(?:of|increase|decrease|improvement|efficacy|success|growth))?'
        pct_matches = re.findall(pct_pattern, text, re.IGNORECASE)
        for match in pct_matches[:2]:
            metrics.append(f"Metric: {match}")
        
        # Numbers with context
        number_pattern = r'\d+(?:,\d+)*\s*(?:patients|subjects|trials|studies|customers|users|employees|genes|proteins|compounds)'
        number_matches = re.findall(number_pattern, text, re.IGNORECASE)
        for match in number_matches[:1]:
            metrics.append(f"Scale: {match}")
        
        return metrics
    
    def _extract_entities(self, text: str) -> List[str]:
        """Extract company names, product names, and key entities"""
        entities = []
        
        # Company names (ending with common suffixes)
        company_pattern = r'[A-Z][a-zA-Z\s]+(?:Therapeutics|Pharmaceutical|Biotech|Inc|Ltd|Corp|GmbH)'
        company_matches = re.findall(company_pattern, text)
        for match in company_matches[:1]:
            entities.append(f"Company: {match.strip()}")
        
        # Drug/therapy names (capitalized words that might be products)
        drug_pattern = r'[A-Z][a-z]+(?:-[A-Z][a-z]+)*(?:\s+therapy|\s+treatment|\s+drug)?'
        drug_matches = re.findall(drug_pattern, text)
        # Filter for likely drug names (not common words)
        common_words = {'The', 'This', 'These', 'However', 'Cancer', 'Genome', 'Dark'}
        for match in drug_matches[:1]:
            if match not in common_words and len(match) > 3:
                entities.append(f"Product: {match}")
        
        return entities
    
    def _extract_slide_specific_content(self, text: str, slide_num: int) -> List[str]:
        """Extract content specific to slide position"""
        specific = []
        
        if slide_num <= 3:  # Title/overview slides
            # Look for company mission, vision, main value prop
            if 'precision' in text.lower() and 'immunotherapy' in text.lower():
                specific.append("Focus: Precision immunotherapy")
            if 'dark genome' in text.lower():
                specific.append("Technology: Dark genome targeting")
                
        elif 4 <= slide_num <= 8:  # Technology/product slides
            # Look for technical details
            if 'AI-powered' in text or 'algorithm' in text.lower():
                specific.append("Tech: AI-powered platform")
            if 'high-throughput' in text.lower():
                specific.append("Capability: High-throughput validation")
                
        elif slide_num >= 15:  # Team/funding slides
            # Look for team info
            if 'CEO' in text or 'founder' in text.lower():
                specific.append("Leadership: C-suite identified")
            if 'Series' in text or 'funding' in text.lower():
                specific.append("Status: Funding information")
        
        return specific
    
    def _extract_key_sentences(self, text: str) -> List[str]:
        """Extract the most informative sentences as fallback"""
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        
        # Score sentences by information content
        scored_sentences = []
        for sentence in sentences:
            if len(sentence) > 20 and len(sentence) < 200:
                score = 0
                # Higher score for biotech terms
                for term in self.biotech_keywords[:20]:  # Check top 20 terms
                    if term in sentence.lower():
                        score += 1
                # Higher score for numbers/metrics
                if re.search(r'\d+%|\$[\d,]+|Phase\s+[I1-3]', sentence):
                    score += 2
                
                scored_sentences.append((score, sentence))
        
        # Return top scored sentences
        scored_sentences.sort(reverse=True)
        return [sentence for score, sentence in scored_sentences[:2]]
    
    def _contains_key_content(self, summary: str) -> bool:
        """Check if summary contains key technical or business content"""
        key_indicators = [
            'technology', 'platform', 'clinical', 'market', 'funding', 'partnership',
            'AI-powered', 'precision', 'therapeutic', 'patent', 'IP', 'validation'
        ]
        
        summary_lower = summary.lower()
        return any(indicator in summary_lower for indicator in key_indicators)
    
    def _contains_critical_tech_terms(self, summary: str) -> bool:
        """Check if summary contains critical technical terms that should be prioritized"""
        critical_terms = [
            'dark genome', 'transposable elements', 'epigenetic', 'genomic instability',
            'AI-powered', 'multi-omics', 'precision immunotherapy', 'dark antigens',
            'immunogenic', 'tumor-specific', 'clinical trial', 'Phase I', 'Phase II',
            'FDA approval', 'IP', 'patent', 'proprietary', 'breakthrough', 'novel',
            'Series A', 'Series B', 'funding', 'million', 'billion', 'partnership'
        ]
        
        summary_lower = summary.lower()
        return any(term in summary_lower for term in critical_terms)

def main():
    """Test the enhanced content extractor"""
    
    # Test with sample dark genome slide content
    test_slide = {
        "slide_number": 4,
        "analysis": """This slide presents "The Dark Genome: A New Frontier in Precision Immunotherapy" by Protirna. The dark genome comprises 98% of the human genome, but its protein-coding potential has been largely overlooked. In cancer, epigenetic dysregulation and genomic instability can activate these normally silent regions, resulting in aberrant transcription and translation of novel peptides and proteins. These "dark antigens", including those derived from transposable elements (TEs), are often tumor-specific, immunogenic, and absent in normal tissues. As a result, dark antigens represent a novel class of therapeutic targets with potential for safe, potent, and precise cancer immunotherapies. Technology enablers include AI-powered platform enables systematic discovery of dark antigens across large-scale multi-omics datasets. Scalable, high-throughput validation through multi-omics and immune profiling accelerates target confirmation and therapeutic development."""
    }
    
    extractor = EnhancedContentExtractor()
    summary = extractor._extract_slide_summary(test_slide["analysis"], test_slide["slide_number"])
    
    print("🧪 Testing Enhanced Content Extraction:")
    print(f"Original length: {len(test_slide['analysis'])} chars")
    print(f"Summary length: {len(summary)} chars")
    print(f"Summary: {summary}")

if __name__ == "__main__":
    main()