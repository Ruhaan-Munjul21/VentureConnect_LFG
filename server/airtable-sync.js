import { db } from './db'; // Adjust the path as necessary
import airtable from 'airtable';

// Initialize Airtable
const airtableBase = new airtable.Base('appXXXXXXXXX'); // Replace with your base ID

// Function to sync VC investors from Airtable
async function syncVCInvestors() {
  try {
    console.log('=== SYNCING VC INVESTORS FROM AIRTABLE ===');
    
    // Fetch all records from Airtable
    const records = await airtableBase('VC Database').select({
      view: 'Grid view'
    }).all();
    
    console.log(`Found ${records.length} VC records in Airtable`);
    
    let syncCount = 0;
    let websiteCount = 0;
    
    // Check the specific VCs we know are missing websites
    const problematicVCs = ['ATEM Capital', 'Bioqube Ventures', 'Bios Partners', 'Brainchild Holdings'];
    
    for (const record of records) {
      const fields = record.fields;
      const vcName = fields['VC/Investor Name'] || '';
      const website = fields['Website URL'] || '';
      
      // Special logging for problematic VCs
      if (problematicVCs.includes(vcName)) {
        console.log(`🔍 DEBUGGING PROBLEMATIC VC: ${vcName}`);
        console.log(`  - Airtable Record ID: ${record.id}`);
        console.log(`  - Website URL field: "${website}"`);
        console.log(`  - All fields:`, Object.keys(fields));
        console.log(`  - Full record:`, fields);
      }
      
      // Debug every 10th VC for general pattern
      if (syncCount % 10 === 0) {
        console.log(`Syncing VC #${syncCount + 1}: ${vcName}`);
        console.log(`  - Website: "${website || 'EMPTY'}"`);
      }
      
      if (website) {
        websiteCount++;
      }
      
      // Insert or update VC investor with explicit debugging
      try {
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
          website, // This should be the website URL
          fields['Investment Focus'] || '',
          fields['Investment Stage'] || '',
          fields['Geography'] || '',
          fields['Portfolio Size'] || '',
          fields['Description'] || '',
          new Date().toISOString()
        ]);
        
        // Verify what was actually inserted for problematic VCs
        if (problematicVCs.includes(vcName)) {
          const dbRecord = await db.get(`SELECT name, website FROM vc_investors WHERE name = ?`, [vcName]);
          console.log(`  ✅ Database after insert: ${dbRecord?.name} -> website: "${dbRecord?.website || 'NULL'}"`);
        }
        
      } catch (dbError) {
        console.error(`❌ Database error for ${vcName}:`, dbError);
      }
      
      syncCount++;
    }
    
    console.log(`✅ VC Investors sync completed: ${syncCount} VCs synced, ${websiteCount} with websites`);
    
    // Check what's actually in the database for the problematic VCs
    console.log('=== CHECKING PROBLEMATIC VCs IN DATABASE ===');
    for (const vcName of problematicVCs) {
      const dbRecord = await db.get(`SELECT name, website, airtable_id FROM vc_investors WHERE name = ?`, [vcName]);
      if (dbRecord) {
        console.log(`${vcName}: website="${dbRecord.website || 'NULL'}" (ID: ${dbRecord.airtable_id})`);
      } else {
        console.log(`${vcName}: NOT FOUND IN DATABASE`);
      }
    }
    
    // Show sample of VCs with websites
    const withWebsites = await db.all(`SELECT name, website FROM vc_investors WHERE website IS NOT NULL AND website != '' LIMIT 10`);
    console.log('=== SAMPLE VCs WITH WEBSITES IN DATABASE ===');
    withWebsites.forEach(vc => {
      console.log(`${vc.name}: ${vc.website}`);
    });
    
  } catch (error) {
    console.error('❌ Error syncing VC investors:', error);
    throw error;
  }
}

// Call the sync function (you may want to trigger this differently in your app)
syncVCInvestors();