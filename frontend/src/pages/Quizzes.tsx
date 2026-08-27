import { useState, useEffect } from 'react';
import { HelpCircle, Play, ArrowRight, CheckCircle2, XCircle, Award, Plus, X, RefreshCw } from 'lucide-react';
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
  {
    subject: 'Discrete Mathematics',
    title: 'Laplace Transform & Integration Foundations',
    duration: '5 Minutes',
    year: '2nd Year',
    semester: '2-1',
    department: 'Computer Science and Engineering (CSE)',
    isDefault: true,
    questions: [
      {
        id: 1,
        text: 'What is the Laplace transform of L{1}?',
        options: ['1/s', 's', '1', '1/s^2'],
        correctIdx: 0
      },
      {
        id: 2,
        text: 'What is the Laplace transform of L{e^(at)}?',
        options: ['1/(s - a)', '1/(s + a)', 'a/s', 's/(s - a)'],
        correctIdx: 0
      },
      {
        id: 3,
        text: 'The Laplace transform is a type of linear transformation.',
        options: ['True', 'False'],
        correctIdx: 0
      }
    ]
  },
  {
    subject: 'Applied Physics/Chemistry',
    title: 'Quantum Mechanics & Optics Quiz',
    duration: '8 Minutes',
    year: '1st Year',
    semester: '1-2',
    department: 'Computer Science and Engineering (CSE)',
    isDefault: true,
    questions: [
      {
        id: 1,
        text: 'According to de Broglie, wave length is inversely proportional to:',
        options: ['Velocity', 'Momentum', 'Mass', 'Energy'],
        correctIdx: 1
      },
      {
        id: 2,
        text: 'Who formulated the wave equation of Quantum Mechanics?',
        options: ['Max Planck', 'Albert Einstein', 'Erwin Schrödinger', 'Niels Bohr'],
        correctIdx: 2
      },
      {
        id: 3,
        text: 'In young\'s double slit experiment, wave interference exhibits dual particle nature.',
        options: ['True', 'False'],
        correctIdx: 0
      }
    ]
  },
  {
    subject: 'Algorithms',
    title: 'Data Structures & Algorithmic Complexity',
    duration: '6 Minutes',
    year: '3rd Year',
    semester: '3-1',
    department: 'Computer Science and Engineering (CSE)',
    isDefault: true,
    questions: [
      {
        id: 1,
        text: 'What is the worst-case time complexity of binary search on a sorted list?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
        correctIdx: 2
      },
      {
        id: 2,
        text: 'Which data structure follows the Last-In-First-Out (LIFO) model?',
        options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
        correctIdx: 1
      },
      {
        id: 3,
        text: 'A hash table offers average-case constant lookup O(1).',
        options: ['True', 'False'],
        correctIdx: 0
      }
    ]
  },
  {
    subject: 'Engineering Mathematics-I',
    title: 'Matrices & Calculus Foundations',
    duration: '5 Minutes',
    year: '1st Year',
    semester: '1-1',
    department: 'Computer Science and Engineering (CSE)',
    isDefault: true,
    questions: [
      {
        id: 1,
        text: 'What is the rank of a 3x3 identity matrix?',
        options: ['0', '1', '3', '9'],
        correctIdx: 2
      },
      {
        id: 2,
        text: 'What is the derivative of sin(x^2) with respect to x?',
        options: ['cos(x^2)', '2x * cos(x^2)', '2 * sin(x)', '-cos(x^2)'],
        correctIdx: 1
      },
      {
        id: 3,
        text: 'Every square matrix can be expressed as the sum of a symmetric and a skew-symmetric matrix.',
        options: ['True', 'False'],
        correctIdx: 0
      }
    ]
  },
  {
    subject: 'Physics/Chemistry',
    title: 'Engineering Physics - Wave Optics & Lasers',
    duration: '7 Minutes',
    year: '1st Year',
    semester: '1-1',
    department: 'Computer Science and Engineering (CSE)',
    isDefault: true,
    questions: [
      {
        id: 1,
        text: 'Which phenomenon confirms the transverse wave nature of light?',
        options: ['Interference', 'Diffraction', 'Polarization', 'Refraction'],
        correctIdx: 2
      },
      {
        id: 2,
        text: 'What does LASER stand for?',
        options: [
          'Light Amplification by Stimulated Emission of Radiation',
          'Light Absorption by Stimulated Emission of Radiation',
          'Light Amplification by Spontaneous Emission of Radiation',
          'Light Association by Stimulated Energy Radiation'
        ],
        correctIdx: 0
      },
      {
        id: 3,
        text: 'Optical fibers work on the principle of Total Internal Reflection.',
        options: ['True', 'False'],
        correctIdx: 0
      }
    ]
  },
  {
    subject: 'Programming in C',
    title: 'Introduction to Programming in C',
    duration: '6 Minutes',
    year: '1st Year',
    semester: '1-1',
    department: 'Computer Science and Engineering (CSE)',
    isDefault: true,
    questions: [
      {
        id: 1,
        text: 'Which operator is used to find the address of a variable in C?',
        options: ['*', '&', '%', '&&'],
        correctIdx: 1
      },
      {
        id: 2,
        text: 'What is the size of a double data type in standard C (in bytes)?',
        options: ['2', '4', '8', '16'],
        correctIdx: 2
      },
      {
        id: 3,
        text: 'Recursion is a process in which a function calls itself directly or indirectly.',
        options: ['True', 'False'],
        correctIdx: 0
      }
    ]
  }
];

const Quizzes = () => {
  const { user, viewMode } = useAuth();

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
  
  // Create quiz modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState('Engineering Mathematics-I');
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState('5 Minutes');
  const [newYear, setNewYear] = useState('1st Year');
  const [newSemester, setNewSemester] = useState('1-1');
  const [newDepartment, setNewDepartment] = useState('Computer Science and Engineering (CSE)');

  // Simple question creation
  const [q1Text, setQ1Text] = useState('');
  const [q1O1, setQ1O1] = useState('');
  const [q1O2, setQ1O2] = useState('');
  const [q1Correct, setQ1Correct] = useState(0);

  const [q2Text, setQ2Text] = useState('');
  const [q2O1, setQ2O1] = useState('');
  const [q2O2, setQ2O2] = useState('');
  const [q2Correct, setQ2Correct] = useState(0);

  const normalizedNewDept = getNormalizedDepartment(newDepartment);
  const availableSubjects = SUBJECTS_DATABASE[normalizedNewDept]?.[newSemester] || ['Math', 'Physics', 'CS'];

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
    return 'Shortage detected. Ask the AI Campus Assistant to help summarize these concepts.';
  };

  const handleAddQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !q1Text.trim() || !q2Text.trim()) return;

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

    setQuizzes([...quizzes, quiz]);
    
    // reset
    setNewTitle('');
    setQ1Text('');
    setQ2Text('');
    setNewYear('1st Year');
    setNewSemester('1-1');
    setNewDepartment('Computer Science and Engineering (CSE)');
    setShowAddModal(false);
  };

  const studentYear = user?.year || '1st Year';
  const studentSem = user?.semester || '1-1';
  const studentDept = getNormalizedDepartment(user?.department || 'Computer Science and Engineering (CSE)');

  const filteredQuizzes = viewMode === 'student'
    ? quizzes.filter(q => q.year === studentYear && q.semester === studentSem && getNormalizedDepartment(q.department) === studentDept)
    : quizzes;

  const canCreate = viewMode === 'faculty' || viewMode === 'admin';

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-blue-600" />
            Interactive Quizzes
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Test your understanding in enrolled subjects with immediate grading & feedback.
          </p>
        </div>

        {canCreate && !selectedQuiz && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quiz</span>
          </button>
        )}
      </header>

      {/* Quiz List / Selection */}
      {!selectedQuiz ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all flex flex-col justify-between h-56 group"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">
                    {quiz.subject}
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold whitespace-nowrap">
                      {quiz.year} ({quiz.semester})
                    </span>
                    <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold max-w-[120px] truncate" title={quiz.department}>
                      {quiz.department.split(' ')[0]}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {quiz.duration}
                    </span>
                  </div>
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg mt-4 group-hover:text-blue-600 transition-colors">
                  {quiz.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Contains {quiz.questions.length} multiple choice questions.
                </p>
              </div>

              <button
                onClick={() => handleStartQuiz(quiz)}
                className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Quiz Challenge</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Quiz Active Sandbox */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-2xl mx-auto">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">{selectedQuiz.subject} Challenge</span>
              <h3 className="font-bold text-slate-800 text-sm truncate">{selectedQuiz.title}</h3>
            </div>
            <button
              onClick={() => setSelectedQuiz(null)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline"
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
                <span className="text-blue-600">
                  {Math.round(((currentQuestionIdx + 1) / selectedQuiz.questions.length) * 100)}% Complete
                </span>
              </div>

              {/* Active question */}
              {(() => {
                const q = selectedQuiz.questions[currentQuestionIdx];
                return (
                  <div className="space-y-4">
                    <h4 className="text-base font-extrabold text-slate-800">{q.text}</h4>
                    <div className="space-y-2.5">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[q.id] === oIdx;
                        return (
                          <div
                            key={oIdx}
                            onClick={() => handleSelectOption(q.id, oIdx)}
                            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer font-semibold text-sm ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50/40 text-blue-800'
                                : 'border-slate-100 bg-slate-50 text-slate-650 hover:border-slate-200'
                            }`}
                          >
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={selectedAnswers[selectedQuiz.questions[currentQuestionIdx].id] === undefined}
                  className="px-5 py-2.5 bg-blue-600 disabled:bg-slate-200 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span>{currentQuestionIdx === selectedQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Quiz Scoreboard results view */
            <div className="p-8 space-y-6 text-center">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-slate-800">Quiz Completed!</h3>
                <p className="text-sm font-semibold text-slate-500 mt-1">Here is your scorecard scorecard breakdown.</p>
              </div>

              {/* Marks circle */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl py-5 max-w-sm mx-auto space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Final Score</p>
                <h2 className="text-4xl font-extrabold text-slate-800">
                  {calculateScore()} <span className="text-lg font-bold text-slate-400">/ {selectedQuiz.questions.length}</span>
                </h2>
                <p className="text-xs text-blue-600 font-bold px-4 pt-2">
                  {getQuizFeedback(calculateScore(), selectedQuiz.questions.length)}
                </p>
              </div>

              {/* Review questions answer checklist */}
              <div className="text-left space-y-3.5 max-w-md mx-auto pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase">Review Answers</h4>
                {selectedQuiz.questions.map((q, idx) => {
                  const userAnsIdx = selectedAnswers[q.id];
                  const isCorrect = userAnsIdx === q.correctIdx;
                  return (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs font-semibold">
                      <div className="flex items-start gap-2 justify-between">
                        <span className="text-slate-800 text-[13px] font-bold">{q.text}</span>
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                      </div>
                      <div className="text-slate-500 flex flex-col gap-0.5">
                        <span>Your answer: <span className={isCorrect ? 'text-emerald-600 font-bold' : 'text-red-650 font-bold'}>{q.options[userAnsIdx]}</span></span>
                        {!isCorrect && (
                          <span className="text-slate-500">Correct answer: <span className="text-emerald-600 font-bold">{q.options[q.correctIdx]}</span></span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 max-w-sm mx-auto pt-4">
                <button
                  onClick={() => handleStartQuiz(selectedQuiz)}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  Back to List
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Quiz Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddQuizSubmit} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Create Subject Quiz</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-650 block mb-1">Subject Category</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                >
                  {availableSubjects.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-650 block mb-1">Duration Limit</label>
                <input
                  type="text"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="target-year" className="text-xs font-bold text-slate-650 block mb-1">Target Academic Year</label>
                <select
                  id="target-year"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
              <div>
                <label htmlFor="target-sem" className="text-xs font-bold text-slate-650 block mb-1">Target Semester</label>
                <select
                  id="target-sem"
                  value={newSemester}
                  onChange={(e) => setNewSemester(e.target.value)}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                >
                  <option value="1-1">1-1</option>
                  <option value="1-2">1-2</option>
                  <option value="2-1">2-1</option>
                  <option value="2-2">2-2</option>
                  <option value="3-1">3-1</option>
                  <option value="3-2">3-2</option>
                  <option value="4-1">4-1</option>
                  <option value="4-2">4-2</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="target-dept" className="text-xs font-bold text-slate-650 block mb-1">Target Department</label>
              <select
                id="target-dept"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              >
                <option value="Computer Science and Engineering (CSE)">Computer Science and Engineering (CSE)</option>
                <option value="Electrical and Electronics Engineering (EEE)">Electrical and Electronics Engineering (EEE)</option>
                <option value="Electronics and Communication Engineering (ECE)">Electronics and Communication Engineering (ECE)</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="CSE AIML">CSE AIML</option>
                <option value="CSE AI">CSE AI</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-650 block mb-1">Quiz Challenge Title</label>
              <input
                type="text"
                placeholder="e.g. Relational Databases Midterm Review"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Question 1</h4>
              <div>
                <label className="text-xs font-semibold text-slate-650 block mb-0.5">Question Text</label>
                <input
                  type="text"
                  placeholder="e.g. Which language runs in a web browser?"
                  value={q1Text}
                  onChange={(e) => setQ1Text(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block">Option A</label>
                  <input
                    type="text"
                    value={q1O1}
                    onChange={(e) => setQ1O1(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block">Option B</label>
                  <input
                    type="text"
                    value={q1O2}
                    onChange={(e) => setQ1O2(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-650 block mb-0.5">Correct Option Index</label>
                <select
                  value={q1Correct}
                  onChange={(e) => setQ1Correct(parseInt(e.target.value))}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Question 2</h4>
              <div>
                <label className="text-xs font-semibold text-slate-650 block mb-0.5">Question Text</label>
                <input
                  type="text"
                  placeholder="e.g. Is CSS a programming language?"
                  value={q2Text}
                  onChange={(e) => setQ2Text(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block">Option A</label>
                  <input
                    type="text"
                    value={q2O1}
                    onChange={(e) => setQ2O1(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block">Option B</label>
                  <input
                    type="text"
                    value={q2O2}
                    onChange={(e) => setQ2O2(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-655 block mb-0.5">Correct Option Index</label>
                <select
                  value={q2Correct}
                  onChange={(e) => setQ2Correct(parseInt(e.target.value))}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                Create Quiz Challenge
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
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

export default Quizzes;
