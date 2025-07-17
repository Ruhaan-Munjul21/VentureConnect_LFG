import vcUrlsArray from '../data/vc-urls.json';

let vcUrlMap: Record<string, string> | null = null;

function initializeVcUrlMap() {
  if (!vcUrlMap) {
    console.log('🚀 Initializing VC URL map from JSON array...');
    console.log('Total VCs in JSON:', vcUrlsArray.length);
    vcUrlMap = {};
    
    vcUrlsArray.forEach((vc, index) => {
      const vcName = vc['VC/Investor Name'];
      const vcUrl = vc['Website URL'];
      
      if (vcName && vcUrl) {
        // Store the exact name
        vcUrlMap![vcName] = vcUrl;
        
        // Also store trimmed version to handle trailing spaces
        const trimmedName = vcName.trim();
        if (trimmedName !== vcName) {
          vcUrlMap![trimmedName] = vcUrl;
        }
        
        // Store version with extra spaces removed for extra safety
        const normalizedName = vcName.replace(/\s+/g, ' ').trim();
        if (normalizedName !== vcName && normalizedName !== trimmedName) {
          vcUrlMap![normalizedName] = vcUrl;
        }
        
        // Debug log for specific VCs we're having trouble with
        if (['ATEM Capital', '4BIO Capital', 'Brainchild Holdings', 'Atlantic Bridge', 'AAF Management Ltd', 'Ascension Ventures'].includes(vcName)) {
          console.log(`✅ Mapped VC: "${vcName}" -> "${vcUrl}"`);
        }
      }
    });
    
    console.log(`✅ VC URL map initialized with ${Object.keys(vcUrlMap).length} entries`);
    
    // Test specific problematic lookups
    console.log('🧪 Testing specific VC lookups:');
    console.log('ATEM Capital:', vcUrlMap['ATEM Capital']);
    console.log('4BIO Capital:', vcUrlMap['4BIO Capital']);
    console.log('Brainchild Holdings:', vcUrlMap['Brainchild Holdings']);
    console.log('Atlantic Bridge:', vcUrlMap['Atlantic Bridge']);
    console.log('Ascension Ventures:', vcUrlMap['Ascension Ventures']);
  }
}

export function createVcLinkFast(vcName: string, airtableWebsite?: string): { name: string; url: string | null; hasLink: boolean } {
  console.log(`🔍 Creating VC link for: "${vcName}" (length: ${vcName.length})`);
  console.log(`📧 Airtable website provided: "${airtableWebsite}"`);
  
  // Initialize map if needed
  initializeVcUrlMap();
  
  let finalUrl: string | null = null;
  
  // First try airtable URL
  if (airtableWebsite && airtableWebsite.trim()) {
    finalUrl = airtableWebsite.trim();
    console.log(`✅ Using Airtable URL: ${finalUrl}`);
  } else {
    // Try JSON fallback with multiple approaches
    const originalName = vcName;
    const trimmedName = vcName.trim();
    const normalizedName = vcName.replace(/\s+/g, ' ').trim();
    
    console.log(`   Trying lookups:`);
    console.log(`   - Original: "${originalName}"`);
    console.log(`   - Trimmed: "${trimmedName}"`);
    console.log(`   - Normalized: "${normalizedName}"`);
    
    // Try exact match first
    let jsonUrl = vcUrlMap![originalName];
    if (jsonUrl) {
      finalUrl = jsonUrl;
      console.log(`✅ Found with original name: ${finalUrl}`);
    } else {
      // Try trimmed
      jsonUrl = vcUrlMap![trimmedName];
      if (jsonUrl) {
        finalUrl = jsonUrl;
        console.log(`✅ Found with trimmed name: ${finalUrl}`);
      } else {
        // Try normalized
        jsonUrl = vcUrlMap![normalizedName];
        if (jsonUrl) {
          finalUrl = jsonUrl;
          console.log(`✅ Found with normalized name: ${finalUrl}`);
        } else {
          console.log(`❌ No URL found for any variation of "${vcName}"`);
          
          // Debug: show similar names
          const similarKeys = Object.keys(vcUrlMap!).filter(key => 
            key.toLowerCase().includes(trimmedName.toLowerCase().substring(0, 4)) ||
            trimmedName.toLowerCase().includes(key.toLowerCase().substring(0, 4))
          ).slice(0, 5);
          
          if (similarKeys.length > 0) {
            console.log(`   🔍 Similar keys found:`, similarKeys);
          }
        }
      }
    }
  }
  
  const result = {
    name: vcName.trim(), // Always return trimmed name for display
    url: finalUrl,
    hasLink: !!finalUrl
  };
  
  console.log(`🔗 Final result:`, result);
  return result;
}
