const APP_TOKEN = 'c07g6t40';
const BASE_URL = 'https://keyvalue.immanuel.co/api/KeyVal';

export const pushCloudRecord = async (key: string, data: any): Promise<boolean> => {
  try {
    const jsonStr = JSON.stringify(data);
    // Standard UTF-8 safe Base64 encoding in browser JS (btoa + unescape + encodeURIComponent)
    const safeB64 = btoa(unescape(encodeURIComponent(jsonStr)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const res = await fetch(`${BASE_URL}/UpdateValue/${APP_TOKEN}/${key}/${safeB64}`, {
      method: 'POST'
    });
    return res.ok;
  } catch (e) {
    console.warn(`Cloud push failed for key ${key}`, e);
    return false;
  }
};

export const pullCloudRecord = async (key: string): Promise<any | null> => {
  try {
    const res = await fetch(`${BASE_URL}/GetValue/${APP_TOKEN}/${key}`);
    if (res.ok) {
      let rawB64 = await res.json();
      if (typeof rawB64 === 'string' && rawB64.trim().length > 0) {
        rawB64 = rawB64.trim().replace(/-/g, '+').replace(/_/g, '/');
        while (rawB64.length % 4 !== 0) {
          rawB64 += '=';
        }
        const jsonStr = decodeURIComponent(escape(atob(rawB64)));
        return JSON.parse(jsonStr);
      }
    }
  } catch (e) {
    console.warn(`Cloud pull failed for key ${key}`, e);
  }
  return null;
};
