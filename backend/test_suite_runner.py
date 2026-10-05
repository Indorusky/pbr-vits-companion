import sys
import os
import json
import math
import sqlite3
import traceback

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
import main
from main import app, get_db
import models, schemas, database

client = TestClient(app)

results = {
    "auth": {},
    "security": {},
    "math_attendance": {},
    "math_health_score": {},
    "student_endpoints": {},
    "faculty_endpoints": {},
    "admin_endpoints": {},
    "ai_endpoints": {},
    "cross_role": {},
    "database": {},
    "edge_cases": {}
}

print("==================================================")
print("STARTING EXHAUSTIVE AUTOMATED QA & SECURITY AUDIT")
print("==================================================")

# -------------------------------------------------------------
# 1. AUTHENTICATION & ROLE TESTING
# -------------------------------------------------------------
print("\n[PHASE 2] Testing Authentication & Signup/Login...")

# Test 1A: Student Signup
payload_student = {
    "username": "qa_student_01",
    "password": "Password123!",
    "role": "student",
    "name": "QA Student One",
    "email": "qa_student_01@pbrvits.ac.in",
    "department": "Computer Science and Engineering (CSE)",
    "year": "3rd Year",
    "semester": "3-1",
    "section": "Section A"
}
resp = client.post("/signup", json=payload_student)
results["auth"]["student_signup"] = {
    "status_code": resp.status_code,
    "response": resp.json() if resp.status_code == 200 else resp.text
}
print(f"Student Signup: Status {resp.status_code}")

# Test 1B: Duplicate Student Signup
resp_dup = client.post("/signup", json=payload_student)
results["auth"]["duplicate_signup"] = {
    "status_code": resp_dup.status_code,
    "response": resp_dup.json() if resp_dup.status_code == 400 else resp_dup.text
}
print(f"Duplicate Signup (Expect 400): Status {resp_dup.status_code}")

# Test 1C: Faculty Signup (Should default to Pending approval)
payload_faculty = {
    "username": "qa_faculty_01",
    "password": "Password123!",
    "role": "faculty",
    "name": "QA Faculty One",
    "email": "qa_faculty_01@pbrvits.ac.in",
    "department": "Computer Science and Engineering (CSE)",
    "year": "Faculty",
    "semester": "3-1",
    "section": "Section A"
}
resp_fac = client.post("/signup", json=payload_faculty)
results["auth"]["faculty_signup"] = {
    "status_code": resp_fac.status_code,
    "response": resp_fac.json() if resp_fac.status_code == 200 else resp_fac.text
}
print(f"Faculty Signup: Status {resp_fac.status_code}")

# Test 1D: Faculty Login before Approval (Should return 403)
resp_fac_login = client.post("/login", json=payload_faculty)
results["auth"]["faculty_login_pending"] = {
    "status_code": resp_fac_login.status_code,
    "response": resp_fac_login.json() if resp_fac_login.status_code in [200, 400, 403] else resp_fac_login.text
}
print(f"Faculty Login before approval (Expect 403): Status {resp_fac_login.status_code}")

# Test 1E: Student Login
resp_stud_login = client.post("/login", json={"username": "qa_student_01", "password": "Password123!", "role": "student"})
results["auth"]["student_login"] = {
    "status_code": resp_stud_login.status_code,
    "response": resp_stud_login.json() if resp_stud_login.status_code == 200 else resp_stud_login.text
}
print(f"Student Login: Status {resp_stud_login.status_code}")

# Test 1F: Wrong Password Login
resp_wrong_pw = client.post("/login", json={"username": "qa_student_01", "password": "WrongPassword!", "role": "student"})
results["auth"]["wrong_password"] = {
    "status_code": resp_wrong_pw.status_code,
    "response": resp_wrong_pw.json() if resp_wrong_pw.status_code == 400 else resp_wrong_pw.text
}
print(f"Wrong Password (Expect 400): Status {resp_wrong_pw.status_code}")

# Test 1G: Nonexistent User Login
resp_nonexistent = client.post("/login", json={"username": "nonexistent_user_999", "password": "Password123!", "role": "student"})
results["auth"]["nonexistent_user"] = {
    "status_code": resp_nonexistent.status_code,
    "response": resp_nonexistent.json() if resp_nonexistent.status_code == 400 else resp_nonexistent.text
}
print(f"Nonexistent User (Expect 400): Status {resp_nonexistent.status_code}")

# -------------------------------------------------------------
# 2. SECURITY & AUTHORIZATION TESTING
# -------------------------------------------------------------
print("\n[PHASE 7] Testing Role-Based Access Control & API Authorization...")

# Test 2A: Unauthenticated access to /admin/pending-faculties
resp_admin_pending = client.get("/admin/pending-faculties")
results["security"]["unauth_admin_pending_faculties"] = {
    "status_code": resp_admin_pending.status_code,
    "response": resp_admin_pending.json() if resp_admin_pending.status_code == 200 else resp_admin_pending.text
}
print(f"Unauthenticated /admin/pending-faculties: Status {resp_admin_pending.status_code} (WARNING if 200)")

# Test 2B: Unauthenticated access to /users
resp_unauth_users = client.get("/users")
results["security"]["unauth_get_users"] = {
    "status_code": resp_unauth_users.status_code,
    "count": len(resp_unauth_users.json()) if resp_unauth_users.status_code == 200 else 0
}
print(f"Unauthenticated /users: Status {resp_unauth_users.status_code} (Exposed {results['security']['unauth_get_users']['count']} users)")

# Test 2C: Delete user without admin credentials
resp_unauth_del = client.delete("/users/qa_student_01")
results["security"]["unauth_delete_user"] = {
    "status_code": resp_unauth_del.status_code,
    "response": resp_unauth_del.json() if resp_unauth_del.status_code == 200 else resp_unauth_del.text
}
print(f"Unauthenticated DELETE /users/qa_student_01: Status {resp_unauth_del.status_code} (WARNING if 200)")

# Re-create student for further tests
client.post("/signup", json=payload_student)

# Test 2D: Update marks with arbitrary requester_username header
resp_marks_spoof = client.put(
    "/marks",
    json={
        "student_id": 1,
        "subject": "Data Structures",
        "semester": "2-1",
        "department": "CSE",
        "assessment_type": "Internal Assessment",
        "marks": 99
    },
    headers={"x-requester-username": "arbitrary_attacker"}
)
results["security"]["marks_header_spoof"] = {
    "status_code": resp_marks_spoof.status_code,
    "response": resp_marks_spoof.json() if resp_marks_spoof.status_code == 200 else resp_marks_spoof.text
}
print(f"Update Marks with spoofed header: Status {resp_marks_spoof.status_code}")

# -------------------------------------------------------------
# 3. MATHEMATICAL CALCULATION AUDIT (Attendance Target)
# -------------------------------------------------------------
print("\n[PHASE 3 & 12] Testing Attendance Target Calculation Math...")

test_scenarios = [
    (0, 10, 75),
    (5, 10, 75),
    (7, 10, 75),
    (8, 10, 75),
    (10, 10, 75),
    (50, 100, 75),
    (65, 100, 75),
    (70, 100, 75),
    (74, 100, 75),
    (75, 100, 75),
    (80, 100, 75),
    (90, 100, 75),
    (100, 100, 75),
    (50, 100, 80),
    (50, 100, 85),
    (50, 100, 90),
    (50, 100, 100), # Edge Case: Target = 100% (division by zero risk)
    (0, 0, 75)      # Edge Case: 0 total classes
]

math_audit_results = []
for attended, total, target in test_scenarios:
    try:
        resp_calc = client.post(
            "/student/predict-attendance",
            json={"attended": attended, "total": total, "target": target}
        )
        if resp_calc.status_code == 200:
            data = resp_calc.json()
            # Calculate theoretical expected:
            if target == 100:
                # If target is 100%, and attended < total, you can NEVER reach 100% if total > attended > 0
                expected_needed = 0 if attended == total else "Infinity / Impossible"
            elif total == 0:
                expected_needed = 0
            else:
                t = target / 100.0
                if (attended / total) >= t:
                    expected_needed = 0
                else:
                    expected_needed = math.ceil((t * total - attended) / (1 - t))
            
            math_audit_results.append({
                "attended": attended,
                "total": total,
                "target": target,
                "api_status": 200,
                "api_needed": data.get("needed_classes"),
                "expected_needed": expected_needed,
                "match": data.get("needed_classes") == expected_needed
            })
        else:
            math_audit_results.append({
                "attended": attended,
                "total": total,
                "target": target,
                "api_status": resp_calc.status_code,
                "error": resp_calc.text
            })
    except Exception as e:
        math_audit_results.append({
            "attended": attended,
            "total": total,
            "target": target,
            "exception": str(e)
        })

results["math_attendance"] = math_audit_results
print(f"Tested {len(test_scenarios)} Attendance Target Scenarios.")
for r in math_audit_results:
    if "api_status" in r and r["api_status"] == 200:
        print(f"  Attended: {r['attended']}/{r['total']}, Target: {r['target']}% -> Needed: {r['api_needed']} (Expected: {r['expected_needed']}) | Match: {r.get('match')}")
    else:
        print(f"  Attended: {r['attended']}/{r['total']}, Target: {r['target']}% -> FAILED / EXCEPTION: {r}")

# -------------------------------------------------------------
# 4. AI & GEMINI INTEGRATION TESTING
# -------------------------------------------------------------
print("\n[PHASE 10] Testing AI / Chat / Note Generation Endpoints...")

# Test 4A: Chatbot endpoint
chat_queries = [
    "What is my attendance status in Physics?",
    "When is the midterm exam schedule?",
    "Explain Dijkstra's Algorithm in Computer Science",
    "",  # Empty prompt
    "a" * 5000 # Very long prompt
]
chat_results = []
for q in chat_queries:
    resp_chat = client.post("/chat", json={"message": q})
    chat_results.append({
        "query": q[:30] + "..." if len(q) > 30 else q,
        "status_code": resp_chat.status_code,
        "response": resp_chat.json() if resp_chat.status_code == 200 else resp_chat.text
    })
results["ai_endpoints"]["chat"] = chat_results
print("Tested /chat queries.")

# Test 4B: Generate Notes endpoint
resp_notes = client.post("/generate-notes", json={"subject": "Operating Systems", "title": "Deadlock Detection & Recovery"})
results["ai_endpoints"]["generate_notes"] = {
    "status_code": resp_notes.status_code,
    "has_detailed_notes": "detailed_notes" in resp_notes.json() if resp_notes.status_code == 200 else False,
    "response_keys": list(resp_notes.json().keys()) if resp_notes.status_code == 200 and isinstance(resp_notes.json(), dict) else resp_notes.text[:200]
}
print(f"/generate-notes status: {resp_notes.status_code}")

# Test 4C: Chat About Notes endpoint
resp_notes_chat = client.post(
    "/chat-about-notes",
    json={
        "subject": "Operating Systems",
        "topic": "Deadlock",
        "notes_context": "Deadlock occurs when four conditions hold: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.",
        "question": "What are the 4 necessary conditions for deadlock?"
    }
)
results["ai_endpoints"]["chat_about_notes"] = {
    "status_code": resp_notes_chat.status_code,
    "response": resp_notes_chat.json() if resp_notes_chat.status_code == 200 else resp_notes_chat.text
}
print(f"/chat-about-notes status: {resp_notes_chat.status_code}")

# -------------------------------------------------------------
# 5. CROSS-ROLE DATA FLOW TESTING
# -------------------------------------------------------------
print("\n[PHASE 6] Testing Cross-Role Data Flow...")

# Admin approves faculty
resp_appr = client.post("/admin/approve-faculty/qa_faculty_01")
print(f"Admin approve faculty: Status {resp_appr.status_code}")

# Faculty logs in
resp_fac_login_ok = client.post("/login", json=payload_faculty)
print(f"Faculty login after approval: Status {resp_fac_login_ok.status_code}")

# Record Daily Attendance by Faculty
# First get qa_student_01 user_id
db = database.SessionLocal()
stud_user = db.query(models.User).filter(models.User.username == "qa_student_01").first()
stud_id = stud_user.id if stud_user else 1

attendance_payload = {
    "records": [
        {
            "student_id": stud_id,
            "semester": "3-1",
            "subject": "Database Management Systems",
            "date": "2026-10-05",
            "period": 1,
            "status": "Present",
            "verification_method": "MANUAL"
        }
    ]
}
resp_att = client.post("/daily-attendance", json=attendance_payload)
print(f"Faculty records attendance: Status {resp_att.status_code}")

# Student checks their attendance
resp_stud_att = client.get(f"/attendance/student/{stud_id}", headers={"x-requester-username": "qa_student_01"})
results["cross_role"]["student_attendance"] = {
    "status_code": resp_stud_att.status_code,
    "data": resp_stud_att.json() if resp_stud_att.status_code == 200 else resp_stud_att.text
}
print(f"Student views recorded attendance: Status {resp_stud_att.status_code}")

# Faculty records marks
resp_mark_put = client.put(
    "/marks",
    json={
        "student_id": stud_id,
        "subject": "Database Management Systems",
        "semester": "3-1",
        "department": "CSE",
        "assessment_type": "Internal Assessment",
        "marks": 28
    },
    headers={"x-requester-username": "qa_faculty_01"}
)
print(f"Faculty puts mark: Status {resp_mark_put.status_code}")

# Student reads marks
resp_stud_marks = client.get(f"/marks?student_id={stud_id}", headers={"x-requester-username": "qa_student_01"})
results["cross_role"]["student_marks"] = {
    "status_code": resp_stud_marks.status_code,
    "data": resp_stud_marks.json() if resp_stud_marks.status_code == 200 else resp_stud_marks.text
}
print(f"Student views updated marks: Status {resp_stud_marks.status_code}")

# -------------------------------------------------------------
# 6. PLACEMENTS CRUD TEST
# -------------------------------------------------------------
print("\n[PHASE 5 & 3] Testing Placements Module Endpoints...")

# Create job posting
job_payload = {
    "role": "Associate Software Engineer",
    "company": "TCS Digital",
    "package": "7.5 LPA",
    "eligibility": "B.Tech CSE/ECE > 7.0 CGPA",
    "min_cgpa": "7.0",
    "deadline": "2026-11-30",
    "job_type": "Full-time",
    "location": "Hyderabad / Bangalore",
    "description": "Software Development role",
    "skills": "Python, React, SQL"
}
resp_job_create = client.post("/placements/jobs", json=job_payload)
print(f"Create Job Posting: Status {resp_job_create.status_code}")
job_id = resp_job_create.json().get("id") if resp_job_create.status_code in [200, 201] else None

# Student applies for job
if job_id:
    app_payload = {
        "job_id": str(job_id),
        "job_role": "Associate Software Engineer",
        "company": "TCS Digital",
        "student_id": stud_id,
        "student_name": "QA Student One",
        "student_roll": "2373A01001",
        "student_email": "qa_student_01@pbrvits.ac.in",
        "student_phone": "9876543210",
        "student_dept": "CSE",
        "student_cgpa": "8.5",
        "resume_file_name": "resume.pdf",
        "cover_note": "Excited for this opportunity."
    }
    resp_app_submit = client.post("/placements/applications", json=app_payload)
    print(f"Student submits job application: Status {resp_app_submit.status_code}")
    
    # List applications
    resp_apps = client.get(f"/placements/applications?student_roll=2373A01001")
    print(f"Get student applications: Status {resp_apps.status_code}, Found: {len(resp_apps.json()) if resp_apps.status_code == 200 else 0}")

# -------------------------------------------------------------
# 8. FACULTY-STUDENT DIRECT CHAT TESTS & SECURITY ISOLATION
# -------------------------------------------------------------
print("\n[PHASE 13] Testing Faculty-Student Direct Chat & Security Isolation...")

# Unauthenticated access checks
resp_unauth_depts = client.get("/faculty-chat/departments")
print(f"Unauthenticated GET /faculty-chat/departments: Status {resp_unauth_depts.status_code} (Expect 401)")

resp_unauth_convs = client.get("/faculty-chat/conversations")
print(f"Unauthenticated GET /faculty-chat/conversations: Status {resp_unauth_convs.status_code} (Expect 401)")

# Login Student A (qa_student_01)
res_stud_login = client.post("/login", json={"username": "qa_student_01", "password": "Password123!", "role": "student"})
stud_token = res_stud_login.json().get("access_token")
stud_headers = {"Authorization": f"Bearer {stud_token}"} if stud_token else {}

# Login Faculty A (Dr. DODLA SRUJAN CHANDRA REDDY)
res_fac_login = client.post("/login", json={"username": "Dr. DODLA SRUJAN CHANDRA REDDY", "password": "kane mama", "role": "faculty"})
fac_token = res_fac_login.json().get("access_token")
fac_headers = {"Authorization": f"Bearer {fac_token}"} if fac_token else {}

# Login Faculty B (Dr. GANUGULA VIJAY KUMAR)
res_fac2_login = client.post("/login", json={"username": "Dr. GANUGULA VIJAY KUMAR", "password": "kane mama", "role": "faculty"})
fac2_token = res_fac2_login.json().get("access_token")
fac2_headers = {"Authorization": f"Bearer {fac2_token}"} if fac2_token else {}

if stud_token and fac_token:
    # 1. Student lists departments
    resp_depts = client.get("/faculty-chat/departments", headers=stud_headers)
    print(f"Student GET /faculty-chat/departments: Status {resp_depts.status_code}, count: {len(resp_depts.json()) if resp_depts.status_code == 200 else 0}")

    # 2. Student lists faculty members
    resp_faclist = client.get("/faculty-chat/faculty", headers=stud_headers)
    fac_items = resp_faclist.json() if resp_faclist.status_code == 200 else []
    print(f"Student GET /faculty-chat/faculty: Status {resp_faclist.status_code}, count: {len(fac_items)}")

    # Target Faculty A User ID
    fac_user = [f for f in fac_items if "DODLA" in f.get("name", "").upper()]
    target_fac_id = fac_user[0]["id"] if fac_user else (fac_items[0]["id"] if fac_items else 2)

    # 3. Student creates / gets conversation with Faculty A
    resp_create_conv = client.post("/faculty-chat/conversations", headers=stud_headers, json={"faculty_id": target_fac_id})
    print(f"Student POST /faculty-chat/conversations: Status {resp_create_conv.status_code}")
    conv_data = resp_create_conv.json() if resp_create_conv.status_code == 200 else {}
    conv_id = conv_data.get("id")

    # Re-call to verify idempotency (no duplicate creation)
    resp_recreate_conv = client.post("/faculty-chat/conversations", headers=stud_headers, json={"faculty_id": target_fac_id})
    print(f"Student duplicate POST conversation returns existing: Status {resp_recreate_conv.status_code}, match ID: {resp_recreate_conv.json().get('id') == conv_id}")

    if conv_id:
        # 4. Empty message validation check
        resp_empty_msg = client.post(f"/faculty-chat/conversations/{conv_id}/messages", headers=stud_headers, json={"message": "   "})
        print(f"Empty message rejected: Status {resp_empty_msg.status_code} (Expect 400)")

        # 5. Student sends valid message
        resp_send_msg = client.post(f"/faculty-chat/conversations/{conv_id}/messages", headers=stud_headers, json={"message": "Hello Professor, I have a doubt regarding Unit 3."})
        print(f"Student sends message: Status {resp_send_msg.status_code}")

        # 6. Student reads messages
        resp_get_msgs = client.get(f"/faculty-chat/conversations/{conv_id}/messages", headers=stud_headers)
        print(f"Student gets messages: Status {resp_get_msgs.status_code}, count: {len(resp_get_msgs.json()) if resp_get_msgs.status_code == 200 else 0}")

        # 7. Faculty A views conversation and replies
        resp_fac_convs = client.get("/faculty-chat/conversations", headers=fac_headers)
        print(f"Faculty A GET /faculty-chat/conversations: Status {resp_fac_convs.status_code}, count: {len(resp_fac_convs.json()) if resp_fac_convs.status_code == 200 else 0}")

        resp_fac_read = client.patch(f"/faculty-chat/conversations/{conv_id}/read", headers=fac_headers)
        print(f"Faculty A marks read: Status {resp_fac_read.status_code}")

        resp_fac_reply = client.post(f"/faculty-chat/conversations/{conv_id}/messages", headers=fac_headers, json={"message": "Sure, feel free to visit my office tomorrow at 10 AM."})
        print(f"Faculty A sends reply: Status {resp_fac_reply.status_code}")

        # 8. SECURITY ISOLATION CHECK: Faculty B (Dr. GANUGULA VIJAY KUMAR) tries to read Faculty A's conversation
        if fac2_headers:
            resp_fac2_attack = client.get(f"/faculty-chat/conversations/{conv_id}/messages", headers=fac2_headers)
            print(f"Faculty B security attack on Faculty A conversation: Status {resp_fac2_attack.status_code} (Expect 403 Forbidden)")

        # 9. SECURITY ISOLATION CHECK: Student B tries to access Student A's conversation
        res_stud2_signup = client.post("/signup", json={
            "username": "student_hacker_b",
            "password": "Password123!",
            "role": "student",
            "name": "Student Hacker B",
            "email": "hacker_b@pbrvits.ac.in",
            "department": "Computer Science and Engineering (CSE)",
            "year": "3rd Year",
            "semester": "3-1"
        })
        res_stud2_login = client.post("/login", json={"username": "student_hacker_b", "password": "Password123!", "role": "student"})
        stud2_token = res_stud2_login.json().get("access_token")
        stud2_headers = {"Authorization": f"Bearer {stud2_token}"} if stud2_token else {}

        if stud2_headers:
            resp_stud2_attack = client.get(f"/faculty-chat/conversations/{conv_id}/messages", headers=stud2_headers)
            print(f"Student B security attack on Student A conversation: Status {resp_stud2_attack.status_code} (Expect 403 Forbidden)")

with open("test_audit_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, default=str)

print("\n==================================================")
print("AUDIT RUN COMPLETE. Results saved to test_audit_results.json")
print("==================================================")
