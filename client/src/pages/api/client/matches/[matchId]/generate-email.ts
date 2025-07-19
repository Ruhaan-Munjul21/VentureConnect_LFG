import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const AIRTABLE_API_KEY = 'patPnlxR05peVEnUc.e5a8cfe5a3f88676da4b3c124c99ed46026b4f869bb5b6a3f54cd45db17fd58f';
const BASE_ID = 'app768aQ07mCJoyu8';
const STARTUP_TABLE = 'Startup Submissions';
const MATCHES_TABLE = 'Startup-VC Matches (POST GPT PRE-SCAN)';
const VC_TABLE = 'VC Database';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { matchId } = req.query;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    // Fetch match details from Airtable
    const matchResponse = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${MATCHES_TABLE}/${matchId}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!matchResponse.ok) {
      throw new Error('Failed to fetch match details');
    }

    const matchData = await matchResponse.json();
    const match = matchData.fields;

    console.log('🔍 Match data:', {
      startupName: match['Startup Name'],
      vcName: match['VC Name'],
      hasPersonalizedEmail: !!match['Personalized Email']
    });

    // If email already exists, return it
    if (match['Personalized Email']) {
      return res.status(200).json({
        email: match['Personalized Email'],
        cached: true,
        message: 'Email already generated'
      });
    }

    // Fetch startup analysis data
    const startupResponse = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${STARTUP_TABLE}?filterByFormula=${encodeURIComponent(`{Startup Name} = "${match['Startup Name']}"`)}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const startupData = await startupResponse.json();
    const startup = startupData.records[0]?.fields;

    if (!startup) {
      throw new Error('Startup data not found');
    }

    // Fetch VC details  
    const vcResponse = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${VC_TABLE}?filterByFormula=${encodeURIComponent(`{Name} = "${match['VC Name']}"`)}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const vcData = await vcResponse.json();
    const vc = vcData.records[0]?.fields;

    console.log('📊 Data collected:', {
      startupName: startup['Startup Name'],
      hasAnalysis: !!startup['AI Analysis Summary'],
      vcName: vc?.Name || match['VC Name'],
      vcFocus: vc?.['Investment Focus']
    });

    // Generate personalized email using OpenAI
    const email = await generatePersonalizedEmail(startup, vc || {}, match);

    // Save email back to Airtable
    await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${MATCHES_TABLE}/${matchId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'Personalized Email': email
          }
        })
      }
    );

    console.log('✅ Email generated and saved for match:', matchId);

    res.status(200).json({
      email,
      cached: false,
      message: 'Email generated successfully'
    });

  } catch (error) {
    console.error('❌ Error generating email:', error);
    res.status(500).json({ error: 'Failed to generate personalized email' });
  }
}

async function generatePersonalizedEmail(startup: any, vc: any, match: any): Promise<string> {
  const prompt = `You are an expert venture associate and persuasive strategist.

STARTUP INFORMATION:
Company: ${startup['Startup Name'] || 'Unknown'}
Analysis Summary: ${startup['AI Analysis Summary'] || 'Advanced biotech company'}
Technology Score: ${startup['Technology Score'] || 'N/A'}/10
Market Score: ${startup['Market Score'] || 'N/A'}/10
Team Score: ${startup['Team Score'] || 'N/A'}/10
Investment Thesis: ${startup['Investment Thesis'] || 'Promising biotech opportunity'}
Competitive Differentiation: ${startup['Competitive Differentiation'] || 'Unique technology platform'}
Therapeutic Focus: ${startup['AI Detected Therapeutic Focus'] || 'Healthcare/Biotech'}
Strengths: ${startup['Key Strengths'] || 'Strong technology and team'}

VC INFORMATION:
Name: ${vc.Name || match['VC Name'] || 'Unknown'}
Firm: ${vc.Firm || 'Investment Firm'}
Investment Focus: ${vc['Investment Focus'] || 'Biotech, Healthcare'}
Investment Stage: ${vc['Investment Stage'] || 'Early to Growth'}
Geography: ${vc.Geography || 'US'}
Portfolio Size: ${vc['Portfolio Size'] || 'Not specified'}
Description: ${vc.Description || 'Healthcare-focused investor'}

MATCH REASONING:
${match['Match Reasoning'] || 'Strong strategic fit based on investment thesis and portfolio alignment'}

Your task is to write a compelling, intellectually rigorous cold email to this VC that:

1. References their investment focus, portfolio themes, or stated interest areas
2. Highlights how the startup complements, extends, or redefines their investment thesis
3. Includes key traction metrics and differentiators without sounding like a pitch deck copy-paste
4. Uses a tone that is confident, thoughtful, and respectful of their time
5. Ends with a soft, low-friction CTA (e.g., "open to a 15-min intro chat?")

Key requirements:
- Be strategic and think like a GP preparing for Monday IC
- If information is missing, infer intelligently based on sector, stage, region
- Reference specific technical advantages and market positioning
- Keep it concise but substantive (300-400 words max)
- Include a compelling subject line

Format:
Subject: [Subject line]

[Email body]

Generate the email now:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.7
    });

    const email = completion.choices[0]?.message?.content?.trim() || '';
    
    if (!email) {
      throw new Error('OpenAI returned empty response');
    }

    console.log('📧 Generated email preview:', email.substring(0, 200) + '...');
    return email;

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback email template
    return `Subject: ${startup['Startup Name']} - ${startup['AI Detected Therapeutic Focus'] || 'Biotech'} Innovation Opportunity

Dear ${vc.Name || match['VC Name'] || 'Team'},

I wanted to reach out regarding ${startup['Startup Name']}, a ${startup['AI Detected Therapeutic Focus'] || 'biotech'} company that aligns well with your investment focus in ${vc['Investment Focus'] || 'healthcare innovation'}.

${startup['Startup Name']} has developed ${startup['Investment Thesis'] || 'innovative technology'} with strong differentiation in ${startup['Competitive Differentiation'] || 'the market'}. Our AI analysis indicates strong scores across technology (${startup['Technology Score'] || 'N/A'}/10), market opportunity (${startup['Market Score'] || 'N/A'}/10), and team strength (${startup['Team Score'] || 'N/A'}/10).

Key highlights:
• ${startup['Key Strengths'] || 'Strong technology platform'}
• ${startup['AI Detected Therapeutic Focus'] || 'Focused therapeutic area'}
• ${startup['Investment Thesis'] || 'Clear value proposition'}

Given your portfolio's focus on ${vc['Investment Stage'] || 'growth-stage'} ${vc['Investment Focus'] || 'healthcare'} companies, I believe this could be a compelling opportunity for your consideration.

Would you be open to a brief 15-minute introduction call to discuss further?

Best regards,
[Your name]`;
  }
}