import os, sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

import models
from database import engine, SessionLocal, SQLALCHEMY_DATABASE_URL

FACULTY_MASTER_ALL = [
    (1, "Dr. DODLA SRUJAN CHANDRA REDDY", "PhD", "Professor", "01-07-2024"),
    (2, "Dr. GANUGULA VIJAY KUMAR", "PhD", "Professor", "01-03-2021"),
    (3, "Dr. KUNI VENKATA SUBBAIAH", "PhD", "Professor", "05-06-2003"),
    (4, "Dr. NUKAMREDDY SRINAD REDDY", "PhD", "Associate Professor", "02-06-2021"),
    (5, "Dr. BONTHALA VAMSEE MOHAN", "PhD", "Professor", "01-07-2019"),
    (6, "Dr. POLEBOINA VENKATA N RAJESWARI", "PhD", "Associate Professor", "15-06-2016"),
    (7, "Dr. RAMIREDDY KONDAIAH", "PhD", "Professor", "01-07-2022"),
    (8, "Dr. PATHAKAMURI SRINIVASULU", "PhD", "Associate Professor", "26-12-2007"),
    (9, "Mr. SHAIK SHABBIR BASHA", "M.Tech", "Assistant Professor", "22-04-2003"),
    (10, "Mr. PUTTU ESWARAIAH", "M.Tech", "Assistant Professor", "16-06-2006"),
    (11, "Ms. THORAINELLORE MANJULA", "M.Tech", "Assistant Professor", "29-06-2007"),
    (12, "Mr. MENTA VIJAYABHASKAR", "M.Tech", "Assistant Professor", "02-12-2008"),
    (13, "Mrs. SIVADANAM USHA RANI", "M.Tech", "Assistant Professor", "01-11-2011"),
    (14, "Ms. AKSHAYAM PRASMITA", "M.Tech", "Assistant Professor", "05-07-2012"),
    (15, "Ms. KODALI BHARGAVI", "M.Tech", "Assistant Professor", "04-04-2024"),
    (16, "Mr. PERAM KAMALAKAR", "M.Tech", "Assistant Professor", "01-12-2012"),
    (17, "Mr. CHEEDELLA CHANDRA SEKHAR", "M.Tech", "Assistant Professor", "01-03-2013"),
    (18, "Mis. MALISETTY TEJASWINI", "M.Tech", "Assistant Professor", "01-04-2024"),
    (19, "Mrs. GUMMADI TIRUMALA", "M.Tech", "Assistant Professor", "04-07-2016"),
    (20, "Mrs. KANAMATHAREDDY RESHMA REDDY", "M.Tech", "Assistant Professor", "01-07-2021"),
    (21, "Ms. JARUGUMALLI MADHURI", "M.Tech", "Assistant Professor", "07-01-2016"),
    (22, "Mr. GUNUPATI VENKATESWARLU", "M.Tech", "Assistant Professor", "10-06-2016"),
    (23, "Ms. K V SUPRAJA", "M.Tech", "Assistant Professor", "02-05-2025"),
    (24, "Ms. NUNNA SAI SINDHURA", "M.Tech", "Assistant Professor", "02-07-2018"),
    (25, "Ms. KOPILA RAVI CHAND", "M.Tech", "Assistant Professor", "01-09-2020"),
    (26, "Mr. PEDDIREDDY VENKATESWARA REDDY", "M.Tech", "Assistant Professor", "01-09-2021"),
    (27, "Mr. PANDITAAJAYA KUMAR", "M.Tech", "Assistant Professor", "03-06-2021"),
    (28, "Ms. ALANKARAM SHOBITHA LAKSHMI", "M.Tech", "Assistant Professor", "01-09-2021"),
    (29, "Mr. ANGALAKUDURU SRINIVASA RAO", "M.Tech", "Assistant Professor", "01-08-2022"),
    (30, "Mr. THAMMINENI DAYAKAR", "M.Tech", "Assistant Professor", "25-07-2022"),
    (31, "Mr. RAJA BHARGAVA", "M.Tech", "Assistant Professor", "01-04-2022"),
    (32, "Mr. GUDAMSETTY RAJESH", "M.Tech", "Assistant Professor", "01-07-2022"),
    (33, "Mr. CH VENKATESWARLU", "M.Tech", "Assistant Professor", "01-07-2022"),
    (34, "Mr. RONDLA PRAPULLA KUMAR", "M.Tech", "Assistant Professor", "04-09-2023"),
    (35, "Mr. MODEM JEEVAN KUMAR", "M.Tech", "Assistant Professor", "04-09-2023"),
    (36, "Mr. PASUPULETI MOHAN", "M.Tech", "Assistant Professor", "04-09-2023"),
    (37, "Ms. GUNA GAYATHRI PRASEETHA K", "M.Tech", "Assistant Professor", "10-01-2024"),
    (38, "Ms.DARBALA PAVAN KUMAR", "M.Tech", "Assistant Professor", "06-09-2021"),
    (39, "Mr. PERAM MALLIKARJUNA", "M.Tech", "Assistant Professor", "02-08-2021"),
    (40, "Mr. KUNI SAI SUMANTH", "M.Tech", "Assistant Professor", "01-07-2024"),
    (41, "Ms. PONNURU VENKATA SUSHMA", "M.Tech", "Assistant Professor", "08-07-2024"),
    (42, "Mr. CHALLA AKHIL", "M.Tech", "Assistant Professor", "05-08-2024"),
    (43, "Ms. CHEVURI ROJA", "M.Tech", "Assistant Professor", "01-08-2024"),
    (44, "Mr. MUNAGALA VENKATESWARLU", "M.Tech", "Assistant Professor", "02-09-2024"),
    (45, "Mr. MANCHERLAPATI NEERJA", "M.Tech", "Assistant Professor", "01-04-2024"),
    (46, "Mr. METTA SATHYA SAI LAKSHMAN", "M.Tech", "Assistant Professor", "06-05-2024"),
    (47, "Mr. ADUSUMALLI PRASANNA KUMAR", "M.Tech", "Assistant Professor", "06-05-2024"),
    (48, "Mr. KATAMREDDI MAHENDRA", "M.Tech", "Assistant Professor", "01-07-2024"),
    (49, "Ms. KOMMURI SRAVANI", "M.Tech", "Assistant Professor", "09-10-2023"),
    (50, "Mrs. KUPPAM SAMEERA", "M.Tech", "Assistant Professor", "03-06-2024"),
    (51, "Ms. PASUPILETI VIMALASANYHI", "M.Tech", "Assistant Professor", "02-09-2024"),
    (52, "Mr. SINGAMANENI MALLIKARJUNA", "M.Tech", "Assistant Professor", "02-06-2025"),
    (53, "Mrs. NIDAMANURI V SOUNDARYA", "M.Tech", "Assistant Professor", "10-08-2024")
]

INSTITUTION = "Parvathareddy Babul Reddy Visvodaya Institute of Technology & Science (Autonomous)"
DEPARTMENT_NAME = "Computer Science and Engineering"

def update_every_single_faculty():
    db = SessionLocal()
    
    # 1. Fetch timetable entries
    all_entries = db.query(models.TimetableEntry).all()
    
    fac_timetable_map = {}
    for entry in all_entries:
        if not entry.faculty_username:
            continue
        key = entry.faculty_username.strip()
        if key not in fac_timetable_map:
            fac_timetable_map[key] = {
                "departments": set(),
                "subjects": set(),
                "semesters": set()
            }
        if entry.department:
            fac_timetable_map[key]["departments"].add(entry.department)
        if entry.subject:
            fac_timetable_map[key]["subjects"].add(entry.subject)
        if entry.semester:
            fac_timetable_map[key]["semesters"].add(entry.semester)
            
    print(f"[*] Processing all {len(FACULTY_MASTER_ALL)} faculty members individually...")
    
    for num, name, degree, designation, doj in FACULTY_MASTER_ALL:
        f_id = f"FAC{num:03d}"
        
        # Look up timetable
        tt = fac_timetable_map.get(name) or fac_timetable_map.get(f_id) or {}
        assigned_depts = ", ".join(sorted(list(tt.get("departments", [])))) if tt else "Computer Science and Engineering (CSE)"
        assigned_subjs = ", ".join(sorted(list(tt.get("subjects", [])))) if tt else "Core Computer Science & Engineering"
        assigned_sems = ", ".join(sorted(list(tt.get("semesters", [])))) if tt else "1-1, 2-1, 3-1, 4-1"
        
        # Email & Phone
        name_clean = name
        for title in ["Dr. ", "Mr. ", "Ms. ", "Mrs. ", "Mis. ", "Dr.", "Mr.", "Ms.", "Mrs.", "Mis."]:
            if name_clean.startswith(title):
                name_clean = name_clean[len(title):]
                break
        first_token = name_clean.strip().split()[0].lower()
        email = f"{first_token}{num if num > 1 else ''}@pbrvits.ac.in"
        phone = f"+91 98765 432{num:02d}"
        
        # User record
        user = db.query(models.User).filter(
            (models.User.username == name) |
            (models.User.roll_number == f_id) |
            (models.User.name == name)
        ).first()
        
        if not user:
            user = models.User(
                username=name,
                hashed_password="kane mamanotreallyhashed",
                role=models.RoleEnum.faculty,
                name=name,
                email=email,
                department=DEPARTMENT_NAME,
                roll_number=f_id,
                approval_status="Approved"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            user.name = name
            user.department = DEPARTMENT_NAME
            user.roll_number = f_id
            user.approval_status = "Approved"
            db.commit()
            
        # Faculty record
        fac = db.query(models.Faculty).filter(
            (models.Faculty.faculty_id == f_id) |
            (models.Faculty.name == name) |
            (models.Faculty.user_id == user.id)
        ).first()
        
        if not fac:
            fac = models.Faculty(
                user_id=user.id,
                faculty_id=f_id,
                name=name,
                university=INSTITUTION,
                degree=degree,
                designation=designation,
                date_of_joining=doj,
                department=DEPARTMENT_NAME,
                assigned_departments=assigned_depts,
                assigned_subjects=assigned_subjs,
                assigned_semesters=assigned_sems,
                email=email,
                phone=phone,
                status="Active",
                approval_status="Approved"
            )
            db.add(fac)
            db.commit()
        else:
            fac.user_id = user.id
            fac.faculty_id = f_id
            fac.name = name
            fac.university = INSTITUTION
            fac.degree = degree
            fac.designation = designation
            fac.date_of_joining = doj
            fac.department = DEPARTMENT_NAME
            fac.assigned_departments = assigned_depts
            fac.assigned_subjects = assigned_subjs
            fac.assigned_semesters = assigned_sems
            fac.email = email
            fac.phone = phone
            fac.status = "Active"
            fac.approval_status = "Approved"
            db.commit()

    db.close()
    print("[SUCCESS] All 53 faculty members have been explicitly updated!")

def print_all_53_records():
    db = SessionLocal()
    faculties = db.query(models.Faculty).order_by(models.Faculty.id).all()
    print("\n" + "=" * 100)
    print(f"{'No.':<4} | {'Faculty ID':<10} | {'Name':<35} | {'Degree':<7} | {'Designation':<20} | {'DOJ':<10} | {'Dept':<32}")
    print("=" * 100)
    for idx, f in enumerate(faculties, 1):
        print(f"{idx:<4} | {f.faculty_id:<10} | {f.name:<35} | {f.degree:<7} | {f.designation:<20} | {f.date_of_joining:<10} | {f.department:<32}")
    print("=" * 100)
    print(f"Total Rows Verified in Database: {len(faculties)}")
    db.close()

if __name__ == "__main__":
    update_every_single_faculty()
    print_all_53_records()
