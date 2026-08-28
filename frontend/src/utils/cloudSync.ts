const APP_TOKEN = 'c07g6t40';
const BASE_URL = 'https://keyvalue.immanuel.co/api/KeyVal';

const stringToHex = (str: string): string => {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    hex += code.toString(16).padStart(2, '0');
  }
  return hex;
};

const hexToString = (hex: string): string => {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    const hexVal = hex.substr(i, 2);
    const code = parseInt(hexVal, 16);
    if (!isNaN(code)) {
      str += String.fromCharCode(code);
    }
  }
  return str;
};

export const saveUserToCloudDb = async (account: any): Promise<boolean> => {
  try {
    const cleanUname = (account.username || '').trim().toLowerCase();
    if (!cleanUname) return false;

    const jsonStr = JSON.stringify(account);
    const hex = stringToHex(encodeURIComponent(jsonStr));

    const res = await fetch(`${BASE_URL}/UpdateValue/${APP_TOKEN}/user_${cleanUname}/${hex}`, {
      method: 'POST'
    });
    return res.ok;
  } catch (e) {
    console.warn(`saveUserToCloudDb failed for ${account.username}`, e);
    return false;
  }
};

export const getUserFromCloudDb = async (username: string): Promise<any | null> => {
  try {
    const cleanUname = (username || '').trim().toLowerCase();
    if (!cleanUname) return null;

    const res = await fetch(`${BASE_URL}/GetValue/${APP_TOKEN}/user_${cleanUname}`);
    if (res.ok) {
      let rawHex = await res.json();
      if (typeof rawHex === 'string' && rawHex.trim().length > 0) {
        const jsonStr = decodeURIComponent(hexToString(rawHex.trim()));
        return JSON.parse(jsonStr);
      }
    }
  } catch (e) {
    console.warn(`getUserFromCloudDb failed for ${username}`, e);
  }
  return null;
};

export const getAllUsersFromCloudDb = async (): Promise<any[]> => {
  return [];
};
