import { db } from './db'; // Adjust the path as necessary
import airtable from 'airtable';

// Initialize Airtable
const airtableBase = new airtable.Base('appXXXXXXXXX'); // Replace with your base ID

// Function to sync VC investors from Airtable
async function syncVCInvestors() {
  try {
    console.log('=== SYNCING VC INVESTORS FROM AIRTABLE ===');
    
    // Fetch all records from Airtable
    const records = await airtableBase('VC/Investors').select({
      view: 'Grid view'
    }).all();
    
    console.log(`Found ${records.length} VC records in Airtable`);
    
    let syncCount = 0;
    let websiteCount = 0;
    
    for (const record of records) {
      const fields = record.fields;
      const vcName = fields['VC/Investor Name'] || '';
      const website = fields['Website URL'] || fields['Website'] || fields['website'] || '';
      
      // Debug each VC sync
      console.log(`Syncing VC: ${vcName}`);
      console.log(`  - Website from Airtable: "${website}" (field name: Website URL)`);
      console.log(`  - All Airtable fields:`, Object.keys(fields));
      
      if (website) {
        websiteCount++;
        console.log(`  ✅ Has website: ${website}`);
      } else {
        console.log(`  ❌ No website data`);
      }
      
      // Insert or update VC investor
      await db.run(`
        INSERT OR REPLACE INTO vc_investors (
          airtable_id,
          name,
          firm,
          email,
          phone,
          linkedin,
          website,
          investment_focus,
          investment_stage,
          geography,
          portfolio_size,
          description,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        record.id,
        vcName,
        fields['Firm'] || '',
        fields['Email'] || '',
        fields['Phone'] || '',
        fields['LinkedIn'] || '',
        website, // Use the website variable we extracted
        fields['Investment Focus'] || '',
        fields['Investment Stage'] || '',
        fields['Geography'] || '',
        fields['Portfolio Size'] || '',
        fields['Description'] || '',
        new Date().toISOString()
      ]);
      
      syncCount++;
    }
    
    console.log(`✅ VC Investors sync completed: ${syncCount} VCs synced, ${websiteCount} with websites`);
    
    // Check what's actually in the database now
    const dbVCs = await db.all(`SELECT name, website FROM vc_investors WHERE website IS NOT NULL AND website != '' LIMIT 10`);
    console.log('=== VCs WITH WEBSITES IN DATABASE ===');
    dbVCs.forEach(vc => {
      console.log(`${vc.name}: ${vc.website}`);
    });
    
  } catch (error) {
    console.error('❌ Error syncing VC investors:', error);
    throw error;
  }
}

// Call the sync function (you may want to trigger this differently in your app)
syncVCInvestors();