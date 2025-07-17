import vcUrlsArray from '../data/vc-urls.json';

export function getVcWebsiteUrl(vcName: string, airtableUrl?: string): string | null {
  // First try the Airtable URL if it exists
  if (airtableUrl && airtableUrl.trim()) {
    return airtableUrl;
  }
  
  // Fall back to our hardcoded JSON array data
  const vcMatch = vcUrlsArray.find(vc => vc['VC/Investor Name'] === vcName);
  return vcMatch ? vcMatch['Website URL'] : null;
}

export function createVcLink(vcName: string, websiteUrl?: string): { name: string; url: string | null; hasLink: boolean } {
  const url = getVcWebsiteUrl(vcName, websiteUrl);
  
  return {
    name: vcName,
    url: url,
    hasLink: !!url
  };
}

// Performance-optimized version using memoized lookup
let vcUrlMap: Record<string, string> | null = null;

export function getVcWebsiteUrlFast(vcName: string, airtableUrl?: string): string | null {
  // First try the Airtable URL if it exists
  if (airtableUrl && airtableUrl.trim()) {
    return airtableUrl;
  }
  
  // Create lookup map on first use
  if (!vcUrlMap) {
    vcUrlMap = {};
    vcUrlsArray.forEach(vc => {
      vcUrlMap![vc['VC/Investor Name']] = vc['Website URL'];
    });
  }
  
  return vcUrlMap[vcName] || null;
}

export function createVcLinkFast(vcName: string, websiteUrl?: string): { name: string; url: string | null; hasLink: boolean } {
  const url = getVcWebsiteUrlFast(vcName, websiteUrl);
  
  return {
    name: vcName,
    url: url,
    hasLink: !!url
  };
}
