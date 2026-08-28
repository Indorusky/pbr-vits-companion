import { SUBJECTS_DATABASE, getNormalizedDepartment } from './subjectsData';

export interface SubjectGradeRecord {
  subject: string;
  code: string;
  credits: number;
  internal: number;   // Max 30 (Midterms)
  quiz: number;       // Max 10 (Quizzes)
  assignment: number; // Max 20 (Assignments & Labs)
  finalExam: number;  // Max 40 (Final University Exam - 0 if ongoing)
  total: number;      // Max 100
  grade: string;      // 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'F' | 'Pending'
  gradePoints: number; // 10, 9, 8, 7, 6, 5, 0
  isFinalExamCompleted: boolean;
}

export interface SemesterAcademicRecord {
  semester: string;
  year: string;
  isCurrentOngoing: boolean;
  sgpa: number;
  credits: number;
  percentage: number;
  status: 'Distinction' | 'First Class' | 'Second Class' | 'Pass' | 'Fail' | 'In Progress';
  subjects: SubjectGradeRecord[];
}

export interface StudentAcademicProfile {
  id: string | number;
  username: string;
  name: string;
  rollNumber: string;
  department: string;
  currentSemester: string;
  currentYear: string;
  cgpa: number;
  overallPercentage: number;
  completedSemestersCount: number;
  totalCreditsCompleted: number;
  academicStanding: string;
  semesters: SemesterAcademicRecord[];
}

const STORAGE_KEY = 'campus_ai_academic_profiles';

const SEMESTERS_ORDER = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];

const getYearFromSem = (sem: string): string => {
  if (sem.startsWith('1')) return '1st Year';
  if (sem.startsWith('2')) return '2nd Year';
  if (sem.startsWith('3')) return '3rd Year';
  if (sem.startsWith('4')) return '4th Year';
  return '4th Year';
};

const getGradeInfo = (score: number): { grade: string; gradePoints: number } => {
  if (score >= 90) return { grade: 'O', gradePoints: 10 };
  if (score >= 82) return { grade: 'A+', gradePoints: 9 };
  if (score >= 74) return { grade: 'A', gradePoints: 8 };
  if (score >= 65) return { grade: 'B+', gradePoints: 7 };
  if (score >= 55) return { grade: 'B', gradePoints: 6 };
  if (score >= 45) return { grade: 'C', gradePoints: 5 };
  return { grade: 'F', gradePoints: 0 };
};

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const generateDefaultAcademicProfile = (
  student: {
    id?: string | number;
    username?: string;
    name?: string;
    roll_number?: string;
    rollNumber?: string;
    department?: string;
    semester?: string;
    year?: string;
  }
): StudentAcademicProfile => {
  const username = student.username || 'student';
  const name = student.name || student.username || 'Student User';
  const roll = student.roll_number || student.rollNumber || '2273A01001';
  const dept = getNormalizedDepartment(student.department || 'Computer Science and Engineering (CSE)');
  const currentSem = student.semester || '4-1';
  const currentYr = student.year || getYearFromSem(currentSem);

  const studentSeed = hashString(roll + username);
  // ~1 in 20 students (5%) has an academic backlog / lower GPA in past semesters
  const isAtRiskStudent = studentSeed % 20 === 0;

  const currentSemIndex = SEMESTERS_ORDER.indexOf(currentSem);
  const eligibleSems = currentSemIndex >= 0 
    ? SEMESTERS_ORDER.slice(0, currentSemIndex + 1) 
    : ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1'];

  const semesterRecords: SemesterAcademicRecord[] = eligibleSems.map((sem, semIdx) => {
    const isCurrent = sem === currentSem;
    const subjectsList = SUBJECTS_DATABASE[dept]?.[sem] || [
      'Core Engineering Subject 1',
      'Core Engineering Subject 2',
      'Applied Laboratory Course',
      'Engineering Mathematics & Analytics'
    ];

    const semSeed = studentSeed + semIdx * 37;
    const subjectGrades: SubjectGradeRecord[] = subjectsList.map((subjName, sIdx) => {
      const subjSeed = semSeed + sIdx * 19;
      let targetTotal: number;
      if (isAtRiskStudent && sIdx === 0 && semIdx === eligibleSems.length - 2) {
        targetTotal = 42; // Backlog in previous completed year
      } else if (isAtRiskStudent) {
        targetTotal = 58 + (subjSeed % 20); // 58 - 78
      } else {
        targetTotal = 76 + (subjSeed % 23); // 76 - 99
      }

      const midterm = Math.min(30, Math.round((targetTotal * 0.3) + ((subjSeed % 5) - 2)));
      const quiz = Math.min(10, Math.round((targetTotal * 0.1) + ((subjSeed % 3) - 1)));
      const assignment = Math.min(20, Math.round((targetTotal * 0.2) + ((subjSeed % 3) - 1)));
      const calculatedFinal = Math.max(0, Math.min(40, targetTotal - (midterm + quiz + assignment)));

      const isLab = subjName.toLowerCase().includes('lab') || subjName.toLowerCase().includes('manual') || subjName.toLowerCase().includes('project');

      if (isCurrent) {
        // Current semester: Continuous Internal Assessment Active, Final Exam is not yet conducted
        return {
          subject: subjName,
          code: `${dept.substring(0, 2).toUpperCase()}${sem.replace('-', '')}0${sIdx + 1}${isLab ? 'L' : ''}`,
          credits: isLab ? 1.5 : 3.0,
          internal: midterm,
          quiz,
          assignment,
          finalExam: 0,
          total: midterm + quiz + assignment,
          grade: 'Pending Exam',
          gradePoints: 0,
          isFinalExamCompleted: false
        };
      }

      // Completed semester: Official university results published
      const { grade, gradePoints } = getGradeInfo(targetTotal);
      return {
        subject: subjName,
        code: `${dept.substring(0, 2).toUpperCase()}${sem.replace('-', '')}0${sIdx + 1}${isLab ? 'L' : ''}`,
        credits: isLab ? 1.5 : 3.0,
        internal: midterm,
        quiz,
        assignment,
        finalExam: calculatedFinal,
        total: targetTotal,
        grade,
        gradePoints,
        isFinalExamCompleted: true
      };
    });

    const totalCredits = subjectGrades.reduce((sum, s) => sum + s.credits, 0);

    if (isCurrent) {
      // Estimated ongoing SGPA based on continuous internal evaluation
      const internalEarned = subjectGrades.reduce((sum, s) => sum + s.total, 0);
      const maxInternal = subjectGrades.length * 60;
      const internalRatio = maxInternal > 0 ? internalEarned / maxInternal : 0.85;
      const estimatedSgpa = parseFloat((internalRatio * 10).toFixed(2));
      const estimatedPct = parseFloat(((estimatedSgpa - 0.75) * 10).toFixed(1));

      return {
        semester: sem,
        year: getYearFromSem(sem),
        isCurrentOngoing: true,
        sgpa: estimatedSgpa,
        credits: totalCredits,
        percentage: Math.max(40, estimatedPct),
        status: 'In Progress',
        subjects: subjectGrades
      };
    }

    // Published completed semester
    const weightedPoints = subjectGrades.reduce((sum, s) => sum + (s.gradePoints * s.credits), 0);
    const sgpa = totalCredits > 0 ? parseFloat((weightedPoints / totalCredits).toFixed(2)) : 8.5;
    const percentage = parseFloat(((sgpa - 0.75) * 10).toFixed(1));

    let status: 'Distinction' | 'First Class' | 'Second Class' | 'Pass' | 'Fail' = 'First Class';
    if (subjectGrades.some(s => s.grade === 'F')) {
      status = 'Fail';
    } else if (sgpa >= 8.5) {
      status = 'Distinction';
    } else if (sgpa >= 7.0) {
      status = 'First Class';
    } else if (sgpa >= 6.0) {
      status = 'Second Class';
    } else {
      status = 'Pass';
    }

    return {
      semester: sem,
      year: getYearFromSem(sem),
      isCurrentOngoing: false,
      sgpa,
      credits: totalCredits,
      percentage: Math.max(40, percentage),
      status,
      subjects: subjectGrades
    };
  });

  // Calculate official cumulative CGPA from all completed semesters (e.g. 1-1 to 3-2 for 4-1 students)
  const completedSemesters = semesterRecords.filter(s => !s.isCurrentOngoing);
  const pool = completedSemesters.length > 0 ? completedSemesters : semesterRecords;

  const totalCreditsCompleted = pool.reduce((sum, s) => sum + s.credits, 0);
  const totalWeightedPoints = pool.reduce((sum, s) => sum + (s.sgpa * s.credits), 0);
  const cumulativeCgpa = totalCreditsCompleted > 0 ? parseFloat((totalWeightedPoints / totalCreditsCompleted).toFixed(2)) : 8.75;
  const overallPercentage = parseFloat(((cumulativeCgpa - 0.75) * 10).toFixed(1));

  let academicStanding = 'First Class with Distinction';
  if (completedSemesters.some(s => s.status === 'Fail')) {
    academicStanding = 'Academic Warning / Backlogs Pending';
  } else if (cumulativeCgpa >= 8.5) {
    academicStanding = 'First Class with Distinction';
  } else if (cumulativeCgpa >= 7.0) {
    academicStanding = 'First Class';
  } else if (cumulativeCgpa >= 6.0) {
    academicStanding = 'Second Class';
  } else {
    academicStanding = 'Pass Division';
  }

  return {
    id: student.id || studentSeed,
    username,
    name,
    rollNumber: roll,
    department: dept,
    currentSemester: currentSem,
    currentYear: currentYr,
    cgpa: cumulativeCgpa,
    overallPercentage: Math.max(40, overallPercentage),
    completedSemestersCount: completedSemesters.length,
    totalCreditsCompleted,
    academicStanding,
    semesters: semesterRecords
  };
};

export const getStudentAcademicProfile = (student: any): StudentAcademicProfile => {
  if (!student) return generateDefaultAcademicProfile({});

  try {
    const savedProfiles = localStorage.getItem(STORAGE_KEY);
    if (savedProfiles) {
      const parsed: Record<string, StudentAcademicProfile> = JSON.parse(savedProfiles);
      const key = (student.roll_number || student.rollNumber || student.username || '').toLowerCase();
      if (parsed[key]) {
        return parsed[key];
      }
    }
  } catch (e) {
    console.warn("Failed to load saved academic profiles", e);
  }

  const generated = generateDefaultAcademicProfile(student);
  saveStudentAcademicProfile(generated);
  return generated;
};

export const saveStudentAcademicProfile = (profile: StudentAcademicProfile): void => {
  try {
    const savedProfiles = localStorage.getItem(STORAGE_KEY);
    const parsed: Record<string, StudentAcademicProfile> = savedProfiles ? JSON.parse(savedProfiles) : {};
    const key = (profile.rollNumber || profile.username || '').toLowerCase();
    parsed[key] = profile;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    
    // Dispatch custom event so all active components instantly reflect updated marks & CGPA
    window.dispatchEvent(new CustomEvent('academic-profile-updated', { detail: profile }));
  } catch (e) {
    console.warn("Failed to save academic profile", e);
  }
};

export const updateStudentSemesterGpa = (
  rollNumberOrUsername: string,
  targetSemester: string,
  newSgpa: number
): StudentAcademicProfile | null => {
  const cleanKey = rollNumberOrUsername.toLowerCase();
  let currentProfile = getStudentAcademicProfile({ roll_number: cleanKey, username: cleanKey });
  if (!currentProfile) return null;

  const validSgpa = Math.max(0, Math.min(10.0, parseFloat(newSgpa.toFixed(2))));
  const validPercentage = parseFloat(((validSgpa - 0.75) * 10).toFixed(1));

  let semFound = false;
  const updatedSemesters = currentProfile.semesters.map(s => {
    if (s.semester === targetSemester) {
      semFound = true;
      let status: 'Distinction' | 'First Class' | 'Second Class' | 'Pass' | 'Fail' | 'In Progress' = 'First Class';
      if (s.isCurrentOngoing) {
        status = 'In Progress';
      } else if (validSgpa < 5.0) {
        status = 'Fail';
      } else if (validSgpa >= 8.5) {
        status = 'Distinction';
      } else if (validSgpa >= 7.0) {
        status = 'First Class';
      } else if (validSgpa >= 6.0) {
        status = 'Second Class';
      } else {
        status = 'Pass';
      }

      return {
        ...s,
        sgpa: validSgpa,
        percentage: Math.max(40, validPercentage),
        status
      };
    }
    return s;
  });

  if (!semFound) {
    updatedSemesters.push({
      semester: targetSemester,
      year: getYearFromSem(targetSemester),
      isCurrentOngoing: targetSemester === currentProfile.currentSemester,
      sgpa: validSgpa,
      credits: 21.0,
      percentage: Math.max(40, validPercentage),
      status: targetSemester === currentProfile.currentSemester ? 'In Progress' : (validSgpa >= 8.5 ? 'Distinction' : validSgpa >= 7.0 ? 'First Class' : 'Pass'),
      subjects: []
    });
  }

  const completed = updatedSemesters.filter(s => !s.isCurrentOngoing);
  const pool = completed.length > 0 ? completed : updatedSemesters;

  const totalCredits = pool.reduce((sum, s) => sum + s.credits, 0);
  const weightedSum = pool.reduce((sum, s) => sum + (s.sgpa * s.credits), 0);
  const newCgpa = totalCredits > 0 ? parseFloat((weightedSum / totalCredits).toFixed(2)) : validSgpa;
  const newOverallPercentage = parseFloat(((newCgpa - 0.75) * 10).toFixed(1));

  let academicStanding = 'First Class with Distinction';
  if (completed.some(s => s.status === 'Fail')) {
    academicStanding = 'Academic Warning / Backlogs Pending';
  } else if (newCgpa >= 8.5) {
    academicStanding = 'First Class with Distinction';
  } else if (newCgpa >= 7.0) {
    academicStanding = 'First Class';
  } else if (newCgpa >= 6.0) {
    academicStanding = 'Second Class';
  } else {
    academicStanding = 'Pass Division';
  }

  const updatedProfile: StudentAcademicProfile = {
    ...currentProfile,
    cgpa: newCgpa,
    overallPercentage: Math.max(40, newOverallPercentage),
    completedSemestersCount: completed.length,
    totalCreditsCompleted: totalCredits,
    academicStanding,
    semesters: updatedSemesters
  };

  saveStudentAcademicProfile(updatedProfile);
  return updatedProfile;
};
