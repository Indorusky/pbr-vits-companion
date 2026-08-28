import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

import { 
  BookOpen, 
  Upload, 
  FileText, 
  Sparkles, 
  Download, 
  CheckCircle, 
  X, 
  GraduationCap, 
  Folder, 
  Brain, 
  HelpCircle, 
  Terminal, 
  Bot, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Sliders, 
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUBJECTS_DATABASE, getNormalizedDepartment } from '../utils/subjectsData';

interface Material {
  id: number;
  title: string;
  subject: string;
  size: string;
  date: string;
  summary: string;
}

interface Flashcard {
  front: string;
  back: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

interface InteractiveElement {
  title: string;
  type: string; // 'code' or 'formula'
  code_or_formula: string;
  explanation: string;
  simulated_output: string;
}

interface NotesData {
  detailed_notes: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  interactive_element: InteractiveElement;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

const getSuggestedModules = (subjectName: string): string[] => {
  const s = subjectName.toLowerCase();
  if (s.includes('machine learning')) {
    return [
      'Introduction to Supervised & Unsupervised Learning',
      'Linear Regression & Gradient Descent Optimization',
      'Decision Trees, Random Forests & Ensemble Methods',
      'Support Vector Machines (SVM) & Kernel Functions',
      'Neural Networks & Introduction to Deep Learning'
    ];
  }
  if (s.includes('artificial intelligence') || s.includes('intro to ai')) {
    return [
      'Heuristic Search Techniques (A*, DFS, BFS)',
      'Adversarial Search & Game Playing (Minimax, Alpha-Beta)',
      'Knowledge Representation & Propositional Logic',
      'Probabilistic Reasoning & Bayesian Networks',
      'Reinforcement Learning & Markov Decision Processes'
    ];
  }
  if (s.includes('data structures') || s.includes('algorithm')) {
    return [
      'Arrays, Linked Lists, Stacks & Queues',
      'Trees, Binary Search Trees & AVL Trees',
      'Hashing & Hash Tables Implementation',
      'Graphs Representation & Traversals (DFS, BFS)',
      'Sorting Algorithms & Heap Data Structure'
    ];
  }
  if (s.includes('operating systems')) {
    return [
      'Process Scheduling & States',
      'Thread Management & Synchronization (Semaphores)',
      'Memory Management, Paging & Virtual Memory',
      'Deadlocks Detection, Prevention & Avoidance',
      'File System Structure & Disk Scheduling'
    ];
  }
  if (s.includes('dbms') || s.includes('database')) {
    return [
      'Relational Model & ER Diagrams',
      'SQL Queries, Joins & Subqueries',
      'Normalization (1NF, 2NF, 3NF, BCNF)',
      'Transaction Management & ACID Properties',
      'Concurrency Control & Database Indexing'
    ];
  }
  if (s.includes('networks') || s.includes('network')) {
    return [
      'OSI & TCP/IP Reference Models',
      'Physical & Data Link Layer Protocols (Ethernet)',
      'IP Addressing, Routing Algorithms (OSPF, BGP)',
      'Transport Layer Protocols (TCP vs UDP, Congestion Control)',
      'Application Layer Protocols (HTTP, DNS, SMTP)'
    ];
  }
  if (s.includes('web')) {
    return [
      'HTML5, CSS3 Layouts & Responsive Design',
      'DOM Manipulation & Async JavaScript (Promises, Fetch)',
      'React Core Concepts (State, Props, Hooks)',
      'State Management & Client-side Routing',
      'REST APIs & Backend Integration'
    ];
  }
  if (s.includes('math') || s.includes('algebra') || s.includes('calculus') || s.includes('equations')) {
    return [
      'Matrices, Linear Systems & Eigenvalues',
      'First & Second Order Differential Equations',
      'Vector Calculus & Gradient, Divergence, Curl theorems',
      'Fourier Series & Laplace Transforms',
      'Probability Distributions & Statistical Hypotheses'
    ];
  }
  if (s.includes('physics')) {
    return [
      'Quantum Mechanics & Wave Particle Duality',
      'Electromagnetic Induction & Maxwell’s Equations',
      'Wave Optics & Interference, Diffraction',
      'Laser Physics & Fiber Optics Principles',
      'Semiconductor Physics & P-N Junction dynamics'
    ];
  }
  return [
    'Module 1: Foundational Theories & Principles',
    'Module 2: Analytical Formulations & Core Mechanisms',
    'Module 3: Practical Implementation & Lab Sandbox',
    'Module 4: Advanced Practice Problems & Solutions',
    'Module 5: Revision & Short-Answer Q&A'
  ];
};

const parseMarkdownToHtml = (md: string): string => {
  if (!md) return '';
  let html = md;

  // Escape HTML tags to prevent XSS
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks: ```language ... ```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl my-4 overflow-x-auto text-xs font-mono border border-slate-800"><div class="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider mb-2 select-none"><span>${lang || 'code'}</span></div><code>${code.trim()}</code></pre>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`\n]+)`/g, '<code class="bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200">$1</code>');

  // Math equations: $$ ... $$
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, '<div class="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-center my-4 font-serif text-base text-blue-900 overflow-x-auto">$1</div>');

  // Math equations: $ ... $
  html = html.replace(/\$([^\$\n]+)\$/g, '<span class="font-serif px-1 text-blue-800 font-bold bg-blue-50/30">$1</span>');

  // Headings
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-2xl font-extrabold text-slate-900 mt-6 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">$1</h1>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-xl font-bold text-slate-900 mt-5 mb-2.5">$1</h2>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">$1</h3>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="text-base font-bold text-slate-700 mt-3 mb-1.5">$1</h4>');

  // Bold text: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');

  // Bullet points
  html = html.replace(/^\*\s+(.+)$/gm, '<li class="ml-4 list-disc text-slate-700 my-1">$1</li>');
  html = html.replace(/^-\s+(.+)$/gm, '<li class="ml-4 list-disc text-slate-700 my-1">$1</li>');

  // Paragraphs (double newlines)
  html = html.split('\n\n').map(p => {
    if (p.trim().startsWith('<h') || p.trim().startsWith('<pre') || p.trim().startsWith('<div') || p.trim().startsWith('<li')) {
      return p;
    }
    return `<p class="text-slate-700 leading-relaxed text-sm my-3">${p}</p>`;
  }).join('\n');

  return html;
};

export const OFFICIAL_CSE_PDF_NOTES = [
  // Semester 1-1
  {
    title: 'Programming in C',
    code: '23CS101',
    semester: '1-1',
    pdfUrl: '/notes/Programming_in_C_Complete_Notes.pdf',
    units: ['Algorithms & C Basics', 'Functions & Storage Classes', 'Arrays, Strings & Pointers', 'Structures, Unions & DMA', 'File Handling & Preprocessors'],
    size: '145 KB'
  },
  // Semester 1-2
  {
    title: 'Data Structures & Algorithms',
    code: '23CS102',
    semester: '1-2',
    pdfUrl: '/notes/Data_Structures_and_Algorithms_Complete_Notes.pdf',
    units: ['Asymptotic Analysis & Linked Lists', 'Stacks & Queues ADTs', 'Trees & Balanced BSTs', 'Graphs & Traversals', 'Searching, Sorting & Hashing'],
    size: '185 KB'
  },
  // Semester 2-1
  {
    title: 'Database Management Systems (DBMS)',
    code: '23CS201',
    semester: '2-1',
    pdfUrl: '/notes/Database_Management_Systems_Complete_Notes.pdf',
    units: ['ER Modeling & Architecture', 'Relational Algebra & SQL', 'Functional Dependencies & Normalization', 'ACID Transactions & Concurrency (2PL)', 'Storage & B+ Tree Indexing'],
    size: '190 KB'
  },
  // Semester 2-2
  {
    title: 'Operating Systems',
    code: '23CS202',
    semester: '2-2',
    pdfUrl: '/notes/Operating_Systems_Complete_Notes.pdf',
    units: ['Process Management & PCB', 'CPU Scheduling Algorithms', 'Synchronization & Deadlocks', 'Virtual Memory & Paging', 'File Systems & Disk Scheduling'],
    size: '192 KB'
  },
  // Semester 3-1
  {
    title: 'Computer Networks',
    code: '23CS301',
    semester: '3-1',
    pdfUrl: '/notes/Computer_Networks_Complete_Notes.pdf',
    units: ['OSI & TCP/IP Architecture', 'Data Link Layer & MAC (CSMA/CD)', 'Network Layer & Routing Protocols', 'Transport Layer (TCP/UDP)', 'Application Layer & TLS/Security'],
    size: '188 KB'
  },
  {
    title: 'Design & Analysis of Algorithms (DAA)',
    code: '23CS302',
    semester: '3-1',
    pdfUrl: '/notes/Design_Analysis_Algorithms_Complete_Notes.pdf',
    units: ['Divide & Conquer Analysis', 'Greedy Method Paradigms', 'Dynamic Programming', 'Backtracking & Branch-and-Bound', 'NP-Completeness & P vs NP'],
    size: '180 KB'
  },
  // Semester 3-2
  {
    title: 'Cloud Computing & Virtualization',
    code: '23CS305',
    semester: '3-2',
    pdfUrl: '/notes/Cloud_Computing_Complete_Notes.pdf',
    units: ['NIST Cloud Architecture & Models', 'Hypervisors & Virtualization', 'Distributed Storage & CAP Theorem', 'Cloud Security & IAM Policies', 'Microservices, Docker & Kubernetes'],
    size: '175 KB'
  },
  // Semester 4-1 Complete Subjects
  {
    title: 'Generative AI & Deep Learning',
    code: '23CS401',
    semester: '4-1',
    pdfUrl: '/notes/Generative_AI_and_Deep_Learning_Complete_Notes.pdf',
    units: ['Deep Learning & Backpropagation', 'CNNs & Computer Vision', 'Sequential Models & LSTMs', 'Transformers & Self-Attention', 'LLMs, RAG & GenAI Systems'],
    size: '195 KB'
  },
  {
    title: 'Cryptography & Network Security',
    code: '23CS402',
    semester: '4-1',
    pdfUrl: '/notes/Cryptography_and_Network_Security_Complete_Notes.pdf',
    units: ['Classical Ciphers & Number Theory', 'Symmetric Encryption (AES/DES)', 'Public-Key RSA & Diffie-Hellman', 'Digital Signatures & SHA-256', 'IPsec, TLS & Network Defenses'],
    size: '188 KB'
  },
  {
    title: 'Big Data Analytics',
    code: '23CS403',
    semester: '4-1',
    pdfUrl: '/notes/Big_Data_Analytics_Complete_Notes.pdf',
    units: ['HDFS Architecture & NameNode', 'MapReduce & YARN Computing', 'In-Memory Analytics with Spark', 'NoSQL & CAP / Cassandra / HBase', 'Kafka Streaming & Data Lakes'],
    size: '192 KB'
  },
  {
    title: 'MLOps & Model Deployment',
    code: '23CS404',
    semester: '4-1',
    pdfUrl: '/notes/MLOps_and_Model_Deployment_Complete_Notes.pdf',
    units: ['MLOps Lifecycle & Technical Debt', 'Feature Stores & Experiment Tracking', 'Automated CI/CD/CT Pipelines', 'Containerized Serving & Triton', 'Drift Detection & Model Governance'],
    size: '185 KB'
  },
  {
    title: 'Cloud Computing Infrastructure & DevOps',
    code: '23CS405',
    semester: '4-1',
    pdfUrl: '/notes/Cloud_Computing_Complete_Notes.pdf',
    units: ['AWS & Azure Cloud Architectures', 'Kubernetes Clusters & Ingress', 'Distributed Object Storage & CDN', 'Serverless Functions (FaaS)', 'Infrastructure as Code (Terraform)'],
    size: '175 KB'
  },
  {
    title: 'Deep Learning & GenAI Practical Lab Manual',
    code: '23CS406L',
    semester: '4-1',
    pdfUrl: '/notes/Generative_AI_and_Deep_Learning_Complete_Notes.pdf',
    units: ['PyTorch Model Training', 'CNN Image Classifier Experiment', 'LSTM Text Generation Lab', 'HuggingFace Transformer Pipeline', 'Fine-Tuning LoRA / RAG Lab Setup'],
    size: '195 KB'
  },
  {
    title: 'Major Project Phase-I Engineering Guidelines',
    code: '23CS407P',
    semester: '4-1',
    pdfUrl: '/notes/Big_Data_Analytics_Complete_Notes.pdf',
    units: ['Problem Identification & Literature Survey', 'System Architecture & Dataflow Diagrams', 'Module Decomposition & Gantt Charts', 'Verification, Testing & Performance Benchmarks', 'Final Phase-I Presentation & Report Format'],
    size: '192 KB'
  }
];

const StudyMaterials = () => {
  const { user, viewMode } = useAuth();
  
  const isFacultyOrAdmin = viewMode === 'faculty' || viewMode === 'admin';
  const isStudent = !isFacultyOrAdmin;

  // Student specific lock values
  const studentDept = getNormalizedDepartment(user?.department || 'Computer Science');
  const studentSem = user?.semester || '4-1';
  const getYearFromSem = (sem: string) => {
    if (sem.startsWith('1')) return '1st Year';
    if (sem.startsWith('2')) return '2nd Year';
    if (sem.startsWith('3')) return '3rd Year';
    if (sem.startsWith('4')) return '4th Year';
    return '4th Year';
  };
  const studentYear = getYearFromSem(studentSem);

  // Navigation Modes (Default to Official 5-Unit Notes Library)
  const [activeModeTab, setActiveModeTab] = useState<'pdf-notes' | 'curriculum' | 'uploads'>('pdf-notes');
  const [pdfSearch, setPdfSearch] = useState('');
  const [pdfSemFilter, setPdfSemFilter] = useState(isStudent ? studentSem : 'ALL');

  // Filters State
  const [selectedDept, setSelectedDept] = useState(isStudent ? studentDept : studentDept);
  const [selectedYear, setSelectedYear] = useState(isStudent ? studentYear : '3rd Year');
  const [selectedSem, setSelectedSem] = useState(isStudent ? studentSem : studentSem);

  // Keep student locked to their enrolled credentials
  useEffect(() => {
    if (isStudent) {
      setSelectedDept(studentDept);
      setSelectedSem(studentSem);
      setSelectedYear(studentYear);
      setPdfSemFilter(studentSem);
    }
  }, [isStudent, studentDept, studentSem, studentYear]);

  // Synchronize selectedSem with selectedYear if faculty selects a different year
  useEffect(() => {
    if (!isStudent) {
      if (selectedYear === '1st Year') setSelectedSem('1-1');
      else if (selectedYear === '2nd Year') setSelectedSem('2-1');
      else if (selectedYear === '3rd Year') setSelectedSem('3-1');
      else if (selectedYear === '4th Year') setSelectedSem('4-1');
    }
  }, [selectedYear, isStudent]);

  // List of semesters available for selected year
  const semestersForYear: Record<string, string[]> = {
    '1st Year': ['1-1', '1-2'],
    '2nd Year': ['2-1', '2-2'],
    '3rd Year': ['3-1', '3-2'],
    '4th Year': ['4-1', '4-2']
  };

  const subjectsList = SUBJECTS_DATABASE[selectedDept]?.[selectedSem] || [];
  
  const [activeSubject, setActiveSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('');

  // Set default active subject when subjects list changes
  useEffect(() => {
    if (subjectsList.length > 0) {
      setActiveSubject(subjectsList[0]);
      setSelectedTopic(getSuggestedModules(subjectsList[0])[0]);
    } else {
      setActiveSubject('');
      setSelectedTopic('');
    }
    setCustomTopic('');
  }, [selectedDept, selectedSem, subjectsList.length]);

  // Handle active subject changes
  useEffect(() => {
    if (activeSubject) {
      setSelectedTopic(getSuggestedModules(activeSubject)[0]);
      setCustomTopic('');
    }
  }, [activeSubject]);

  // Notes state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<NotesData | null>(null);
  const [activeNotesTab, setActiveNotesTab] = useState<'notes' | 'flashcards' | 'quiz' | 'sandbox' | 'chat'>('notes');

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [knownCardsCount, setKnownCardsCount] = useState(0);
  const [reviewedCards, setReviewedCards] = useState<Record<number, boolean>>({});

  // Quiz state
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Sandbox variables simulator state (formula)
  const [formulaA, setFormulaA] = useState(5.0);
  const [formulaK, setFormulaK] = useState(0.2);
  const [formulaW, setFormulaW] = useState(2.0);

  // Sandbox code runner simulator state
  const [isSimulatingCode, setIsSimulatingCode] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  // Q&A Chat Assistant state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  // Uploaded documents state (original feature)
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newSummary, setNewSummary] = useState('');

  // Auto load/save uploaded materials in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('campus_ai_materials');
      if (saved) {
        const parsed = JSON.parse(saved);
        setMaterials(parsed);
        if (parsed.length > 0) {
          setSelectedMaterial(parsed[0]);
        }
      } else {
        const defaults = [
          {
            id: 1,
            title: 'Foundational Guide to Data Structures.pdf',
            subject: 'Data Structures',
            size: '2.8 MB',
            date: 'Oct 10, 2026',
            summary: 'Lecture slides, Big O complexity tables, and fundamental lists/trees implementation tutorials.'
          },
          {
            id: 2,
            title: 'Neural Networks & Gradient Descent Proofs.pdf',
            subject: 'Machine Learning',
            size: '4.5 MB',
            date: 'Oct 15, 2026',
            summary: 'Mathematical derivations of cost functions, gradients, and backpropagation models.'
          }
        ];
        setMaterials(defaults);
        setSelectedMaterial(defaults[0]);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) return;

    const newMat: Material = {
      id: Date.now(),
      title: newTitle.trim().endsWith('.pdf') ? newTitle.trim() : `${newTitle.trim()}.pdf`,
      subject: newSubject || subjectsList[0] || 'Computer Science',
      size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
      date: 'Today',
      summary: newSummary.trim()
    };

    const updated = [newMat, ...materials];
    setMaterials(updated);
    localStorage.setItem('campus_ai_materials', JSON.stringify(updated));
    setNewTitle('');
    setNewSummary('');
    setShowUploadModal(false);
    setSelectedMaterial(newMat);
  };

  // Notes generation logic
  const handleGenerateNotes = async (subj: string, topicStr: string) => {
    if (!subj || !topicStr) return;
    
    setIsGenerating(true);
    setGeneratedNotes(null);
    setActiveNotesTab('notes');
    
    // Reset flashcards/quiz/sandbox
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
    setKnownCardsCount(0);
    setReviewedCards({});
    setQuizScore(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setSimulationLogs([]);
    setChatMessages([
      {
        sender: 'bot',
        text: `Hi! I am your AI study assistant. I have loaded detailed materials on **${topicStr}** (${subj}). Ask me any questions or click on the tabs above to try flashcards, quizzes, or parameter simulators!`
      }
    ]);

    try {
      const response = await fetch(`${API_BASE_URL}/generate-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subj,
          title: topicStr
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedNotes(data);
      } else {
        throw new Error('API response not ok');
      }
    } catch (e) {
      console.error("Error generating notes from backend:", e);
      // Fallback is handled in backend return or will trigger local backup if backend completely down
      const fallbackData: NotesData = {
        detailed_notes: `# Fallback Guide: ${subj}\n\nFailed to connect to the backend server. Please verify the backend server is running at ${API_BASE_URL}.`,
        flashcards: [{ front: "Error Connecting", back: "Please ensure local server is running." }],
        quiz: [{ question: "Is the backend server running?", options: ["Yes", "No", "Checking...", "Unknown"], correct_answer_index: 1, explanation: "Verify command prompt logs." }],
        interactive_element: { title: "Damped Wave", type: "formula", code_or_formula: "y(t) = A * e^(-k * t)", explanation: "Check server connection status.", simulated_output: "A = Amplitude, k = Decay" }
      };
      setGeneratedNotes(fallbackData);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run mock code simulation
  const handleRunSimulation = (codeOrFormula: string, simulatedLogStr: string) => {
    setIsSimulatingCode(true);
    setSimulationLogs([]);
    
    const lines = simulatedLogStr.split('\n');
    let currentLine = 0;
    
    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setSimulationLogs(prev => [...prev, lines[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setIsSimulatingCode(false);
      }
    }, 600);
  };

  // Note-specific Q&A chat submit
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !generatedNotes || isChatSending) return;

    const userQuery = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userQuery }]);
    setChatInput('');
    setIsChatSending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat-about-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: activeSubject,
          topic: customTopic.trim() || selectedTopic,
          notes_context: generatedNotes.detailed_notes,
          question: userQuery
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
      } else {
        throw new Error('API response not ok');
      }
    } catch (e) {
      console.error("Chat error:", e);
      setChatMessages(prev => [
        ...prev, 
        { sender: 'bot', text: "Failed to connect to the academic AI tutor. Please check if the backend is running." }
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Flashcards navigation
  const handleFlashcardReview = (known: boolean) => {
    if (!reviewedCards[currentCardIndex]) {
      setReviewedCards(prev => ({ ...prev, [currentCardIndex]: true }));
      if (known) setKnownCardsCount(prev => prev + 1);
    }
    
    setIsCardFlipped(false);
    setTimeout(() => {
      if (generatedNotes && currentCardIndex < generatedNotes.flashcards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      }
    }, 200);
  };

  // Quiz helper
  const handleQuizAnswer = (qIndex: number, oIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
  };

  const submitQuiz = () => {
    if (!generatedNotes) return;
    let score = 0;
    generatedNotes.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_answer_index) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-36 md:pb-12 min-h-screen">
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Study Materials & Interactive Notes
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Access course syllabi, browse subjects, and instantly generate interactive AI notes.
          </p>
        </div>

        {/* Mode Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-auto shrink-0 select-none">
          <button
            onClick={() => setActiveModeTab('curriculum')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeModeTab === 'curriculum'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Course Curriculum</span>
          </button>
          <button
            onClick={() => setActiveModeTab('pdf-notes')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeModeTab === 'pdf-notes'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>5-Unit Notes Library (PDF)</span>
          </button>
          <button
            onClick={() => setActiveModeTab('uploads')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeModeTab === 'uploads'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Shared Documents</span>
          </button>
        </div>
      </header>

      {/* Curriculum Browse Mode */}
      {activeModeTab === 'curriculum' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          {isStudent ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-blue-600 text-white rounded-xl shadow-sm">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Enrolled Department & Term</span>
                  <h3 className="text-sm font-extrabold text-slate-900">{studentDept} • {studentYear} (Semester {studentSem})</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Showing registered curriculum subjects and official notes for your enrolled semester.</p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 bg-white border border-blue-200 text-blue-700 text-xs font-extrabold rounded-xl shadow-xs shrink-0">
                Active: Sem {studentSem}
              </span>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm flex flex-col md:flex-row md:items-center gap-5 justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {/* Department Filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {Object.keys(SUBJECTS_DATABASE).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                {/* Semester Filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Semester</label>
                  <div className="flex gap-2">
                    {(semestersForYear[selectedYear] || []).map(sem => (
                      <button
                        key={sem}
                        onClick={() => setSelectedSem(sem)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          selectedSem === sem
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Semester {sem}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Subject Grid Selector */}
            <div className="lg:col-span-4 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Semester Subjects ({subjectsList.length})
              </h2>
              
              {subjectsList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  No subjects registered for this semester.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {subjectsList.map((subject) => {
                    const isActive = activeSubject === subject;
                    return (
                      <div
                        key={subject}
                        onClick={() => setActiveSubject(subject)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isActive
                            ? 'border-blue-500 bg-blue-50/40 shadow-sm'
                            : 'border-slate-150 hover:border-slate-255 bg-white hover:shadow-sm'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-extrabold text-slate-800 truncate">{subject}</p>
                          <p className="text-[10px] text-slate-450 mt-0.5">
                            {getSuggestedModules(subject).length} Suggested Modules
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                          isActive ? 'translate-x-1 text-blue-600' : 'text-slate-350'
                        }`} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Topic Selector & Generator Panel */}
            <div className="lg:col-span-8">
              {activeSubject ? (
                <div className="bg-white rounded-2xl p-6 border border-slate-150 shadow-sm space-y-6">
                  <div>
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-150 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {activeSubject}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-2">Generate Interactive Notes</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Select a suggested module curriculum or input a specific custom study topic.</p>
                  </div>

                  {/* Modules suggestions list */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Suggested Modules</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getSuggestedModules(activeSubject).map((module) => {
                        const isSelected = selectedTopic === module && !customTopic;
                        return (
                          <div
                            key={module}
                            onClick={() => {
                              setSelectedTopic(module);
                              setCustomTopic('');
                            }}
                            className={`p-3.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                                : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            {module}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Topic Input */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Or Input Custom Topic</label>
                    <input
                      type="text"
                      placeholder="e.g. Backpropagation algorithm step by step mathematical derivation with examples"
                      value={customTopic}
                      onChange={(e) => {
                        setCustomTopic(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  {/* Direct View 5-Unit Notes Button */}
                  <button
                    onClick={() => {
                      setActiveModeTab('pdf-notes');
                      setPdfSearch(activeSubject);
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>View & Download Official 5-Unit Notes (PDF)</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-150 text-slate-400 text-sm">
                  Select a subject from the left panel to begin.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Documents List Mode (Preserving Original Feature) */}
      {activeModeTab === 'uploads' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Materials list */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-150 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Shared Slide Decks & Notes</h2>
              {isFacultyOrAdmin && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                  title="Upload New Guide"
                >
                  <Upload className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  onClick={() => setSelectedMaterial(mat)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedMaterial?.id === mat.id
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                      : 'border-slate-105 hover:border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-lg text-blue-600 border border-slate-100 shadow-sm">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{mat.title}</p>
                      <p className="text-[9px] text-slate-450 mt-0.5">{mat.subject} • {mat.size} • {mat.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Document Overview Panel */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-150 shadow-sm flex flex-col justify-between min-h-[400px]">
            {selectedMaterial ? (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 border border-blue-150 px-2 py-1 rounded">
                    {selectedMaterial.subject}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedMaterial.title}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Uploaded {selectedMaterial.date} • {selectedMaterial.size}</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Original Overview</h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{selectedMaterial.summary}</p>
                </div>

                {/* View 5-Unit Notes library */}
                <button
                  onClick={() => {
                    setActiveModeTab('pdf-notes');
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Browse 5-Unit Complete Course Notes Library</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Select a document from the left list.
              </div>
            )}
            
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Department Course Notes Verified</span>
              <span>{materials.length} Shared Documents Available</span>
            </div>
          </div>
        </div>
      )}

      {/* 5-Unit Official Subject Notes (PDF Library) */}
      {activeModeTab === 'pdf-notes' && (
        <section className="space-y-6">
          {/* Search & Semester Filters */}
          <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder={isStudent ? `Search ${studentDept} Semester ${studentSem} materials (e.g. 23CS401, Deep Learning)...` : "Search subject title, course code (e.g. 23CS401, Operating Systems)..."}
                value={pdfSearch}
                onChange={(e) => setPdfSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
              />
            </div>

            {isStudent ? (
              <div className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-extrabold text-blue-800 shrink-0">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>{studentDept} • Sem {studentSem} ({studentYear})</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {['ALL', '1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1'].map(sem => (
                  <button
                    key={sem}
                    onClick={() => setPdfSemFilter(sem)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      pdfSemFilter === sem
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {sem === 'ALL' ? 'All Semesters' : `Sem ${sem}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OFFICIAL_CSE_PDF_NOTES
              .filter(item => {
                const matchesSearch = item.title.toLowerCase().includes(pdfSearch.toLowerCase()) || item.code.toLowerCase().includes(pdfSearch.toLowerCase());
                const matchesSem = isStudent
                  ? (item.semester === studentSem)
                  : (pdfSemFilter === 'ALL' || item.semester === pdfSemFilter);
                return matchesSearch && matchesSem;
              })
              .map((item) => (
                <div key={item.code} className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-200 transition-all group">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {item.code} • Sem {item.semester}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold">
                        5 Units Complete
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {/* Unit list preview */}
                    <div className="space-y-1.5 pt-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit Breakdown:</p>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {item.units.map((u, uIdx) => (
                          <li key={uIdx} className="flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                            <span className="truncate font-medium">Unit {uIdx + 1}: {u}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                    <span className="text-[11px] font-bold text-slate-400">
                      Size: {item.size}
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={item.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                      >
                        View
                      </a>
                      <a
                        href={item.pdfUrl}
                        download
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-all hover:scale-105"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download PDF
                      </a>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Upload Modal (Original Feature) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleUploadSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Upload Notes / Slide Deck</h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Document Title</label>
              <input
                type="text"
                placeholder="e.g. Advanced Automata Theory Lecture 2"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Subject</label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              >
                {subjectsList.map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
                {subjectsList.length === 0 && <option value="Computer Science">Computer Science</option>}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Document Overview / Description</label>
              <textarea
                rows={4}
                placeholder="Write a brief overview of the topics covered in this document..."
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                Upload & Share
              </button>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudyMaterials;
