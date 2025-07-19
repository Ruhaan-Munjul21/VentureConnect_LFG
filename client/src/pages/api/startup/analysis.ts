import { NextApiRequest, NextApiResponse } from 'next';

const AIRTABLE_API_KEY = 'patPnlxR05peVEnUc.e5a8cfe5a3f88676da4b3c124c99ed46026b4f869bb5b6a3f54cd45db17fd58f';
const BASE_ID = 'app768aQ07mCJoyu8';
const TABLE_NAME = 'Startup Submissions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    // Decode the token to get startup name
    const startupName = Buffer.from(token as string, 'base64').toString('utf-8');
    
    // URL encode the filter
    const filterFormula = encodeURIComponent(`{Startup Name} = "${startupName}"`);
    
    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=${filterFormula}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!airtableResponse.ok) {
      throw new Error('Failed to fetch from Airtable');
    }

    const data = await airtableResponse.json();
    
    // Get the first matching record
    const startupRecord = data.records[0];

    if (!startupRecord) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    const fields = startupRecord.fields;
    
    // Transform Airtable data to our analysis format
    const analysisData = {
      startupName: fields['Startup Name'] || 'Unknown Company',
      overallScore: fields['Overall Score'] || 0,
      technologyScore: fields['Technology Score'] || 0,
      marketScore: fields['Market Score'] || 0,
      teamScore: fields['Team Score'] || 0,
      technologyReasoning: fields['Technology Score Reasoning'] || 'No reasoning available',
      marketReasoning: fields['Market Score Reasoning'] || 'No reasoning available',
      teamReasoning: fields['Team Score Reasoning'] || 'No reasoning available',
      analysisSummary: fields['AI Analysis Summary'] || 'No summary available',
      competitiveDifferentiation: fields['Competitive Differentiation'] || 'No differentiation analysis available',
      investmentThesis: fields['Investment Thesis'] || 'No investment thesis available',
      therapeuticFocus: fields['AI Detected Therapeutic Focus'] || 'Unknown focus'
    };

    res.status(200).json(analysisData);

  } catch (error) {
    console.error('Error in startup analysis endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}