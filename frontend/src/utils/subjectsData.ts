export const SUBJECTS_DATABASE: Record<string, Record<string, string[]>> = {
  'Electrical and Electronics Engineering (EEE)': {
    '1-1': ['Linear Algebra & Calculus', 'Engineering Physics/Chemistry', 'Programming in C', 'Engineering Drawing', 'English', 'Labs'],
    '1-2': ['Differential Equations & Vector Calculus', 'Applied Physics', 'Basic Electrical Engineering', 'Data Structures', 'Workshops/Labs'],
    '2-1': ['Electrical Circuit Analysis-I', 'Electromagnetic Fields', 'DC Machines & Transformers', 'Thermal & Hydro Prime Movers', 'MEFA', 'Electrical Labs'],
    '2-2': ['Electrical Circuit Analysis-II', 'Electrical Machines-II', 'Control Systems', 'Analog Circuits', 'STLD', 'Machines Labs'],
    '3-1': ['Power Systems-II', 'Power Electronics', 'Measurements & Sensors', 'Professional Elective-I', 'Open Elective-I', 'Labs'],
    '3-2': ['Power System Analysis', 'Microprocessors & Microcontrollers', 'DSP', 'Professional Elective-II', 'Open Elective-II', 'Skill Course (ML with Python)', 'Labs'],
    '4-1': ['Switchgear & Protection', 'Utilization of Electrical Energy', 'Professional Electives (III & IV)', 'Open Elective-III', 'Internship evaluations'],
    '4-2': ['Professional Elective-V', 'Open Elective-IV', 'Major Project Work / Industry Internship']
  },
  'CSE AI': {
    '1-1': ['Linear Algebra & Calculus', 'Engineering Physics', 'Programming in C', 'Basic Civil & Mechanical Engineering', 'Communicative English', 'Labs'],
    '1-2': ['Differential Equations & Vector Calculus', 'Engineering Chemistry', 'Data Structures', 'Basic Electrical & Electronics Engineering', 'Graphics/Workshop', 'Data Structures Lab'],
    '2-1': ['Discrete Mathematics', 'OOP (Java/C++)', 'DBMS', 'Digital Logic & Computer Organization', 'Skill Course (Design Thinking / Full Stack-1)'],
    '2-2': ['Machine Learning', 'Probability & Statistics', 'Operating Systems', 'Software Engineering', 'Optimization Techniques', 'Labs'],
    '3-1': ['Artificial Intelligence', 'Computer Networks', 'Automata Theory & Compiler Design', 'NLP', 'Computer Vision', 'Professional Elective-I'],
    '3-2': ['Deep Learning', 'Data Analytics/Big Data', 'Web Technologies', 'Professional Elective-II', 'Open Elective-I', 'Labs'],
    '4-1': ['Generative AI', 'MLOps & Model Deployment', 'Professional Electives (III & IV)', 'Open Elective-II', 'Project Work Part-1'],
    '4-2': ['Major Industry Internship', 'Final Major Project / Dissertation']
  },
  'CSE AIML': {
    '1-1': ['Linear Algebra & Calculus', 'Engineering Physics/Chemistry', 'Programming in C', 'Workshop', 'English', 'Labs'],
    '1-2': ['Differential Equations & Vector Calculus', 'Python Programming', 'Data Structures', 'Basic Electrical & Electronics Engineering', 'Environmental Science', 'Labs'],
    '2-1': ['Probability & Statistics', 'Computer Organization', 'Operating Systems', 'Software Engineering', 'DBMS', 'Labs'],
    '2-2': ['Discrete Mathematics', 'Java OOP', 'Algorithms', 'Intro to AI', 'Automata Theory', 'Labs'],
    '3-1': ['Machine Learning', 'Data Warehousing', 'Computer Networks', 'Design Thinking', 'Professional Elective-I', 'Labs'],
    '3-2': ['Deep Learning', 'NLP', 'Data Analytics', 'Knowledge Representation', 'Open Elective-I', 'Labs'],
    '4-1': ['Generative AI', 'MLOps', 'Professional Electives (II & III)', 'Open Electives (II & III)', 'Major Project Phase-I'],
    '4-2': ['Professional Elective-IV', 'Open Elective-IV', 'Seminar', 'Major Project Phase-II']
  },
  'Computer Science and Engineering (CSE)': {
    '1-1': ['Engineering Mathematics-I', 'Physics/Chemistry', 'Programming in C', 'Engineering Graphics', 'English', 'Labs'],
    '1-2': ['Engineering Mathematics-II', 'Data Structures', 'Basic Electrical', 'Python/IT Workshop', 'Labs'],
    '2-1': ['Discrete Mathematics', 'Computer Organization', 'OOP (Java/C++)', 'Digital Logic Design', 'Business Economics', 'Labs'],
    '2-2': ['Operating Systems', 'DBMS', 'Advanced OOP', 'Automata Theory', 'Probability & Statistics', 'Labs'],
    '3-1': ['Software Engineering', 'Computer Networks', 'Algorithms', 'Web Technologies', 'Professional Elective-I', 'Labs'],
    '3-2': ['Compiler Design', 'Machine Learning', 'Data Warehousing', 'Cloud Computing', 'Professional Elective-II', 'Labs'],
    '4-1': ['Cryptography', 'Big Data Analytics', 'Professional Electives (III & IV)', 'Cloud Computing Lab', 'Project Stage-I'],
    '4-2': ['Management Science', 'Open Electives', 'Major Project Work', 'Seminar']
  },
  'Electronics and Communication Engineering (ECE)': {
    '1-1': ['Linear Algebra & Calculus', 'Physics/Chemistry', 'Basic Electrical', 'Programming in C', 'Graphics', 'Labs'],
    '1-2': ['Differential Equations', 'Applied Physics/Chemistry', 'Network Analysis', 'Data Structures', 'Workshops', 'Labs'],
    '2-1': ['Random Variables', 'Signals & Systems', 'Electronic Devices', 'Digital Circuits', 'Python/Java Programming', 'Labs'],
    '2-2': ['Control Systems', 'Electromagnetic Waves', 'Circuit Analysis', 'Analog Communications', 'Labs'],
    '3-1': ['Analog ICs', 'Digital Communications', 'Microprocessors', 'Professional Elective-I', 'Labs'],
    '3-2': ['DSP', 'VLSI Design', 'Antennas', 'Computer Networks', 'Professional Elective-II', 'Labs'],
    '4-1': ['Microwave Engineering', 'Embedded Systems', 'Optical Communications', 'Professional Electives (III & IV)', 'Labs'],
    '4-2': ['Professional Elective-V', 'Open Elective-IV', 'Major Project Work & Internship']
  },
  'Civil Engineering': {
    '1-1': ['Engineering Mathematics-I', 'Physics', 'Engineering Graphics', 'English', 'Programming in C', 'Labs'],
    '1-2': ['Engineering Mathematics-II', 'Chemistry', 'Mechanics', 'Basic Electrical', 'Environmental Science', 'Labs'],
    '2-1': ['Mathematics-III', 'Strength of Materials-I', 'Surveying-I', 'Fluid Mechanics-I', 'Building Materials', 'Labs'],
    '2-2': ['Strength of Materials-II', 'Fluid Mechanics-II', 'Surveying-II', 'Geotechnical Engineering-I', 'Structural Analysis-I', 'Labs'],
    '3-1': ['Structural Analysis-II', 'Geotechnical Engineering-II', 'Water Resources Engineering-I', 'Environmental Engineering-I', 'Transportation Engineering-I', 'Labs'],
    '3-2': ['RCC Design', 'Environmental Engineering-II', 'Transportation Engineering-II', 'Water Resources-II', 'Professional Elective-I', 'Labs'],
    '4-1': ['Estimation & Costing', 'Steel Structures', 'Professional Electives', 'Open Electives', 'Labs'],
    '4-2': ['Internship, Major Project Work', 'Seminar']
  }
};

export const getNormalizedDepartment = (dept: string = ''): string => {
  const d = dept.toLowerCase();
  if (d.includes('aiml')) return 'CSE AIML';
  if (d.includes('ai')) return 'CSE AI';
  if (d.includes('cse') || d.includes('computer science')) return 'Computer Science and Engineering (CSE)';
  if (d.includes('eee') || d.includes('electrical')) return 'Electrical and Electronics Engineering (EEE)';
  if (d.includes('ece') || d.includes('electronics')) return 'Electronics and Communication Engineering (ECE)';
  if (d.includes('civil')) return 'Civil Engineering';
  return 'Computer Science and Engineering (CSE)'; // default fallback
};
