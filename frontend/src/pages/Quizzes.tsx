import { useState, useEffect } from 'react';
import { HelpCircle, Play, ArrowRight, CheckCircle2, XCircle, Award, Plus, X, RefreshCw, BookOpen, GraduationCap, Filter, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNormalizedDepartment, SUBJECTS_DATABASE } from '../utils/subjectsData';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIdx: number;
}

interface Quiz {
  subject: string;
  title: string;
  duration: string;
  questions: Question[];
  year: string;
  semester: string;
  department: string;
  isDefault?: boolean;
}

const DEFAULT_QUIZZES: Quiz[] = [
  // 4th Year Sem 4-1 Quizzes
  {
    subject: 'Generative AI & Deep Learning',
    title: 'Transformers, Self-Attention & LLM Foundations',
    duration: '5 Minutes',
    year: '4th Year',
    semester: '4-1',
    department: 'Computer Science and Engineering (CSE)',
    isDefault: true,
    questions: [
      {
        id: 1,
        text: 'Which attention mechanism forms the core of the Transformer architecture ("Attention Is All You Need")?',
        options: ['Scaled Dot-Product Self-Attention', 'Recurrent Backprop BPTT', 'Spatial Max Pooling', 'Convolutional Stride'],
        correctIdx: 0
      },
      {
        id: 2,
        text: 'What technique mitigates LLM hallucinations by retrieving factual external knowledge chunks at runtime?',
        options: ['RAG (Retrieval-Augmented Generation)', 'Gradient Descent', 'DropConnect', 'Batch Normalization'],
        correctIdx: 0
      },
      {
        id: 3,
        text: 'LoRA (Low-Rank Adaptation) fine-tunes large foundation models by injecting low-rank matrices while freezing base weights.',
        options: ['True', 'False'],
        correctIdx: 0
      }
    ]
  },
  {
    subject: 'Cryptography & Network Security',
    title: 'Asymmetric Public-Key & AES Standards',
    duration: '6 Minutes',
    year: '4th Year',
    semester: '4-1',
    department: 'Computer Science and Engineering (CSE)',
    isDefault: true,
    questions: [
      {
        id: 1,
        text: 'Which asymmetric encryption algorithm relies on the computational difficulty of prime integer factorization?',
        options: ['RSA', 'AES-256', 'DES', 'SHA-256'],
        correctIdx: 0
      },
      {
        id: 2,
        text: 'What is the block size of the Advanced Encryption Standard (AES)?',
        options: ['128 bits', '64 bits', '256 bits', '512 bits'],
        correctIdx: 0
      },
      {
        id: 3,
        text: 'Diffie-Hellman key exchange allows two parties to establish a shared secret key over an insecure channel.',
        options: ['True', 'False'],
        correctIdx: 0
      }
    ]
  },
  {
    subject: 'Big Data Analytics',
    title: 'HDFS Distributed File System & Spark RDDs',
    duration: '5 Minutes',
    year: '4th Year',
    semester: '4-1',
    department: 'Computer Science and Engineering (CSE)',
    isDefault: true,
    questions: [
      {
        id: 1,
        text: 'In Hadoop HDFS architecture, which component maintains directory metadata and block locations in memory?',
        options: ['NameNode', 'DataNode', 'ResourceManager', 'NodeManager'],
        correctIdx: 0
      },
      {
        id: 2,
        text: 'What is the primary architectural advantage of Apache Spark over traditional MapReduce?',
        options: ['In-Memory RDD Processing', 'Single Thread Execution', 'Relational Table Locking', 'Synchronous Disk Writes'],
        correctIdx: 0
      },
      {
        id: 3,
        text: 'Apache Kafka provides distributed, fault-tolerant publish-subscribe real-time streaming.',
        options: ['True', 'False'],
        correctIdx: 0
      }
    ]
  },
  {
    subject: 'MLOps & Model Deployment',
    title: 'ML Lifecycle, Feature Stores & Drift Monitoring',
    duration: '5 Minutes',
    year: '4th Year',
    semester: '4-1',
    department: 'Computer Science and Engineering (CSE)',
    isDefault: true,
    questions: [
      {
        id: 1,
        text: 'Which tool is commonly utilized to log experiment parameters, metrics, and model artifacts?',
        options: ['MLflow', 'PostgreSQL', 'Docker Compose', 'Redis'],
        correctIdx: 0
      },
      {
        id: 2,
        text: 'What type of drift occurs when the input feature distribution P(X) changes over time while targets remain constant?',
        options: ['Data Drift (Covariate Shift)', 'Concept Drift', 'Prior Probability Shift', 'Schema Drift'],
        correctIdx: 0
      },
      {
        id: 3,
        text: 'A Feature Store provides a unified repository for features serving both offline training and low-latency online inference.',
        options: ['True', 'False'],
        correctIdx: 0
      }
    ]
  },

  // 3rd Year Sem 3-1 Quizzes
  {
    subject: 'Computer Networks',
    title: 'TCP/IP Model & Routing Protocols',
    duration: '6 Minutes',
    year: '3rd Year',
    semester: '3-1',
    department: 'Computer Science and Engineering (CSE)',
    isDefault: true,
    questions: [
      {
        id: 1,
        text: 'Which layer of the OSI model is responsible for reliable end-to-end flow control and error recovery?',
        options: ['Transport Layer', 'Network Layer', 'Data Link Layer', 'Session Layer'],
        correctIdx: 0
      },
      {
        id: 2,
        text: 'What protocol resolves IP network addresses into physical MAC hardware addresses?',
        options: ['ARP', 'DHCP', 'DNS', 'ICMP'],
        correctIdx: 0
      },
      {
        id: 3,
        text: 'TCP uses a 3-way handshake (SYN, SYN-ACK, ACK) to establish a connection.',
        options: ['True', 'False'],
        correctIdx: 0
      }
    ]
  },
  {
    subject: 'Design & Analysis of Algorithms (DAA)',
    title: 'Divide & Conquer, Greedy & Dynamic Programming',
    duration: '6 Minutes',
    year: '3rd Year',
    semester: '3-1',
    department: 'Computer Science and Engineering (CSE)',
    isDefault: true,
    questions: [
      {
        id: 1,
        text: 'What is the worst-case time complexity of binary search on a sorted array?',
        options: ['O(log n)', 'O(n)', 'O(1)', 'O(n^2)'],
        correctIdx: 0
      },
      {
        id: 2,
        text: 'Which algorithmic paradigm solves subproblems once and stores their solutions in a lookup table?',
        options: ['Dynamic Programming', 'Greedy Method', 'Brute Force', 'Backtracking'],
        correctIdx: 0
      },
      {
        id: 3,
        text: 'Dijkstra\'s algorithm finds the shortest path in a graph with non-negative edge weights.',
        options: ['True', 'False'],
        correctIdx: 0
      }
    ]
  },

  // 2nd Year Sem 2-1 Quizzes
  {
    subject: 'Database Management Systems (DBMS)',
    title: 'SQL, Normalization & ACID Transactions',
    duration: '5 Minutes',
    year: '2nd Year',
    semester: '2-1',
    department: 'Computer Science and Engineering (CSE)',
    isDefault: true,
    questions: [
      {
        id: 1,
        text: 'Which normal form eliminates transitive functional dependencies?',
        options: ['3NF', '1NF', '2NF', 'BCNF'],
        correctIdx: 0
      },
      {
        id: 2,
        text: 'What property in ACID guarantees that either all database operations succeed or none are applied?',
        options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
        correctIdx: 0
      },
      {
        id: 3,
        text: 'A Primary Key can accept NULL values in SQL.',
        options: ['False', 'True'],
        correctIdx: 0
      }
    ]
  },

  // 1st Year Sem 1-1 Quizzes
  {
    subject: 'Programming in C',
    title: 'Pointers, Memory Allocation & Structures',
    duration: '6 Minutes',
    year: '1st Year',
    semester: '1-1',
    department: 'Computer Science and Engineering (CSE)',
    isDefault: true,
    questions: [
      {
        id: 1,
        text: 'Which operator is used to obtain the memory address of a variable in C?',
        options: ['&', '*', '%', '->'],
        correctIdx: 0
      },
      {
        id: 2,
        text: 'What function is used to allocate dynamic heap memory without zero-initialization in C?',
        options: ['malloc()', 'calloc()', 'free()', 'sizeof()'],
        correctIdx: 0
      },
      {
        id: 3,
        text: 'In C, strings are null-terminated character arrays ending with the byte "\\0".',
        options: ['True', 'False'],
        correctIdx: 0
      }
    ]
  }
];

const Quizzes = () => {
  const { user, viewMode } = useAuth();
  const isFacultyOrAdmin = viewMode === 'faculty' || viewMode === 'admin';
  const isStudent = !isFacultyOrAdmin;

  // Student lock values
  const studentSem = user?.semester || '4-1';
  const getYearFromSem = (sem: string) => {
    if (sem.startsWith('1')) return '1st Year';
    if (sem.startsWith('2')) return '2nd Year';
    if (sem.startsWith('3')) return '3rd Year';
    if (sem.startsWith('4')) return '4th Year';
    return '4th Year';
  };
  const studentYear = user?.year || getYearFromSem(studentSem);
  const studentDept = getNormalizedDepartment(user?.department || 'Computer Science and Engineering (CSE)');

  // Main filter states for faculty/admin
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterSem, setFilterSem] = useState(isStudent ? studentSem : 'ALL');

  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    try {
      const saved = localStorage.getItem('campus_ai_quizzes');
      if (saved) {
        const parsed = JSON.parse(saved) as Quiz[];
        const customQuizzes = parsed.filter(q => !q.isDefault);
        return [...DEFAULT_QUIZZES, ...customQuizzes];
      }
    } catch {
      // ignore
    }
    return DEFAULT_QUIZZES;
  });

  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  
  // Game states
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);
  
  // Create quiz modal state (Defaults to 4th Year Sem 4-1)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState('Computer Science and Engineering (CSE)');
  const [newYear, setNewYear] = useState('4th Year');
  const [newSemester, setNewSemester] = useState('4-1');
  const [newSubject, setNewSubject] = useState('Generative AI & Deep Learning');
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState('5 Minutes');

  // Simple question creation
  const [q1Text, setQ1Text] = useState('');
  const [q1O1, setQ1O1] = useState('');
  const [q1O2, setQ1O2] = useState('');
  const [q1Correct, setQ1Correct] = useState(0);

  const [q2Text, setQ2Text] = useState('');
  const [q2O1, setQ2O1] = useState('');
  const [q2O2, setQ2O2] = useState('');
  const [q2Correct, setQ2Correct] = useState(0);

  const semestersForYear: Record<string, string[]> = {
    '1st Year': ['1-1', '1-2'],
    '2nd Year': ['2-1', '2-2'],
    '3rd Year': ['3-1', '3-2'],
    '4th Year': ['4-1', '4-2']
  };

  const handleYearChange = (selectedYear: string) => {
    setNewYear(selectedYear);
    const validSems = semestersForYear[selectedYear] || ['1-1'];
    const defaultSem = validSems[0];
    setNewSemester(defaultSem);
  };

  const normalizedNewDept = getNormalizedDepartment(newDepartment);
  const availableSubjects = SUBJECTS_DATABASE[normalizedNewDept]?.[newSemester] || 
    (SUBJECTS_DATABASE['Computer Science and Engineering (CSE)']?.[newSemester] || ['Math', 'Physics', 'CS']);

  useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.includes(newSubject)) {
      setNewSubject(availableSubjects[0]);
    }
  }, [newDepartment, newSemester, availableSubjects]);

  useEffect(() => {
    localStorage.setItem('campus_ai_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setIsQuizFinished(false);
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleNext = () => {
    if (!selectedQuiz) return;
    if (currentQuestionIdx < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setIsQuizFinished(true);
    }
  };

  const calculateScore = () => {
    if (!selectedQuiz) return 0;
    let score = 0;
    selectedQuiz.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIdx) {
        score++;
      }
    });
    return score;
  };

  const getQuizFeedback = (score: number, total: number) => {
    const ratio = score / total;
    if (ratio === 1) return 'Outstanding! Perfect score! AI rates you at 100% exam-ready.';
    if (ratio >= 0.6) return 'Good progress. Review incorrect terms to lock in an A grade.';
    return 'Shortage detected. Review the 5-unit textbook notes to reinforce concepts.';
  };

  const handleAddQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !q1Text.trim() || !q2Text.trim()) {
      alert("Please enter a challenge title and at least 2 questions.");
      return;
    }

    const quiz: Quiz = {
      subject: newSubject,
      title: newTitle.trim(),
      duration: newDuration,
      year: newYear,
      semester: newSemester,
      department: newDepartment,
      questions: [
        {
          id: 1,
          text: q1Text.trim(),
          options: [q1O1.trim() || 'Option A', q1O2.trim() || 'Option B'],
          correctIdx: q1Correct
        },
        {
          id: 2,
          text: q2Text.trim(),
          options: [q2O1.trim() || 'Option A', q2O2.trim() || 'Option B'],
          correctIdx: q2Correct
        }
      ]
    };

    setQuizzes([quiz, ...quizzes]);
    
    // reset
    setNewTitle('');
    setQ1Text('');
    setQ1O1('');
    setQ1O2('');
    setQ2Text('');
    setQ2O1('');
    setQ2O2('');
    setShowAddModal(false);
    alert(`Quiz "${quiz.title}" successfully published for ${quiz.department} - Year ${quiz.year} (${quiz.semester})!`);
  };

  // Filter quizzes by user role & selected filters
  const filteredQuizzes = quizzes.filter(q => {
    if (isStudent) {
      const matchSem = q.semester === studentSem;
      const matchDept = getNormalizedDepartment(q.department) === studentDept;
      return matchSem && matchDept;
    }
    // Faculty / Admin
    const matchDept = filterDept === 'ALL' || getNormalizedDepartment(q.department) === getNormalizedDepartment(filterDept);
    const matchSem = filterSem === 'ALL' || q.semester === filterSem;
    return matchDept && matchSem;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 min-h-screen pb-28">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
              {isStudent ? `Enrolled Quizzes • ${studentDept} • Sem ${studentSem}` : 'Faculty Academic Examination Sandbox'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            Interactive Subject Quizzes
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Test and evaluate understanding in core university subjects with immediate scoring and analytical feedback.
          </p>
        </div>

        {isFacultyOrAdmin && !selectedQuiz && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Quiz</span>
          </button>
        )}
      </header>

      {/* Filter Bar */}
      {!selectedQuiz && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Filter By Semester:</span>
          </div>

          {isStudent ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold rounded-xl">
              <GraduationCap className="w-4 h-4" />
              <span>{studentDept} • {studentYear} (Semester {studentSem})</span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {['ALL', '1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'].map(sem => (
                <button
                  key={sem}
                  onClick={() => setFilterSem(sem)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    filterSem === sem
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sem === 'ALL' ? 'All Semesters' : `Sem ${sem}`}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quiz Cards Grid */}
      {!selectedQuiz ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                    {quiz.subject}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md shrink-0">
                    Sem {quiz.semester} ({quiz.year})
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors leading-snug">
                  {quiz.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" /> {quiz.questions.length} Questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {quiz.duration}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleStartQuiz(quiz)}
                className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all group-hover:shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Quiz Challenge</span>
              </button>
            </div>
          ))}

          {filteredQuizzes.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 font-bold space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
              <p>No quizzes currently available for the chosen semester filter.</p>
              {isFacultyOrAdmin && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  Create Quiz for this Semester
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Quiz Active Sandbox */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl mx-auto">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block">{selectedQuiz.subject}</span>
              <h3 className="font-bold text-slate-900 text-sm">{selectedQuiz.title}</h3>
            </div>
            <button
              onClick={() => setSelectedQuiz(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 underline"
            >
              Quit Quiz
            </button>
          </div>

          {/* Body */}
          {!isQuizFinished ? (
            <div className="p-6 space-y-6">
              {/* Question progress */}
              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                <span>QUESTION {currentQuestionIdx + 1} OF {selectedQuiz.questions.length}</span>
                <span className="text-blue-600 font-extrabold">
                  {Math.round(((currentQuestionIdx + 1) / selectedQuiz.questions.length) * 100)}% Complete
                </span>
              </div>

              {/* Active question */}
              {(() => {
                const q = selectedQuiz.questions[currentQuestionIdx];
                return (
                  <div className="space-y-4">
                    <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                      {q.text}
                    </h4>

                    <div className="space-y-2.5">
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(q.id, oIdx)}
                          className={`w-full text-left p-4 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                            selectedAnswers[q.id] === oIdx
                              ? 'border-blue-600 bg-blue-50/80 text-blue-800 shadow-xs'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{opt}</span>
                          {selectedAnswers[q.id] === oIdx && (
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={selectedAnswers[selectedQuiz.questions[currentQuestionIdx].id] === undefined}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <span>{currentQuestionIdx < selectedQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-xs border border-blue-100">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">Quiz Completed!</h3>
                <p className="text-slate-500 text-xs font-medium mt-1">Here is your verified performance breakdown</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 max-w-sm mx-auto space-y-2">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Final Score</p>
                <div className="text-4xl font-black text-blue-600">
                  {calculateScore()} <span className="text-lg text-slate-400 font-bold">/ {selectedQuiz.questions.length}</span>
                </div>
                <p className="text-xs font-bold text-slate-700 pt-2">
                  {getQuizFeedback(calculateScore(), selectedQuiz.questions.length)}
                </p>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => handleStartQuiz(selectedQuiz)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  Back to Quiz List
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Quiz Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if(e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <form 
            onSubmit={handleAddQuizSubmit}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Create Academic Quiz</h3>
                <p className="text-xs text-slate-500">Configure target department, year, semester, and course subjects.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Department */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Department</label>
              <select
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Computer Science and Engineering (CSE)">Computer Science and Engineering (CSE)</option>
                <option value="CSE AI">CSE AI</option>
                <option value="CSE AIML">CSE AIML</option>
                <option value="Electrical and Electronics Engineering (EEE)">Electrical and Electronics Engineering (EEE)</option>
                <option value="Electronics and Communication Engineering (ECE)">Electronics and Communication Engineering (ECE)</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>

            {/* Academic Year & Semester */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Academic Year</label>
                <select
                  value={newYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Semester</label>
                <select
                  value={newSemester}
                  onChange={(e) => setNewSemester(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {(semestersForYear[newYear] || ['4-1', '4-2']).map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject Category & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Subject Category ({availableSubjects.length} courses)
                </label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
                >
                  {availableSubjects.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Duration Limit</label>
                <input
                  type="text"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  placeholder="e.g. 5 Minutes"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Quiz Challenge Title</label>
              <input
                type="text"
                placeholder="e.g. Deep Learning Transformer Architectures Quiz"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* Question 1 */}
            <div className="border-t border-slate-100 pt-3 space-y-2.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">Question 1</span>
              <input
                type="text"
                placeholder="Enter Question 1 text..."
                value={q1Text}
                onChange={(e) => setQ1Text(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Option A (e.g. Self-Attention)"
                  value={q1O1}
                  onChange={(e) => setQ1O1(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
                <input
                  type="text"
                  placeholder="Option B (e.g. Recurrence)"
                  value={q1O2}
                  onChange={(e) => setQ1O2(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500">Correct Option:</span>
                <select
                  value={q1Correct}
                  onChange={(e) => setQ1Correct(parseInt(e.target.value))}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                >
                  <option value={0}>Option A is Correct</option>
                  <option value={1}>Option B is Correct</option>
                </select>
              </div>
            </div>

            {/* Question 2 */}
            <div className="border-t border-slate-100 pt-3 space-y-2.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">Question 2</span>
              <input
                type="text"
                placeholder="Enter Question 2 text..."
                value={q2Text}
                onChange={(e) => setQ2Text(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Option A (e.g. True)"
                  value={q2O1}
                  onChange={(e) => setQ2O1(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
                <input
                  type="text"
                  placeholder="Option B (e.g. False)"
                  value={q2O2}
                  onChange={(e) => setQ2O2(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500">Correct Option:</span>
                <select
                  value={q2Correct}
                  onChange={(e) => setQ2Correct(parseInt(e.target.value))}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                >
                  <option value={0}>Option A is Correct</option>
                  <option value={1}>Option B is Correct</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Publish Quiz
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Quizzes;
