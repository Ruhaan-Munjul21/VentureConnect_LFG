import { NextApiRequest, NextApiResponse } from 'next';

const AIRTABLE_API_KEY = 'patPnlxR05peVEnUc.e5a8cfe5a3f88676da4b3c124c99ed46026b4f869bb5b6a3f54cd45db17fd58f';
const BASE_ID = 'app768aQ07mCJoyu8';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const applicationData = req.body;

    console.log('📝 Submitting premium support application for:', applicationData.companyName);

    // Create a new table entry for Premium Support Applications
    const airtableData = {
      records: [
        {
          fields: {
            'Company Name': applicationData.companyName,
            'Founder Name': applicationData.founderName,
            'Email': applicationData.email,
            'Phone': applicationData.phone || '',
            'LinkedIn Profile': applicationData.linkedinProfile || '',
            'Current Stage': applicationData.currentStage,
            'Funding Goal': applicationData.fundingGoal,
            'Previous Funding Raised': applicationData.previousFundingRaised || '',
            'Current Revenue': applicationData.currentRevenue || '',
            'Team Size': applicationData.teamSize || '',
            'Industry Focus': applicationData.industryFocus,
            'Pitch Deck Status': applicationData.pitchDeckStatus,
            'Fundraising Timeline': applicationData.fundraisingTimeline,
            'Specific Challenges': applicationData.specificChallenges,
            'Why Premium Support': applicationData.whyPremiumSupport,
            'Additional Info': applicationData.additionalInfo || '',
            'Application Status': 'Under Review',
            'Submitted At': new Date().toISOString(),
            'Priority Score': calculatePriorityScore(applicationData)
          }
        }
      ]
    };

    // Try to create the table entry - first check if table exists
    let tableName = 'Premium Support Applications';
    let response;

    try {
      response = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(airtableData)
        }
      );
    } catch (tableError) {
      // If table doesn't exist, create in a general applications table
      console.log('Creating premium application in general table...');
      tableName = 'Startup Submissions';
      
      // Modify the data structure for the existing table
      const generalTableData = {
        records: [
          {
            fields: {
              'Startup Name': applicationData.companyName,
              'Contact Name': applicationData.founderName,
              'Email': applicationData.email,
              'Phone': applicationData.phone || '',
              'Application Type': 'Premium Support',
              'Stage': applicationData.currentStage,
              'Funding Goal': applicationData.fundingGoal,
              'Industry Focus': applicationData.industryFocus,
              'Additional Notes': `PREMIUM SUPPORT APPLICATION\n\nChallenges: ${applicationData.specificChallenges}\n\nWhy Premium: ${applicationData.whyPremiumSupport}\n\nTimeline: ${applicationData.fundraisingTimeline}\n\nPitch Deck Status: ${applicationData.pitchDeckStatus}`,
              'Submitted At': new Date().toISOString()
            }
          }
        ]
      };

      response = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(generalTableData)
        }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Airtable submission failed:', errorText);
      throw new Error('Failed to submit application to Airtable');
    }

    const result = await response.json();
    console.log('✅ Premium support application submitted successfully');

    // Send notification email (in production, you'd use a service like SendGrid)
    console.log('📧 Notification: Premium support application received from', applicationData.companyName);

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: result.records[0].id
    });

  } catch (error) {
    console.error('❌ Error submitting premium support application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
}

function calculatePriorityScore(data: any): number {
  let score = 0;
  
  // Stage scoring (later stage = higher score)
  const stageScores: Record<string, number> = {
    'pre-seed': 1,
    'seed': 2,
    'series-a': 4,
    'series-b': 5,
    'series-c': 5
  };
  score += stageScores[data.currentStage] || 0;

  // Funding goal scoring (reasonable amounts get higher scores)
  const fundingAmount = data.fundingGoal?.toLowerCase() || '';
  if (fundingAmount.includes('m')) {
    const amount = parseInt(fundingAmount.replace(/[^0-9]/g, ''));
    if (amount >= 10 && amount <= 100) score += 3;
    else if (amount >= 5) score += 2;
    else score += 1;
  }

  // Industry focus scoring
  const highValueIndustries = ['oncology', 'immunology', 'rare-diseases', 'neurology'];
  if (highValueIndustries.includes(data.industryFocus)) {
    score += 2;
  }

  // Timeline scoring (immediate needs get higher priority)
  const timelineScores: Record<string, number> = {
    'immediate': 3,
    'short-term': 2,
    'medium-term': 1,
    'long-term': 0
  };
  score += timelineScores[data.fundraisingTimeline] || 0;

  // Pitch deck readiness
  const pitchScores: Record<string, number> = {
    'ready-to-present': 2,
    'needs-refinement': 3, // Needs help but has something
    'first-draft': 2,
    'not-started': 1
  };
  score += pitchScores[data.pitchDeckStatus] || 0;

  return Math.min(score, 10); // Cap at 10
}