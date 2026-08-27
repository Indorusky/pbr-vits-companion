Build a prototype for "AI-Powered Campus Academic Companion: An Intelligent Learning, Performance Monitoring, and Personalized Academic Assistance System" with the following requirements:

1. User Roles:
   - Student (main user)
   - Faculty (attendance, marks, assignments, materials)
   - Admin (college-wide info management)

2. Student Module:
   - Profile: name, roll number, dept, year, semester, section
   - Academic info: timetable, subjects, attendance, internal marks, assignments, exam schedule, study materials
   - Campus info: announcements, events, workshops, hackathons, placements

3. AI Chatbot:
   - NLP-powered chatbot (Hugging Face + Gemini)
   - Answers academic, campus, and student-specific queries
   - Supports contextual queries like attendance, exams, assignments, study help, placements

4. Personalized Study Plan:
   - Inputs: subjects, marks, weak subjects, exams, deadlines, available time
   - Output: daily/weekly study schedule

5. Notes Summarization:
   - Upload PDFs/text → generate summaries, key points, important questions

6. Attendance Management:
   - Subject-wise attendance display
   - Attendance shortage prediction

7. Academic Performance Analysis:
   - Collect marks + assignments + attendance
   - Show strong/weak subjects, trends (↑ ↓ →)

8. Academic Health Score:
   - Composite score (attendance, marks, assignments, learning progress)
   - Personalized recommendations

9. Smart Recommendations:
   - AI-driven advice for weak subjects, revision, practice questions

10. Smart Reminders:
   - Deadlines, exams, attendance shortage, events, placements

11. Faculty Module:
   - Manage students, attendance, marks, assignments, study materials, announcements

12. Admin Module:
   - Manage students, faculty, departments, subjects, timetable, events, placements

13. Database Schema:
   - Tables: users, students, faculty, departments, subjects, timetable, attendance, marks, assignments, submissions, study_materials, announcements, events, placements, notifications, chat_history, study_plans, recommendations, academic_health

14. AI/ML Components:
   - AI Chatbot (NLP Q&A)
   - AI Study Plan generator
   - ML Attendance prediction
   - ML Performance analysis + recommendations

15. Technology Stack:
   - Frontend: React.js
   - Backend: Python + FastAPI
   - Database: MySQL
   - AI/ML: Python (Hugging Face, Gemini, custom models)
   - Tools: VS Code, GitHub, Postman, MySQL Workbench

16. Prototype Screens:
   - Login, Signup, Student Dashboard, Profile, Timetable, Attendance, Marks, Assignments, Study Materials, Announcements, Events, Placements, AI Chatbot, Study Planner, Note Summarizer, Recommendations, Academic Health Dashboard, Notifications, Faculty Dashboard, Admin Dashboard

Deliverables:
- Modular, scalable prototype
- Chat UI with media upload support
- Role-based access (admin, faculty, student)
- Academic Health Score + personalized recommendations
- Smart reminders and notifications
