import { NextApiRequest, NextApiResponse } from 'next';
import vcUrlsArray from '../../data/vc-urls.json';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const airtableApiKey = process.env.AIRTABLE_API_KEY;
    const airtableBaseId = process.env.AIRTABLE_BASE_ID;
    
    if (!airtableApiKey || !airtableBaseId) {
      return res.status(500).json({ error: 'Airtable configuration missing' });
    }

    // Fetch all VCs from Airtable VC Database table
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
    
    // Create lookup map for performance
    const vcUrlMap: Record<string, string> = {};
    vcUrlsArray.forEach(vc => {
      vcUrlMap[vc['VC/Investor Name']] = vc['Website URL'];
    });
    
    // Process the sync results
    const validVCs = data.records.filter((record: any) => 
      record.fields['VC/Investor Name'] && (record.fields['Website URL'] || vcUrlMap[record.fields['VC/Investor Name']])
    );

    const syncResult = {
      success: true,
      synced: validVCs.length,
      errors: data.records.length - validVCs.length,
      timestamp: new Date().toISOString(),
      totalRecords: data.records.length,
      validVCs: validVCs.length,
      fallbackUrlsAvailable: vcUrlsArray.length
    };

    console.log('VC sync completed:', syncResult);

    res.status(200).json({
      success: true,
      data: syncResult,
      message: `VC sync from Airtable completed successfully. Synced ${validVCs.length} valid VCs out of ${data.records.length} total records. ${vcUrlsArray.length} fallback URLs available.`
    });
  } catch (error) {
    console.error('Error syncing VCs from Airtable:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync VCs from Airtable'
    });
  }
}
