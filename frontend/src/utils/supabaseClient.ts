import { createClient } from '@supabase/supabase-js';

// Default Supabase project endpoints for PBR VITS Student Companion
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.testkey';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SupabaseUser {
  id?: number | string;
  username: string;
  password?: string;
  role: 'student' | 'faculty' | 'admin';
  name: string;
  email: string;
  department?: string;
  year?: string;
  semester?: string;
  roll_number?: string;
  section?: string;
  profile_photo?: string;
}

export const supabaseRegisterUser = async (userAcc: SupabaseUser): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .upsert([
        {
          username: userAcc.username.trim().toLowerCase(),
          password: userAcc.password,
          role: userAcc.role,
          name: userAcc.name,
          email: userAcc.email,
          department: userAcc.department || 'Computer Science and Engineering (CSE)',
          year: userAcc.year || '1st Year',
          semester: userAcc.semester || '1-1',
          roll_number: userAcc.roll_number || '2273A01001',
          section: userAcc.section || 'Section A',
          profile_photo: userAcc.profile_photo || ''
        }
      ], { onConflict: 'username' })
      .select();

    if (error) {
      console.warn("Supabase register warning", error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data: data ? data[0] : userAcc };
  } catch (e: any) {
    console.warn("Supabase register error", e);
    return { success: false, error: e.message || 'Supabase connection failed' };
  }
};

export const supabaseValidateUser = async (username: string, pass: string): Promise<{ success: boolean; user?: SupabaseUser; error?: string }> => {
  try {
    const cleanUname = username.trim().toLowerCase();
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('username', cleanUname)
      .single();

    if (error || !data) {
      return { success: false, error: 'User not found' };
    }

    if (data.password === pass || !data.password) {
      return { success: true, user: data as SupabaseUser };
    }
    return { success: false, error: 'Invalid password' };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

export const supabaseFetchAllUsers = async (): Promise<SupabaseUser[]> => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*');

    if (error || !data) return [];
    return data as SupabaseUser[];
  } catch {
    return [];
  }
};

export const supabaseRecordAttendance = async (record: {
  student_name: string;
  roll_number: string;
  subject: string;
  date: string;
  time: string;
  period: string;
  status: string;
  verification_type: string;
}): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('attendance_records')
      .insert([record]);

    return !error;
  } catch {
    return false;
  }
};

export const supabaseFetchAttendance = async (rollNumber: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('roll_number', rollNumber);

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
};
