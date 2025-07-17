import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch VC data from Airtable
    const airtableApiKey = process.env.AIRTABLE_API_KEY;
    const airtableBaseId = process.env.AIRTABLE_BASE_ID;
    
    if (!airtableApiKey || !airtableBaseId) {
      return res.status(500).json({ error: 'Airtable configuration missing' });
    }

    const response = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/VC%20Database`, {
      headers: {
        'Authorization': `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    
    const vcStatus = {
      totalVCs: data.records.length,
      activeVCs: data.records.filter((record: any) => record.fields['VC/Investor Name']).length,
      lastSync: new Date().toISOString(),
      syncInProgress: false,
      totalRecords: data.records.length
    };

    res.status(200).json({
      success: true,
      data: vcStatus
    });
  } catch (error) {
    console.error('Error fetching VC status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch VC status from Airtable'
    });
  }
}
