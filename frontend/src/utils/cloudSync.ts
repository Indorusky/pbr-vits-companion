const MASTER_DB_ID = 'ff8081819ff5b11001a04778e21a436c';
const MASTER_DB_URL = `https://api.restful-api.dev/objects/${MASTER_DB_ID}`;

export const fetchMasterCloudDb = async (): Promise<any> => {
  try {
    const res = await fetch(MASTER_DB_URL);
    if (res.ok) {
      const data = await res.json();
      if (data && data.data && data.data.users) {
        return data.data;
      }
    }
  } catch (e) {
    console.warn("fetchMasterCloudDb error", e);
  }
  return { users: {} };
};

export const saveUserToCloudDb = async (account: any): Promise<boolean> => {
  try {
    const cleanUname = (account.username || '').trim().toLowerCase();
    if (!cleanUname) return false;

    // 1. Fetch current master DB
    const master = await fetchMasterCloudDb();
    const users = master.users || {};

    // 2. Add or update user record
    users[cleanUname] = {
      ...account,
      username: cleanUname
    };

    // 3. Update master cloud object via PUT
    const res = await fetch(MASTER_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'pbr_vits_master_db_v10',
        data: { users }
      })
    });
    return res.ok;
  } catch (e) {
    console.warn("saveUserToCloudDb error", e);
    return false;
  }
};

export const getUserFromCloudDb = async (username: string): Promise<any | null> => {
  try {
    const cleanUname = (username || '').trim().toLowerCase();
    if (!cleanUname) return null;

    const master = await fetchMasterCloudDb();
    if (master && master.users && master.users[cleanUname]) {
      return master.users[cleanUname];
    }
  } catch (e) {
    console.warn("getUserFromCloudDb error", e);
  }
  return null;
};

export const getAllUsersFromCloudDb = async (): Promise<any[]> => {
  try {
    const master = await fetchMasterCloudDb();
    if (master && master.users) {
      return Object.values(master.users);
    }
  } catch (e) {
    console.warn("getAllUsersFromCloudDb error", e);
  }
  return [];
};
