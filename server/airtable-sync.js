import { db } from './db'; // Adjust the path as necessary
import airtable from 'airtable';

// Initialize Airtable
const airtableBase = new airtable.Base('appXXXXXXXXX'); // Replace with your base ID

// Function to sync VC investors from Airtable
async function syncVCInvestors() {
  try {
    console.log('=== SYNCING VC INVESTORS ===');
    
    // Fetch all records from Airtable
    const records = await airtableBase('VC/Investors').select({
      view: 'Grid view'
    }).all();
    
    console.log(`Found ${records.length} VC records in Airtable`);
    
    for (const record of records) {
      const fields = record.fields;
      
      // Debug website field specifically
      console.log(`Processing VC: ${fields['VC/Investor Name']}`);
      console.log(`Website in Airtable: ${fields['Website URL'] || 'MISSING'}`);
      
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
        fields['VC/Investor Name'] || '',
        fields['Firm'] || '',
        fields['Email'] || '',
        fields['Phone'] || '',
        fields['LinkedIn'] || '',
        fields['Website URL'] || '', // Make sure this field name matches Airtable
        fields['Investment Focus'] || '',
        fields['Investment Stage'] || '',
        fields['Geography'] || '',
        fields['Portfolio Size'] || '',
        fields['Description'] || '',
        new Date().toISOString()
      ]);
      
      console.log(`✅ Synced VC: ${fields['VC/Investor Name']} with website: ${fields['Website URL'] || 'NO WEBSITE'}`);
    }
    
    console.log('✅ VC Investors sync completed');
  } catch (error) {
    console.error('❌ Error syncing VC investors:', error);
  }
}

// Call the sync function (you may want to trigger this differently in your app)
syncVCInvestors();