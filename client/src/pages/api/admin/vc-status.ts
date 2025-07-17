import { NextApiRequest, NextApiResponse } from 'next';
import vcUrlsArray from '../../data/vc-urls.json';

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
    
    // Create lookup map for performance
    const vcUrlMap: Record<string, string> = {};
    vcUrlsArray.forEach(vc => {
      vcUrlMap[vc['VC/Investor Name']] = vc['Website URL'];
    });
    
    // Check which VCs have websites in Airtable vs our fallback JSON
    const vcsWithAirtableWebsites = data.records.filter((record: any) => 
      record.fields['VC/Investor Name'] && record.fields['Website URL']
    );
    
    const vcsWithoutAirtableWebsites = data.records.filter((record: any) => 
      record.fields['VC/Investor Name'] && !record.fields['Website URL']
    );
    
    // Check how many of the missing ones we can resolve with our JSON fallback
    const vcsWithFallbackUrls = vcsWithoutAirtableWebsites.filter((record: any) => {
      const vcName = record.fields['VC/Investor Name'];
      return vcUrlMap[vcName];
    });
    
    const totalResolvableUrls = vcsWithAirtableWebsites.length + vcsWithFallbackUrls.length;
    
    const vcStatus = {
      totalVCs: data.records.length,
      activeVCs: data.records.filter((record: any) => record.fields['VC/Investor Name']).length,
      vcsWithAirtableWebsites: vcsWithAirtableWebsites.length,
      vcsWithoutAirtableWebsites: vcsWithoutAirtableWebsites.length,
      vcsWithFallbackUrls: vcsWithFallbackUrls.length,
      totalResolvableUrls: totalResolvableUrls,
      websiteCompletionRate: Math.round((totalResolvableUrls / data.records.length) * 100),
      airtableOnlyRate: Math.round((vcsWithAirtableWebsites.length / data.records.length) * 100),
      fallbackOnlyRate: Math.round((vcsWithFallbackUrls.length / data.records.length) * 100),
      totalVCsInFallbackDB: vcUrlsArray.length,
      missingWebsiteVCs: vcsWithoutAirtableWebsites
        .filter((record: any) => !vcUrlMap[record.fields['VC/Investor Name']])
        .slice(0, 10)
        .map((record: any) => record.fields['VC/Investor Name']),
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
