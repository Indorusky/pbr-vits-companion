const APP_TOKEN = 'c07g6t40';
const BASE_URL = 'https://keyvalue.immanuel.co/api/KeyVal';

export const pushCloudRecord = async (key: string, data: any): Promise<boolean> => {
  try {
    const jsonStr = JSON.stringify(data);
    const b64 = btoa(encodeURIComponent(jsonStr))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const res = await fetch(`${BASE_URL}/UpdateValue/${APP_TOKEN}/${key}/${b64}`, {
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
      let b64 = await res.json();
      if (typeof b64 === 'string' && b64.length > 0) {
        b64 = b64.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4 !== 0) {
          b64 += '=';
        }
        const jsonStr = decodeURIComponent(atob(b64));
        return JSON.parse(jsonStr);
      }
    }
  } catch (e) {
    console.warn(`Cloud pull failed for key ${key}`, e);
  }
  return null;
};
