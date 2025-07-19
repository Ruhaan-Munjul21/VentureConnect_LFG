import { NextApiRequest, NextApiResponse } from 'next';

const AIRTABLE_API_KEY = 'patPnlxR05peVEnUc.e5a8cfe5a3f88676da4b3c124c99ed46026b4f869bb5b6a3f54cd45db17fd58f';
const BASE_ID = 'app768aQ07mCJoyu8';
const MATCHES_TABLE = 'Startup-VC Matches (POST GPT PRE-SCAN)';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { matchId } = req.query;
    const { status, notes } = req.body;
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    // Validate status
    const validStatuses = [
      'not_contacted',
      'email_sent', 
      'email_opened',
      'responded',
      'meeting_scheduled',
      'meeting_completed',
      'deal_in_progress',
      'deal_closed',
      'passed'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    console.log('🔄 Updating match status:', {
      matchId,
      status,
      hasNotes: !!notes
    });

    // Update the match status in Airtable
    const updateFields: any = {
      'Outreach Status': status,
      'Last Updated': new Date().toISOString()
    };

    if (notes) {
      updateFields['Outreach Notes'] = notes;
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${MATCHES_TABLE}/${matchId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: updateFields
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Airtable update failed:', errorData);
      throw new Error('Failed to update match status in Airtable');
    }

    const updatedRecord = await response.json();
    console.log('✅ Match status updated successfully');

    res.status(200).json({
      success: true,
      status: updatedRecord.fields['Outreach Status'],
      lastUpdated: updatedRecord.fields['Last Updated'],
      notes: updatedRecord.fields['Outreach Notes']
    });

  } catch (error) {
    console.error('❌ Error updating match status:', error);
    res.status(500).json({ error: 'Failed to update match status' });
  }
}