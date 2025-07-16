import { db } from './db'; // Adjust the path as necessary

// Ensure VC investors table has website column
async function ensureVCInvestorsSchema() {
  try {
    // Check if website column exists
    const columns = await db.all(`PRAGMA table_info(vc_investors)`);
    const hasWebsite = columns.some(col => col.name === 'website');
    
    if (!hasWebsite) {
      console.log('Adding website column to vc_investors table...');
      await db.run(`ALTER TABLE vc_investors ADD COLUMN website TEXT`);
      console.log('✅ Website column added');
    }
    
    // Check current data
    const sampleVCs = await db.all(`SELECT name, website FROM vc_investors LIMIT 5`);
    console.log('=== SAMPLE VC DATA FROM DATABASE ===');
    sampleVCs.forEach(vc => {
      console.log(`${vc.name}: ${vc.website || 'NO WEBSITE'}`);
    });
    
  } catch (error) {
    console.error('Error checking VC investors schema:', error);
  }
}

// Call this during database initialization
ensureVCInvestorsSchema();