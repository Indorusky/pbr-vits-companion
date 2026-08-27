import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { API_BASE_URL } from '../config';


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
  validateUser: (username: string, pass: string) => Promise<{ success: boolean; user?: User }>;
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

const DEFAULT_ACCOUNTS = [
  {
    username: 'admin',
    password: 'admin',
    role: 'admin' as Role,
    name: 'Admin',
    department: 'Administration',
    email: 'admin@gmail.com'
  }
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
      if (saved) return JSON.parse(saved);
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

    const acc = accounts.find(a => a.username.toLowerCase() === username.toLowerCase() && a.password === pass);
    if (!acc) return { success: false };
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
        roll_number: acc.roll_number || '2373A01001',
        section: acc.section || 'Section A'
      }
    };
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



