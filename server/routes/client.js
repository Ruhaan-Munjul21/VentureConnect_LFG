import { db } from '../database.js';
import { authenticateClient } from '../middleware/auth.js';

// Get client matches endpoint
app.get('/api/client/matches', authenticateClient, async (req, res) => {
  try {
    const clientId = req.client.id;
    
    // Fetch matches with proper VC data joining
    const matches = await db.all(`
      SELECT 
        cm.*,
        vi.id as vc_id,
        vi.name as vc_name,
        vi.firm,
        vi.email as vc_email,
        vi.phone as vc_phone,
        vi.linkedin,
        vi.website,
        vi.investment_focus,
        vi.investment_stage,
        vi.geography,
        vi.portfolio_size,
        vi.description as vc_description,
        cm.match_reasoning,
        cm.portfolio_reasoning
      FROM client_matches cm
      LEFT JOIN vc_investors vi ON cm.vc_investor_id = vi.id
      WHERE cm.client_id = ? AND cm.client_access = 1
      ORDER BY cm.assigned_at DESC
    `, [clientId]);

    console.log('=== BACKEND MATCHES DEBUG ===');
    console.log(`Found ${matches.length} matches for client ${clientId}`);
    
    const formattedMatches = matches.map(match => {
      console.log(`Processing match for VC: ${match.vc_name || match.vcName}`);
      console.log(`Website data: ${match.website || 'NULL'}`);
      
      return {
        id: match.id,
        isUnlocked: match.client_access === 1,
        assignedAt: match.assigned_at,
        notes: match.notes,
        vcName: match.vc_name,
        matchReasoning: match.match_reasoning,
        portfolioReasoning: match.portfolio_reasoning,
        vcInvestor: {
          id: match.vc_id,
          name: match.vc_name,
          firm: match.firm,
          email: match.vc_email,
          phone: match.vc_phone,
          linkedin: match.linkedin,
          website: match.website, // This should now include the website data
          investmentFocus: match.investment_focus,
          investmentStage: match.investment_stage,
          geography: match.geography,
          portfolioSize: match.portfolio_size,
          description: match.vc_description
        }
      };
    });

    console.log('=== FORMATTED MATCHES SAMPLE ===');
    if (formattedMatches.length > 0) {
      console.log('Sample VC data:', {
        name: formattedMatches[0].vcInvestor.name,
        website: formattedMatches[0].vcInvestor.website,
        firm: formattedMatches[0].vcInvestor.firm
      });
    }

    res.json({
      success: true,
      data: formattedMatches
    });
  } catch (error) {
    console.error('Error fetching client matches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch matches'
    });
  }
});