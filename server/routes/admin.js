import { Router } from 'express';
import { syncVCInvestors } from '../airtable-sync';

const router = Router();

// Manual sync endpoint for testing
router.post('/api/admin/sync-vcs', async (req, res) => {
  try {
    console.log('=== MANUAL VC SYNC TRIGGERED ===');
    
    // Run the sync
    await syncVCInvestors();
    
    console.log('✅ Manual VC sync completed');
    
    res.json({
      success: true,
      message: 'VC sync completed successfully'
    });
  } catch (error) {
    console.error('❌ Manual VC sync failed:', error);
    res.status(500).json({
      success: false,
      message: 'VC sync failed',
      error: error.message
    });
  }
});

// Check VC database status
router.get('/api/admin/vc-status', async (req, res) => {
  try {
    const totalVCs = await db.get(`SELECT COUNT(*) as count FROM vc_investors`);
    const withWebsites = await db.get(`SELECT COUNT(*) as count FROM vc_investors WHERE website IS NOT NULL AND website != ''`);
    const problematicVCs = await db.all(`
      SELECT name, website FROM vc_investors 
      WHERE name IN ('ATEM Capital', 'Bioqube Ventures', 'Bios Partners', 'Brainchild Holdings', 'Foresite Capital', 'Forbion')
    `);
    
    const sampleWithWebsites = await db.all(`
      SELECT name, website FROM vc_investors 
      WHERE website IS NOT NULL AND website != '' 
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: {
        totalVCs: totalVCs.count,
        withWebsites: withWebsites.count,
        problematicVCs: problematicVCs,
        sampleWithWebsites: sampleWithWebsites
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check VC status',
      error: error.message
    });
  }
});

export default router;