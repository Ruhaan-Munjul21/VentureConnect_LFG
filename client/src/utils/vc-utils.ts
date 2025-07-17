import vcUrlsArray from '../data/vc-urls.json';

// Create lookup map for performance - using memoization
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
        vcUrlMap![vcName] = vcUrl;
        // Debug log for specific VCs we're having trouble with
        if (['ATEM Capital', 'Brainchild Holdings', 'Health Technologies Holding - HTH'].includes(vcName)) {
          console.log(`✅ Mapped problematic VC: "${vcName}" -> "${vcUrl}"`);
        }
      }
    });
    
    console.log(`✅ VC URL map initialized with ${Object.keys(vcUrlMap).length} entries`);
    
    // Test specific lookups
    console.log('🧪 Testing specific VC lookups:');
    console.log('ATEM Capital:', vcUrlMap['ATEM Capital']);
    console.log('Brainchild Holdings:', vcUrlMap['Brainchild Holdings']);
    console.log('ARCH Venture Partners:', vcUrlMap['ARCH Venture Partners']);
  }
}

export function getVcWebsiteUrl(vcName: string, airtableUrl?: string): string | null {
  console.log(`🔍 Looking up URL for: "${vcName}"`);
  
  // First try the Airtable URL if it exists
  if (airtableUrl && airtableUrl.trim()) {
    console.log(`🌐 Using Airtable URL for ${vcName}: ${airtableUrl}`);
    return airtableUrl;
  }
  
  // Initialize the map if not already done
  initializeVcUrlMap();
  
  // Look up in our JSON data with exact match
  const foundUrl = vcUrlMap![vcName];
  if (foundUrl) {
    console.log(`✅ Found fallback URL for "${vcName}": ${foundUrl}`);
    return foundUrl;
  } else {
    console.log(`❌ No URL found for "${vcName}"`);
    
    // Debug: check if the VC name has any extra characters
    console.log(`   Checking for variations of "${vcName}"`);
    const matchingKeys = Object.keys(vcUrlMap!).filter(key => 
      key.toLowerCase().includes(vcName.toLowerCase()) || 
      vcName.toLowerCase().includes(key.toLowerCase())
    );
    
    if (matchingKeys.length > 0) {
      console.log(`   Similar matches found:`, matchingKeys);
    }
    
    return null;
  }
}

export function getVcWebsiteUrlFast(vcName: string, airtableUrl?: string): string | null {
  return getVcWebsiteUrl(vcName, airtableUrl);
}

export function createVcLink(vcName: string, websiteUrl?: string): { name: string; url: string | null; hasLink: boolean } {
  const url = getVcWebsiteUrl(vcName, websiteUrl);
  
  return {
    name: vcName,
    url: url,
    hasLink: !!url
  };
}

export function createVcLinkFast(vcName: string, websiteUrl?: string): { name: string; url: string | null; hasLink: boolean } {
  const url = getVcWebsiteUrl(vcName, websiteUrl);
  
  const result = {
    name: vcName,
    url: url,
    hasLink: !!url
  };
  
  console.log(`🔗 VC Link Result for "${vcName}":`, result);
  return result;
}

// Debug function to manually test the lookup
export function testVcLookup(vcName: string): void {
  console.log(`🔍 Testing lookup for: "${vcName}"`);
  initializeVcUrlMap();
  const result = vcUrlMap![vcName];
  console.log(`   Result: ${result ? `✅ ${result}` : '❌ Not found'}`);
}
