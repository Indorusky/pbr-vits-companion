import { useState, useEffect } from "react";
import {
  BarChart3,
  Calculator,
  Award,
  GraduationCap,
  CheckCircle2,
  Percent,
  BookOpen,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Layers,
  Sparkles,
  Clock,
  Info,
  Beaker,
  FileSpreadsheet,
  Check,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getStudentAcademicProfile,
  type StudentAcademicProfile,
} from "../utils/academicData";
import { API_BASE_URL, getAuthHeaders } from "../config";

interface ComponentMark {
  exam_id: number;
  exam_type: string;
  marks: number;
  max_marks: number;
  is_published: number;
  published_at?: string;
}

interface StudentSubjectResultReport {
  subject: string;
  subject_code?: string;
  subject_type: "THEORY" | "LAB";
  department: string;
  semester: string;
  components: Record<string, ComponentMark>;
  mid1_marks?: number;
  mid2_marks?: number;
  internal_marks?: number;
  semester_marks?: number;
  lab_internal?: number;
  lab_external?: number;
  final_marks?: number;
  grade?: string;
  grade_points?: number;
  status: string;
}

interface GradeScaleItem {
  grade: string;
  min_marks: number;
  max_marks: number;
  grade_points: number;
  description: string;
}

const DEFAULT_GRADE_SCALE: GradeScaleItem[] = [
  {
    grade: "S",
    min_marks: 90,
    max_marks: 100,
    grade_points: 10,
    description: "Outstanding Performance",
  },
  {
    grade: "A",
    min_marks: 80,
    max_marks: 89.99,
    grade_points: 9,
    description: "Excellent Performance",
  },
  {
    grade: "B",
    min_marks: 70,
    max_marks: 79.99,
    grade_points: 8,
    description: "Very Good Performance",
  },
  {
    grade: "C",
    min_marks: 60,
    max_marks: 69.99,
    grade_points: 7,
    description: "Good Performance",
  },
  {
    grade: "D",
    min_marks: 50,
    max_marks: 59.99,
    grade_points: 6,
    description: "Satisfactory Performance",
  },
  {
    grade: "F",
    min_marks: 0,
    max_marks: 49.99,
    grade_points: 0,
    description: "Fail / Reappear",
  },
];

const Marks = () => {
  const { user } = useAuth();

  const [profile] = useState<StudentAcademicProfile>(() =>
    getStudentAcademicProfile(user),
  );
  const [selectedSemester, setSelectedSemester] = useState<string>(
    user?.semester || "3-1",
  );
  const [activeTab, setActiveTab] = useState<
    "overview" | "theory" | "lab" | "grade_scale"
  >("overview");

  // Real backend marks state
  const [liveResults, setLiveResults] = useState<StudentSubjectResultReport[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [gradeScale, setGradeScale] =
    useState<GradeScaleItem[]>(DEFAULT_GRADE_SCALE);

  const semestersList = [
    "1-1",
    "1-2",
    "2-1",
    "2-2",
    "3-1",
    "3-2",
    "4-1",
    "4-2",
  ];

  // Fetch official published marks from backend
  const fetchStudentMarks = async (sem: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/student/examinations?semester=${encodeURIComponent(sem)}`,
        {
          headers: getAuthHeaders(),
        },
      );
      if (res.ok) {
        const data = await res.json();
        setLiveResults(Array.isArray(data) ? data : []);
      } else {
        setLiveResults([]);
      }
    } catch (err) {
      console.warn("Failed to load official examination marks:", err);
      setLiveResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch grading scale
  useEffect(() => {
    fetch(`${API_BASE_URL}/examinations/grade-config`, {
      headers: getAuthHeaders(),
    })
      .then((res) => (res.ok ? res.json() : DEFAULT_GRADE_SCALE))
      .then((data) => setGradeScale(data))
      .catch(() => setGradeScale(DEFAULT_GRADE_SCALE));
  }, []);

  useEffect(() => {
    fetchStudentMarks(selectedSemester);
  }, [selectedSemester]);

  const theoryResults = liveResults.filter((r) => r.subject_type === "THEORY");
  const labResults = liveResults.filter((r) => r.subject_type === "LAB");

  // Stats
  const publishedSubjectsCount = liveResults.filter(
    (r) => r.status === "Published",
  ).length;
  const pendingSubjectsCount = liveResults.length - publishedSubjectsCount;

  const getGradeBadge = (grade?: string) => {
    if (!grade)
      return <span className="text-slate-400 font-bold text-xs">—</span>;
    switch (grade) {
      case "S":
        return (
          <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
            Grade S
          </span>
        );
      case "A":
        return (
          <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-blue-100 text-blue-800 border border-blue-300">
            Grade A
          </span>
        );
      case "B":
        return (
          <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-300">
            Grade B
          </span>
        );
      case "C":
        return (
          <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-amber-100 text-amber-800 border border-amber-300">
            Grade C
          </span>
        );
      case "D":
        return (
          <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-orange-100 text-orange-800 border border-orange-300">
            Grade D
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-red-100 text-red-800 border border-red-300">
            Grade F
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 min-h-screen pb-28">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
              Official University Examination Portal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Examinations & Academic Gradebook
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Verified Mid-1, Mid-2 (80:20 weighted), Semester End, and Practical
            Lab examination transcripts.
          </p>
        </div>

        {/* Semester Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
            Semester:
          </span>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          >
            {semestersList.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              Cumulative CGPA
            </span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            {profile.cgpa.toFixed(2)}{" "}
            <span className="text-xs text-slate-400 font-bold">/ 10.0</span>
          </h3>
          <p className="text-[11px] text-blue-600 font-bold mt-0.5">
            Overall University Performance
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              Published Results
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-emerald-600">
            {publishedSubjectsCount}{" "}
            <span className="text-xs text-slate-400 font-bold">Subjects</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Official Grades Released
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              Pending Evaluation
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-amber-600">
            {pendingSubjectsCount}{" "}
            <span className="text-xs text-slate-400 font-bold">Subjects</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Exams In-Progress or Unreleased
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              Internal Formula
            </span>
            <Calculator className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-purple-700">
            80% High + 20% Low
          </h3>
          <p className="text-[11px] text-purple-600 font-bold mt-0.5">
            Internal Component (30M)
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Consolidated Overview
        </button>
        <button
          onClick={() => setActiveTab("theory")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "theory"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Theory Subjects ({theoryResults.length})
        </button>
        <button
          onClick={() => setActiveTab("lab")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "lab"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Beaker className="w-4 h-4" />
          Laboratory Subjects ({labResults.length})
        </button>
        <button
          onClick={() => setActiveTab("grade_scale")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "grade_scale"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Award className="w-4 h-4" />
          University Grading Scale
        </button>
      </div>

      {/* 80:20 Academic Formula Explainer Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4.5 text-xs text-blue-900 shadow-xs flex items-start gap-3">
        <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="font-extrabold text-blue-950 flex items-center gap-2">
            <span>
              PBR VITS Continuous Internal Evaluation (CIE) Calculation Rules:
            </span>
          </div>
          <p className="text-slate-600 font-medium leading-relaxed">
            • <strong>Theory:</strong> Internal Marks (out of 30) ={" "}
            <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold text-blue-700">
              (Higher Mid / 30 × 24) + (Lower Mid / 30 × 6)
            </code>
            . Higher scoring mid receives 80% weightage; lower scoring mid
            receives 20% weightage. Final marks = Internal (30) + Semester End
            Exam (70) = 100 Marks.
          </p>
          <p className="text-slate-600 font-medium leading-relaxed">
            • <strong>Laboratories:</strong> Continuous Lab Internal (Max 30) +
            University External Lab Exam (Max 70) = Final 100 Marks.
          </p>
          <p className="text-blue-800 font-bold text-[11px] mt-1">
            🔒 Official Integrity: Only university-published examination results
            appear on this gradebook. Draft examination marks are withheld until
            faculty publication.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <h4 className="text-sm font-bold text-slate-800">
            Loading Official Examination Records...
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Fetching published marks for Semester {selectedSemester}
          </p>
        </div>
      ) : liveResults.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">
            No Examination Records Found
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No subjects or examinations are currently scheduled or published for
            Semester {selectedSemester}.
          </p>
        </div>
      ) : (
        <>
          {/* TAB 1: CONSOLIDATED OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Theory Subjects Overview Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Theory Examinations Overview (Sem {selectedSemester})
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    Total Theory: {theoryResults.length}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-3 text-center">Mid-1 (30M)</th>
                        <th className="py-3 px-3 text-center">Mid-2 (30M)</th>
                        <th className="py-3 px-3 text-center bg-blue-50/50 text-blue-900">
                          Internal (30M)
                        </th>
                        <th className="py-3 px-3 text-center">
                          Semester (70M)
                        </th>
                        <th className="py-3 px-3 text-center font-black">
                          Final (100M)
                        </th>
                        <th className="py-3 px-4 text-center">Grade</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {theoryResults.map((sub, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900">
                              {sub.subject}
                            </div>
                            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                              {sub.subject_code || "THEORY"}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold">
                            {sub.mid1_marks !== undefined &&
                            sub.mid1_marks !== null ? (
                              <span className="text-slate-800">
                                {sub.mid1_marks}{" "}
                                <span className="text-[10px] text-slate-400">
                                  /30
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium italic text-[11px]">
                                Not published
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold">
                            {sub.mid2_marks !== undefined &&
                            sub.mid2_marks !== null ? (
                              <span className="text-slate-800">
                                {sub.mid2_marks}{" "}
                                <span className="text-[10px] text-slate-400">
                                  /30
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium italic text-[11px]">
                                Not published
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-center bg-blue-50/30">
                            {sub.internal_marks !== undefined &&
                            sub.internal_marks !== null ? (
                              <span className="font-black text-blue-700">
                                {sub.internal_marks}{" "}
                                <span className="text-[10px] text-blue-400">
                                  /30
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium italic text-[11px]">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold">
                            {sub.semester_marks !== undefined &&
                            sub.semester_marks !== null ? (
                              <span className="text-slate-800">
                                {sub.semester_marks}{" "}
                                <span className="text-[10px] text-slate-400">
                                  /70
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium italic text-[11px]">
                                Not published
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            {sub.final_marks !== undefined &&
                            sub.final_marks !== null ? (
                              <span className="font-black text-slate-900 text-sm">
                                {sub.final_marks}{" "}
                                <span className="text-[10px] text-slate-400">
                                  /100
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium italic text-[11px]">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {getGradeBadge(sub.grade)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                sub.status === "Published"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : sub.status === "Partially Published"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {sub.status === "Published" && (
                                <Check className="w-3 h-3" />
                              )}
                              {sub.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lab Subjects Overview Table */}
              {labResults.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Beaker className="w-5 h-5 text-purple-600" />
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                        Practical Laboratory Examinations (Sem{" "}
                        {selectedSemester})
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
                      Total Labs: {labResults.length}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                          <th className="py-3 px-4">Laboratory Course</th>
                          <th className="py-3 px-3 text-center bg-purple-50/50 text-purple-900">
                            Lab Internal (30M)
                          </th>
                          <th className="py-3 px-3 text-center">
                            Lab External (70M)
                          </th>
                          <th className="py-3 px-3 text-center font-black">
                            Final Marks (100M)
                          </th>
                          <th className="py-3 px-4 text-center">Grade</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {labResults.map((sub, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50/60 transition-colors"
                          >
                            <td className="py-3.5 px-4">
                              <div className="font-extrabold text-slate-900">
                                {sub.subject}
                              </div>
                              <div className="text-[11px] font-medium text-purple-500 mt-0.5">
                                {sub.subject_code || "PRACTICAL LAB"}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-center bg-purple-50/30">
                              {sub.lab_internal !== undefined &&
                              sub.lab_internal !== null ? (
                                <span className="font-black text-purple-700">
                                  {sub.lab_internal}{" "}
                                  <span className="text-[10px] text-purple-400">
                                    /30
                                  </span>
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium italic text-[11px]">
                                  Not published
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-center font-bold">
                              {sub.lab_external !== undefined &&
                              sub.lab_external !== null ? (
                                <span className="text-slate-800">
                                  {sub.lab_external}{" "}
                                  <span className="text-[10px] text-slate-400">
                                    /70
                                  </span>
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium italic text-[11px]">
                                  Not published
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              {sub.final_marks !== undefined &&
                              sub.final_marks !== null ? (
                                <span className="font-black text-slate-900 text-sm">
                                  {sub.final_marks}{" "}
                                  <span className="text-[10px] text-slate-400">
                                    /100
                                  </span>
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium italic text-[11px]">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {getGradeBadge(sub.grade)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  sub.status === "Published"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : sub.status === "Partially Published"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {sub.status === "Published" && (
                                  <Check className="w-3 h-3" />
                                )}
                                {sub.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DETAILED THEORY CARDS */}
          {activeTab === "theory" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {theoryResults.map((sub, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {sub.subject_code || "THEORY"}
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-1">
                        {sub.subject}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        Department: {sub.department}
                      </p>
                    </div>
                    <div>{getGradeBadge(sub.grade)}</div>
                  </div>

                  {/* Components Grid */}
                  <div className="grid grid-cols-2 gap-2.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-150">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase">
                        Mid Examination 1
                      </div>
                      <div className="text-base font-black text-slate-900 mt-0.5">
                        {sub.mid1_marks !== undefined &&
                        sub.mid1_marks !== null ? (
                          <>
                            {sub.mid1_marks}{" "}
                            <span className="text-xs text-slate-400 font-normal">
                              /30
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Marks not yet published
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase">
                        Mid Examination 2
                      </div>
                      <div className="text-base font-black text-slate-900 mt-0.5">
                        {sub.mid2_marks !== undefined &&
                        sub.mid2_marks !== null ? (
                          <>
                            {sub.mid2_marks}{" "}
                            <span className="text-xs text-slate-400 font-normal">
                              /30
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Marks not yet published
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50/80 p-2.5 rounded-lg border border-blue-200 col-span-2">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-extrabold text-blue-700 uppercase">
                          Calculated Internal (80% High + 20% Low)
                        </div>
                        <span className="text-[9px] bg-blue-200/80 text-blue-900 px-1.5 py-0.2 rounded font-black">
                          Max 30
                        </span>
                      </div>
                      <div className="text-lg font-black text-blue-900 mt-0.5">
                        {sub.internal_marks !== undefined &&
                        sub.internal_marks !== null ? (
                          <>
                            {sub.internal_marks}{" "}
                            <span className="text-xs text-blue-500 font-normal">
                              / 30.0
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-blue-500 font-medium">
                            Pending Mid Evaluations
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 col-span-2">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase">
                        Semester University Exam
                      </div>
                      <div className="text-base font-black text-slate-900 mt-0.5">
                        {sub.semester_marks !== undefined &&
                        sub.semester_marks !== null ? (
                          <>
                            {sub.semester_marks}{" "}
                            <span className="text-xs text-slate-400 font-normal">
                              / 70
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Marks not yet published
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Final Calculation Summary */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Final Total (Internal + Semester)
                      </div>
                      <div className="text-lg font-black text-slate-900">
                        {sub.final_marks !== undefined &&
                        sub.final_marks !== null ? (
                          <>
                            {sub.final_marks}{" "}
                            <span className="text-xs text-slate-400 font-normal">
                              / 100
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Results Pending
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          sub.status === "Published"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: DETAILED LAB CARDS */}
          {activeTab === "lab" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {labResults.map((sub, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-purple-300 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                        {sub.subject_code || "PRACTICAL LAB"}
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-1">
                        {sub.subject}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        Department: {sub.department}
                      </p>
                    </div>
                    <div>{getGradeBadge(sub.grade)}</div>
                  </div>

                  {/* Lab Components */}
                  <div className="grid grid-cols-2 gap-2.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-150">
                    <div className="bg-purple-50/80 p-2.5 rounded-lg border border-purple-200">
                      <div className="text-[10px] font-extrabold text-purple-700 uppercase">
                        Lab Internal (Day-to-Day)
                      </div>
                      <div className="text-base font-black text-purple-950 mt-0.5">
                        {sub.lab_internal !== undefined &&
                        sub.lab_internal !== null ? (
                          <>
                            {sub.lab_internal}{" "}
                            <span className="text-xs text-purple-500 font-normal">
                              /30
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Marks not yet published
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase">
                        Lab External (Viva & Practical)
                      </div>
                      <div className="text-base font-black text-slate-900 mt-0.5">
                        {sub.lab_external !== undefined &&
                        sub.lab_external !== null ? (
                          <>
                            {sub.lab_external}{" "}
                            <span className="text-xs text-slate-400 font-normal">
                              /70
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Marks not yet published
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Final Calculation Summary */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Final Practical Marks
                      </div>
                      <div className="text-lg font-black text-slate-900">
                        {sub.final_marks !== undefined &&
                        sub.final_marks !== null ? (
                          <>
                            {sub.final_marks}{" "}
                            <span className="text-xs text-slate-400 font-normal">
                              / 100
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Results Pending
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          sub.status === "Published"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: GRADING SCALE CONFIGURATION */}
          {activeTab === "grade_scale" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Official University Grading System
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standard autonomous college grading boundary configuration
                  applied across Theory and Lab subjects.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-black text-[10px]">
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-4">Marks Range (Out of 100)</th>
                      <th className="py-3 px-4 text-center">
                        Grade Points (GP)
                      </th>
                      <th className="py-3 px-4">
                        Performance Qualitative Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {gradeScale.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-black">
                          {getGradeBadge(item.grade)}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {item.min_marks}% — {item.max_marks}%
                        </td>
                        <td className="py-3 px-4 text-center font-black text-blue-600">
                          {item.grade_points}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-semibold">
                          {item.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Marks;
