const CRUDCRUD_URL = 'https://crudcrud.com/api/2aaa93ddc8754ea3bfaac21a82f3a7a7/users';
const KEYVALUE_APP = 'c07g6t40';

export const saveUserToCloudDb = async (account: any): Promise<boolean> => {
  const cleanUname = (account.username || '').trim().toLowerCase();
  if (!cleanUname) return false;

  let success = false;

  // 1. Save to CrudCrud primary cloud DB
  try {
    const res = await fetch(CRUDCRUD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `pbr_vits_user_${cleanUname}`,
        data: {
          ...account,
          username: cleanUname
        }
      })
    });
    if (res.ok) success = true;
  } catch (e) {
    console.warn("CrudCrud push failed", e);
  }

  // 2. Save to KeyValue backup cloud DB
  try {
    const jsonStr = JSON.stringify(account);
    const safeB64 = btoa(unescape(encodeURIComponent(jsonStr))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    await fetch(`https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${KEYVALUE_APP}/user_${cleanUname}/${safeB64}`, {
      method: 'POST'
    });
    success = true;
  } catch (e) {
    console.warn("KeyValue push failed", e);
  }

  return success;
};

export const getUserFromCloudDb = async (username: string): Promise<any | null> => {
  const cleanUname = (username || '').trim().toLowerCase();
  if (!cleanUname) return null;

  // 1. Fetch from CrudCrud primary cloud DB
  try {
    const res = await fetch(CRUDCRUD_URL);
    if (res.ok) {
      const records = await res.json();
      if (Array.isArray(records)) {
        const found = records.find((r: any) => 
          (r.name === `pbr_vits_user_${cleanUname}`) || 
          (r.data && (r.data.username || '').toLowerCase() === cleanUname)
        );
        if (found) {
          return found.data || found;
        }
      }
    }
  } catch (e) {
    console.warn("CrudCrud pull failed", e);
  }

  // 2. Fetch from KeyValue backup cloud DB
  try {
    const res = await fetch(`https://keyvalue.immanuel.co/api/KeyVal/GetValue/${KEYVALUE_APP}/user_${cleanUname}`);
    if (res.ok) {
      let rawB64 = await res.json();
      if (typeof rawB64 === 'string' && rawB64.trim().length > 0) {
        rawB64 = rawB64.trim().replace(/-/g, '+').replace(/_/g, '/');
        while (rawB64.length % 4 !== 0) rawB64 += '=';
        const jsonStr = decodeURIComponent(escape(atob(rawB64)));
        return JSON.parse(jsonStr);
      }
    }
  } catch (e) {
    console.warn("KeyValue pull failed", e);
  }

  return null;
};

export const getAllUsersFromCloudDb = async (): Promise<any[]> => {
  try {
    const res = await fetch(CRUDCRUD_URL);
    if (res.ok) {
      const records = await res.json();
      if (Array.isArray(records)) {
        return records.map((r: any) => r.data || r).filter((a: any) => a && a.username);
      }
    }
  } catch (e) {
    console.warn("getAllUsersFromCloudDb failed", e);
  }
  return [];
};
