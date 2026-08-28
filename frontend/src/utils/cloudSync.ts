const NPOINT_BIN_ID = '0aef6f14dd0ddf8a7e08';
const NPOINT_URL = `https://api.npoint.io/${NPOINT_BIN_ID}`;

export const saveUserToCloudDb = async (account: any): Promise<boolean> => {
  try {
    const cleanUname = (account.username || '').trim().toLowerCase();
    if (!cleanUname) return false;

    let currentUsers: Record<string, any> = {};
    try {
      const getRes = await fetch(NPOINT_URL);
      if (getRes.ok) {
        const text = await getRes.text();
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed && parsed.users) {
            currentUsers = parsed.users;
          }
        }
      }
    } catch { /* ignore */ }

    currentUsers[cleanUname] = {
      ...account,
      username: cleanUname
    };

    const postRes = await fetch(NPOINT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: currentUsers })
    });
    return postRes.ok;
  } catch (e) {
    console.warn("saveUserToCloudDb error", e);
    return false;
  }
};

export const getUserFromCloudDb = async (username: string): Promise<any | null> => {
  try {
    const cleanUname = (username || '').trim().toLowerCase();
    if (!cleanUname) return null;

    const getRes = await fetch(NPOINT_URL);
    if (getRes.ok) {
      const text = await getRes.text();
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed && parsed.users && parsed.users[cleanUname]) {
          return parsed.users[cleanUname];
        }
      }
    }
  } catch (e) {
    console.warn("getUserFromCloudDb error", e);
  }
  return null;
};

export const getAllUsersFromCloudDb = async (): Promise<any[]> => {
  try {
    const getRes = await fetch(NPOINT_URL);
    if (getRes.ok) {
      const text = await getRes.text();
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed && parsed.users) {
          return Object.values(parsed.users);
        }
      }
    }
  } catch (e) {
    console.warn("getAllUsersFromCloudDb error", e);
  }
  return [];
};
