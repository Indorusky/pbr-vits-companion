import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { API_BASE_URL } from '../config';
import { saveUserToCloudDb, getUserFromCloudDb, getAllUsersFromCloudDb } from '../utils/cloudSync';
import { supabaseRegisterUser, supabaseValidateUser, supabaseFetchAllUsers } from '../utils/supabaseClient';

export const pushAccountsToCloudSync = async (accountsList: any[]) => {
  try {
    for (const acc of accountsList) {
      const u = (acc.username || '').toLowerCase();
      if (u && u !== 'admin' && u !== 'student' && u !== 'ravi') {
        await saveUserToCloudDb(acc);
      }
    }
  } catch (e) {
    console.warn("Cloud sync write failed", e);
  }
};

export const pullAccountsFromCloudSync = async (): Promise<any[]> => {
  try {
    return await getAllUsersFromCloudDb();
  } catch (e) {
    console.warn("Cloud sync read failed", e);
  }
  return [];
};


export type Role = 'student' | 'faculty' | 'admin' | null;

export interface User {
  id?: number;
  username: string;
  role: Role;
  name?: string;
  department?: string;
  year?: string;
  semester?: string;
  subjects?: string[];
  email?: string;
  roll_number?: string;
  section?: string;
  profile_photo?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  registerUser: (username: string, password: string, role: Role, name: string, email: string, department?: string, year?: string, semester?: string, rollNumber?: string, profilePhoto?: string) => Promise<{ success: boolean; message: string; user?: User }>;
  resetUserPassword: (username: string, email: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  validateUser: (username: string, pass: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  viewMode: 'student' | 'faculty' | 'admin';
  setViewMode: (mode: 'student' | 'faculty' | 'admin') => void;
}

export const generateRollNumberLocal = (accounts: any[], department: string, year: string): string => {
  const currentYear = new Date().getFullYear();
  let yearSuffix = String(currentYear).substring(2);
  
  if (year) {
    const yLower = year.toLowerCase();
    if (yLower.includes("1st") || yLower.includes("first")) yearSuffix = "25";
    else if (yLower.includes("2nd") || yLower.includes("second")) yearSuffix = "24";
    else if (yLower.includes("3rd") || yLower.includes("third")) yearSuffix = "23";
    else if (yLower.includes("4th") || yLower.includes("fourth")) yearSuffix = "22";
  }

  const collegeCode = "73";
  
  let courseCode = "A0";
  let branchCode = "1";
  
  const depNorm = (department || "").toLowerCase();
  if (depNorm.includes("aiml")) {
    courseCode = "A0";
    branchCode = "3";
  } else if (depNorm.includes("ai")) {
    courseCode = "A0";
    branchCode = "2";
  } else if (depNorm.includes("computer science") || depNorm.includes("cse")) {
    courseCode = "A0";
    branchCode = "1";
  } else if (depNorm.includes("electrical") || depNorm.includes("eee")) {
    courseCode = "C0";
    branchCode = "5";
  } else if (depNorm.includes("electronics") || depNorm.includes("ece")) {
    courseCode = "B0";
    branchCode = "4";
  } else if (depNorm.includes("civil")) {
    courseCode = "D0";
    branchCode = "6";
  } else if (depNorm.includes("mechanical")) {
    courseCode = "E0";
    branchCode = "7";
  }

  const prefix = `${yearSuffix}${collegeCode}${courseCode}${branchCode}`;
  
  const matching = accounts
    .map(a => a.roll_number || '')
    .filter(r => r.startsWith(prefix));
    
  let maxSerial = 0;
  matching.forEach(r => {
    const serialPart = r.substring(prefix.length);
    if (/^\d+$/.test(serialPart)) {
      const val = parseInt(serialPart, 10);
      if (val > maxSerial) maxSerial = val;
    }
  });
  
  const nextSerial = maxSerial + 1;
  const serialStr = String(nextSerial).padStart(3, '0');
  return `${prefix}${serialStr}`;
};

export const RAW_FACULTY_POOL = [
  "Dr. DODLA SRUJAN CHANDRA REDDY",
  "Dr. GANUGULA VIJAY KUMAR",
  "Dr. KUNI VENKATA SUBBAIAH",
  "Dr. NUKAMREDDY SRINAD REDDY",
  "Dr. BONTHALA VAMSEE MOHAN",
  "Dr. POLEBOINA VENKATA N RAJESWARI",
  "Dr. RAMIREDDY KONDAIAH",
  "Dr. PATHAKAMURI SRINIVASULU",
  "Mr. SHAIK SHABBIR BASHA",
  "Mr. PUTTU ESWARAIAH",
  "Ms. THORAINELLORE MANJULA",
  "Mr. MENTA VIJAYABHASKAR",
  "Mrs. SIVADANAM USHA RANI",
  "Ms. AKSHAYAM PRASMITA",
  "Ms. KODALI BHARGAVI",
  "Mr. PERAM KAMALAKAR",
  "Mr. CHEEDELLA CHANDRA SEKHAR",
  "Mis. MALISETTY TEJASWINI",
  "Mrs. GUMMADI TIRUMALA",
  "Mrs. KANAMATHAREDDY RESHMA REDDY",
  "Ms. JARUGUMALLI MADHURI",
  "Mr. GUNUPATI VENKATESWARLU",
  "Ms. K V SUPRAJA",
  "Ms. NUNNA SAI SINDHURA",
  "Ms. KOPILA RAVI CHAND",
  "Mr. PEDDIREDDY VENKATESWARA REDDY",
  "Mr. PANDITAAJAYA KUMAR",
  "Ms. ALANKARAM SHOBITHA LAKSHMI",
  "Mr. ANGALAKUDURU SRINIVASA RAO",
  "Mr. THAMMINENI DAYAKAR",
  "Mr. RAJA BHARGAVA",
  "Mr. GUDAMSETTY RAJESH",
  "Mr. CH VENKATESWARLU",
  "Mr. RONDLA PRAPULLA KUMAR",
  "Mr. MODEM JEEVAN KUMAR",
  "Mr. PASUPULETI MOHAN",
  "Ms. GUNA GAYATHRI PRASEETHA K",
  "Ms. DARBALA PAVAN KUMAR",
  "Mr. PERAM MALLIKARJUNA",
  "Mr. KUNI SAI SUMANTH",
  "Ms. PONNURU VENKATA SUSHMA",
  "Mr. CHALLA AKHIL",
  "Ms. CHEVURI ROJA",
  "Mr. MUNAGALA VENKATESWARLU",
  "Mr. MANCHERLAPATI NEERJA",
  "Mr. METTA SATHYA SAI LAKSHMAN",
  "Mr. ADUSUMALLI PRASANNA KUMAR",
  "Mr. KATAMREDDI MAHENDRA",
  "Ms. KOMMURI SRAVANI",
  "Mrs. KUPPAM SAMEERA",
  "Ms. PASUPILETI VIMALASANYHI",
  "Mr. SINGAMANENI MALLIKARJUNA",
  "Mrs. NIDAMANURI V SOUNDARYA"
];

const generatedFacultyAccounts = RAW_FACULTY_POOL.map((fullName, idx) => {
  const cleanName = fullName.replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.|Mis\.)\s+/i, '').trim();
  const parts = cleanName.toLowerCase().split(/\s+/).filter(Boolean);
  let uname = parts.length > 1 ? `${parts[0]}.${parts[parts.length - 1]}` : parts[0];
  uname = uname.replace(/[^a-z0-9.]/g, '');
  if (!uname || uname.length < 3) uname = `fac.${idx + 1}`;

  const depts = [
    'Computer Science and Engineering (CSE)',
    'Artificial Intelligence & Machine Learning (AI&ML)',
    'Electronics and Communication Engineering (ECE)',
    'Electrical and Electronics Engineering (EEE)',
    'Civil Engineering'
  ];

  return {
    id: 100 + idx,
    username: uname,
    password: 'faculty123',
    role: 'faculty' as Role,
    name: fullName,
    department: depts[idx % depts.length],
    email: `${uname}@pbrvits.ac.in`,
    subjects: ['Generative AI', 'Data Structures', 'DBMS', 'Software Engineering'],
    approval_status: 'Approved'
  };
});

export const DEFAULT_ACCOUNTS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin',
    role: 'admin' as Role,
    name: 'System Admin',
    department: 'Administration',
    email: 'admin@campus.edu',
    approval_status: 'Approved'
  },
  {
    id: 2,
    username: 'student',
    password: 'student',
    role: 'student' as Role,
    name: 'Ravi Prakash Bayireddy',
    department: 'Computer Science and Engineering (CSE)',
    year: '4th Year',
    semester: '4-1',
    roll_number: '2273A01001',
    email: 'optimindian@gmail.com',
    section: 'Section A',
    approval_status: 'Approved'
  },
  {
    id: 3,
    username: 'ravi',
    password: 'ravi123',
    role: 'student' as Role,
    name: 'Ravi Prakash Bayireddy',
    department: 'Computer Science and Engineering (CSE)',
    year: '4th Year',
    semester: '4-1',
    roll_number: '2273A01001',
    email: 'optimindian@gmail.com',
    section: 'Section A',
    approval_status: 'Approved'
  },
  {
    id: 5,
    username: 'faculty',
    password: 'faculty',
    role: 'faculty' as Role,
    name: 'Dr. Clara Croft',
    department: 'Computer Science and Engineering (CSE)',
    email: 'clara.croft@campus.edu',
    subjects: ['Generative AI', 'Data Structures'],
    approval_status: 'Approved'
  },
  {
    id: 6,
    username: 'clara',
    password: 'clara123',
    role: 'faculty' as Role,
    name: 'Dr. Clara Croft',
    department: 'Computer Science and Engineering (CSE)',
    email: 'clara.croft@campus.edu',
    subjects: ['Generative AI', 'Data Structures'],
    approval_status: 'Approved'
  },
  ...generatedFacultyAccounts
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('campus_ai_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null; // Start unauthenticated
  });

  // Manage accounts (fallback)
  const [accounts, setAccounts] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('campus_ai_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge missing default accounts into saved
          const existingUsernames = new Set(parsed.map((a: any) => (a.username || '').toLowerCase()));
          const merged = [...parsed];
          DEFAULT_ACCOUNTS.forEach(defAcc => {
            if (!existingUsernames.has(defAcc.username.toLowerCase())) {
              merged.push(defAcc);
            }
          });
          return merged;
        }
      }
    } catch {
      // fallback
    }
    localStorage.setItem('campus_ai_accounts', JSON.stringify(DEFAULT_ACCOUNTS));
    return DEFAULT_ACCOUNTS;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('campus_ai_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('campus_ai_user');
      }
    } catch {
      // ignore
    }
  }, [user]);

  // Pull cloud accounts from Master Cloud DB on load to sync custom registered accounts across all devices
  useEffect(() => {
    // 1. Save any local custom accounts to Master Cloud DB if created on this device
    try {
      const saved = localStorage.getItem('campus_ai_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const customOnly = parsed.filter((a: any) => {
            const u = (a.username || '').toLowerCase();
            return u && u !== 'admin' && u !== 'student' && u !== 'ravi';
          });
          customOnly.forEach((acc: any) => {
            saveUserToCloudDb(acc);
          });
        }
      }
    } catch { /* ignore */ }

    // 2. Pull all accounts from Supabase and Master Cloud DB to sync with other devices
    supabaseFetchAllUsers().then(supaUsers => {
      if (Array.isArray(supaUsers) && supaUsers.length > 0) {
        setAccounts(prev => {
          const existing = new Set(prev.map(a => (a.username || '').toLowerCase()));
          const merged = [...prev];
          supaUsers.forEach(u => {
            if (u.username && !existing.has(u.username.toLowerCase())) {
              merged.push(u);
              existing.add(u.username.toLowerCase());
            }
          });
          try { localStorage.setItem('campus_ai_accounts', JSON.stringify(merged)); } catch {}
          return merged;
        });
      }
    });

    getAllUsersFromCloudDb().then(cloudUsers => {
      if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
        const deletedRaw = localStorage.getItem('campus_ai_deleted_accounts');
        const deletedSet = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);

        const validCloudUsers = cloudUsers.filter(a => {
          const u = (a.username || '').toLowerCase();
          const r = (a.roll_number || '').toLowerCase();
          const n = (a.name || '').toLowerCase();
          return !deletedSet.has(u) && !deletedSet.has(r) && !deletedSet.has(n);
        });

        setAccounts(prev => {
          const existingUsernames = new Set(prev.map(a => (a.username || '').toLowerCase()));
          const merged = [...prev];
          validCloudUsers.forEach(ca => {
            if (ca.username && !existingUsernames.has(ca.username.toLowerCase())) {
              merged.push(ca);
              existingUsernames.add(ca.username.toLowerCase());
            }
          });
          try {
            localStorage.setItem('campus_ai_accounts', JSON.stringify(merged));
          } catch { /* ignore */ }
          return merged;
        });
      }
    });
  }, []);

  const [viewMode, setViewModeInternal] = useState<'student' | 'faculty' | 'admin'>('student');

  useEffect(() => {
    if (user?.role) {
      setViewModeInternal(user.role as 'student' | 'faculty' | 'admin');
    }
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const setViewMode = (mode: 'student' | 'faculty' | 'admin') => {
    setViewModeInternal(mode);
  };

  const registerUser = async (username: string, pass: string, role: Role, name: string, email: string, dept?: string, yr?: string, semester?: string, rollNumber?: string, profilePhoto?: string) => {
    // Generate a default roll number for consistency
    const generatedRoll = rollNumber || (role === 'student' 
      ? generateRollNumberLocal(accounts, dept || '', yr || '')
      : `FAC-${Math.floor(1000 + Math.random() * 9000)}`);

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password: pass,
          role,
          name,
          email,
          department: dept,
          year: yr,
          semester: semester,
          roll_number: generatedRoll,
          profile_photo: profilePhoto
        }),
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, message: 'Registration successful!', user: data };
      } else {
        const err = await response.json();
        return { success: false, message: err.detail || 'Registration failed.' };
      }
    } catch (e) {
      console.warn("Backend registration failed, falling back to local storage", e);
    }

    const exists = accounts.some(acc => acc.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return { success: false, message: 'Username is already registered.' };
    }
    if (pass.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }
    const newAcc = {
      id: Math.floor(1000 + Math.random() * 9000),
      username,
      password: pass,
      role,
      name,
      email,
      department: dept || 'CS Dept',
      year: yr || '1st Year',
      semester: semester || '1-1',
      roll_number: generatedRoll,
      section: 'Section A',
      profile_photo: profilePhoto
    };
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    localStorage.setItem('campus_ai_accounts', JSON.stringify(updated));

    // Save user record to Supabase & Cloud DB
    await supabaseRegisterUser(newAcc as any);
    await saveUserToCloudDb(newAcc);

    return { success: true, message: 'Registration successful!', user: newAcc };
  };

  const resetUserPassword = async (username: string, email: string, newPass: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: newPass
        }),
      });
      if (response.ok) {
        return { success: true, message: 'Password reset successful!' };
      }
    } catch (e) {
      console.warn("Backend password reset failed, falling back to local storage", e);
    }

    const idx = accounts.findIndex(acc => acc.username.toLowerCase() === username.toLowerCase() && acc.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) {
      return { success: false, message: 'Username or Email matches no record.' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }
    const updated = [...accounts];
    updated[idx].password = newPass;
    setAccounts(updated);
    localStorage.setItem('campus_ai_accounts', JSON.stringify(updated));
    return { success: true, message: 'Password reset successful!' };
  };

  const validateUser = async (username: string, pass: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password: pass
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          return {
            success: true,
            user: {
              id: data.user.id,
              username: data.user.username,
              role: data.user.role,
              name: data.user.name,
              department: data.user.department,
              year: data.user.year,
              semester: data.user.semester,
              email: data.user.email,
              roll_number: data.user.roll_number,
              section: data.user.section,
              profile_photo: data.user.profile_photo,
              subjects: data.user.subjects ? data.user.subjects.split(',').map((s: string) => s.trim()) : []
            }
          };
        }
      }
    } catch (e) {
      console.warn("Backend authentication failed, falling back to local storage", e);
    }

    const acc = accounts.find(a => (a.username || '').toLowerCase() === username.toLowerCase() && a.password === pass);
    if (acc) {
      saveUserToCloudDb(acc);
      return {
        success: true,
        user: {
          id: acc.id || 1,
          username: acc.username,
          role: acc.role,
          name: acc.name,
          department: acc.department,
          year: acc.year,
          semester: acc.semester,
          subjects: acc.subjects,
          email: acc.email,
          profile_photo: acc.profile_photo,
          roll_number: acc.roll_number || '2273A01001',
          section: acc.section || 'Section A'
        }
      };
    }

    const defAcc = DEFAULT_ACCOUNTS.find(a => (a.username || '').toLowerCase() === username.toLowerCase() && a.password === pass);
    if (defAcc) {
      return {
        success: true,
        user: {
          id: defAcc.id || 1,
          username: defAcc.username,
          role: defAcc.role,
          name: defAcc.name,
          department: defAcc.department,
          year: (defAcc as any).year,
          semester: (defAcc as any).semester,
          subjects: (defAcc as any).subjects,
          email: defAcc.email,
          profile_photo: (defAcc as any).profile_photo,
          roll_number: (defAcc as any).roll_number || '2273A01001',
          section: (defAcc as any).section || 'Section A'
        }
      };
    }

    // Supabase Cloud Validation
    try {
      const supaRes = await supabaseValidateUser(username, pass);
      if (supaRes.success && supaRes.user) {
        const u = supaRes.user;
        setAccounts(prev => {
          if (!prev.some(a => (a.username || '').toLowerCase() === u.username.toLowerCase())) {
            const next = [...prev, u];
            try { localStorage.setItem('campus_ai_accounts', JSON.stringify(next)); } catch {}
            return next;
          }
          return prev;
        });
        return {
          success: true,
          user: {
            id: typeof u.id === 'number' ? u.id : Math.floor(1000 + Math.random() * 9000),
            username: u.username,
            role: u.role || 'student',
            name: u.name,
            department: u.department || 'Computer Science and Engineering (CSE)',
            year: u.year || '1st Year',
            semester: u.semester || '1-1',
            email: u.email,
            roll_number: u.roll_number || '2273A01001',
            section: u.section || 'Section A',
            profile_photo: u.profile_photo
          }
        };
      }
    } catch { /* ignore */ }

    // Master Cloud DB Lookup for instant cross-device authentication
    const cleanUname = username.trim().toLowerCase();
    try {
      const cloudUser = await getUserFromCloudDb(cleanUname);
      if (cloudUser) {
        const isPassMatch = !cloudUser.password || cloudUser.password === pass;
        if (isPassMatch) {
          const fullAcc = { ...cloudUser, password: pass };
          saveUserToCloudDb(fullAcc);
          setAccounts(prev => {
            if (!prev.some(a => (a.username || '').toLowerCase() === cleanUname)) {
              const next = [...prev, fullAcc];
              try { localStorage.setItem('campus_ai_accounts', JSON.stringify(next)); } catch {}
              return next;
            }
            return prev;
          });

          return {
            success: true,
            user: {
              id: fullAcc.id || Math.floor(1000 + Math.random() * 9000),
              username: fullAcc.username,
              role: fullAcc.role || 'student',
              name: fullAcc.name,
              department: fullAcc.department || 'Computer Science and Engineering (CSE)',
              year: fullAcc.year || '1st Year',
              semester: fullAcc.semester || '1-1',
              email: fullAcc.email,
              roll_number: fullAcc.roll_number || '2273A01001',
              section: fullAcc.section || 'Section A',
              profile_photo: fullAcc.profile_photo
            }
          };
        }
      }
    } catch { /* ignore */ }

    return { success: false, message: 'Invalid username or password.' };
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, registerUser, resetUserPassword, validateUser, viewMode, setViewMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



