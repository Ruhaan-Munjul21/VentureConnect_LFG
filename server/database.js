import { db } from './db'; // Adjust the path as necessary

// Ensure VC investors table has proper schema
async function ensureVCInvestorsSchema() {
  try {
    console.log('=== CHECKING VC INVESTORS TABLE SCHEMA ===');
    
    // Check if table exists and get current schema
    const tableInfo = await db.all(`PRAGMA table_info(vc_investors)`);
    console.log('Current vc_investors columns:', tableInfo.map(col => col.name));
    
    const hasWebsite = tableInfo.some(col => col.name === 'website');
    
    if (!hasWebsite) {
      console.log('❌ Website column missing, adding it...');
      await db.run(`ALTER TABLE vc_investors ADD COLUMN website TEXT`);
      console.log('✅ Website column added');
    } else {
      console.log('✅ Website column exists');
    }
    
    // Check current website data in database
    const websiteStats = await db.get(`
      SELECT 
        COUNT(*) as total,
        COUNT(website) as has_website_field,
        COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) as has_website_data
      FROM vc_investors
    `);
    
    console.log('=== DATABASE WEBSITE STATS ===');
    console.log(`Total VCs: ${websiteStats.total}`);
    console.log(`VCs with website field: ${websiteStats.has_website_field}`);
    console.log(`VCs with website data: ${websiteStats.has_website_data}`);
    
    // Show sample VCs with and without websites
    const withWebsites = await db.all(`SELECT name, website FROM vc_investors WHERE website IS NOT NULL AND website != '' LIMIT 5`);
    const withoutWebsites = await db.all(`SELECT name, website FROM vc_investors WHERE website IS NULL OR website = '' LIMIT 5`);
    
    console.log('=== SAMPLE VCs WITH WEBSITES ===');
    withWebsites.forEach(vc => console.log(`${vc.name}: ${vc.website}`));
    
    console.log('=== SAMPLE VCs WITHOUT WEBSITES ===');
    withoutWebsites.forEach(vc => console.log(`${vc.name}: ${vc.website || 'NULL'}`));
    
  } catch (error) {
    console.error('❌ Error checking VC investors schema:', error);
  }
}

// Call this during database initialization
await ensureVCInvestorsSchema();