import { API_BASE_URL } from '../config';

const LOCAL_STORAGE_KEY = 'campus_ai_accounts';

export const saveUserToCloudDb = async (account: any): Promise<boolean> => {
  try {
    const cleanUname = (account.username || '').trim().toLowerCase();
    if (!cleanUname) return false;

    // 1. Update local accounts cache
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      const accounts: any[] = saved ? JSON.parse(saved) : [];
      const idx = accounts.findIndex(a => (a.username || '').toLowerCase() === cleanUname);
      if (idx >= 0) {
        accounts[idx] = { ...accounts[idx], ...account, username: cleanUname };
      } else {
        accounts.push({ ...account, username: cleanUname });
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(accounts));
    } catch { /* ignore local error */ }

    // 2. Sync to Backend Database API
    try {
      const res = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUname,
          password: account.password || 'defaultPassword123',
          role: account.role || 'student',
          name: account.name || cleanUname,
          email: account.email || `${cleanUname}@example.com`,
          department: account.department || 'Computer Science and Engineering (CSE)',
          year: account.year || '1st Year',
          semester: account.semester || '1-1',
          roll_number: account.roll_number,
          profile_photo: account.profile_photo || ''
        })
      });
      if (res.ok) return true;
    } catch { /* backend offline, cached locally */ }

    return true;
  } catch (e) {
    console.warn("saveUserToCloudDb error", e);
    return false;
  }
};

export const getUserFromCloudDb = async (username: string): Promise<any | null> => {
  try {
    const cleanUname = (username || '').trim().toLowerCase();
    if (!cleanUname) return null;

    // 1. Check local storage
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const accounts: any[] = JSON.parse(saved);
        const match = accounts.find(a => (a.username || '').toLowerCase() === cleanUname);
        if (match) return match;
      }
    } catch { /* ignore */ }

    // 2. Check Backend Database API
    try {
      const res = await fetch(`${API_BASE_URL}/users?search=${encodeURIComponent(cleanUname)}`);
      if (res.ok) {
        const users = await res.json();
        if (Array.isArray(users)) {
          const match = users.find((u: any) => (u.username || '').toLowerCase() === cleanUname);
          if (match) return match;
        }
      }
    } catch { /* backend offline */ }

  } catch (e) {
    console.warn("getUserFromCloudDb error", e);
  }
  return null;
};

export const getAllUsersFromCloudDb = async (): Promise<any[]> => {
  try {
    // 1. Try Backend API
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (res.ok) {
        const users = await res.json();
        if (Array.isArray(users) && users.length > 0) {
          return users;
        }
      }
    } catch { /* backend offline */ }

    // 2. Fallback to local accounts
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("getAllUsersFromCloudDb error", e);
  }
  return [];
};
