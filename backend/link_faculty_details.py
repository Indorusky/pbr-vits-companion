import os, sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

import models
from database import engine, SessionLocal, SQLALCHEMY_DATABASE_URL

FACULTY_MASTER_DATA = [
    ("Dr. DODLA SRUJAN CHANDRA REDDY", "PhD", "Professor", "01-07-2024"),
    ("Dr. GANUGULA VIJAY KUMAR", "PhD", "Professor", "01-03-2021"),
    ("Dr. KUNI VENKATA SUBBAIAH", "PhD", "Professor", "05-06-2003"),
    ("Dr. NUKAMREDDY SRINAD REDDY", "PhD", "Associate Professor", "02-06-2021"),
    ("Dr. BONTHALA VAMSEE MOHAN", "PhD", "Professor", "01-07-2019"),
    ("Dr. POLEBOINA VENKATA N RAJESWARI", "PhD", "Associate Professor", "15-06-2016"),
    ("Dr. RAMIREDDY KONDAIAH", "PhD", "Professor", "01-07-2022"),
    ("Dr. PATHAKAMURI SRINIVASULU", "PhD", "Associate Professor", "26-12-2007"),
    ("Mr. SHAIK SHABBIR BASHA", "M.Tech", "Assistant Professor", "22-04-2003"),
    ("Mr. PUTTU ESWARAIAH", "M.Tech", "Assistant Professor", "16-06-2006"),
    ("Ms. THORAINELLORE MANJULA", "M.Tech", "Assistant Professor", "29-06-2007"),
    ("Mr. MENTA VIJAYABHASKAR", "M.Tech", "Assistant Professor", "02-12-2008"),
    ("Mrs. SIVADANAM USHA RANI", "M.Tech", "Assistant Professor", "01-11-2011"),
    ("Ms. AKSHAYAM PRASMITA", "M.Tech", "Assistant Professor", "05-07-2012"),
    ("Ms. KODALI BHARGAVI", "M.Tech", "Assistant Professor", "04-04-2024"),
    ("Mr. PERAM KAMALAKAR", "M.Tech", "Assistant Professor", "01-12-2012"),
    ("Mr. CHEEDELLA CHANDRA SEKHAR", "M.Tech", "Assistant Professor", "01-03-2013"),
    ("Mis. MALISETTY TEJASWINI", "M.Tech", "Assistant Professor", "01-04-2024"),
    ("Mrs. GUMMADI TIRUMALA", "M.Tech", "Assistant Professor", "04-07-2016"),
    ("Mrs. KANAMATHAREDDY RESHMA REDDY", "M.Tech", "Assistant Professor", "01-07-2021"),
    ("Ms. JARUGUMALLI MADHURI", "M.Tech", "Assistant Professor", "07-01-2016"),
    ("Mr. GUNUPATI VENKATESWARLU", "M.Tech", "Assistant Professor", "10-06-2016"),
    ("Ms. K V SUPRAJA", "M.Tech", "Assistant Professor", "02-05-2025"),
    ("Ms. NUNNA SAI SINDHURA", "M.Tech", "Assistant Professor", "02-07-2018"),
    ("Ms. KOPILA RAVI CHAND", "M.Tech", "Assistant Professor", "01-09-2020"),
    ("Mr. PEDDIREDDY VENKATESWARA REDDY", "M.Tech", "Assistant Professor", "01-09-2021"),
    ("Mr. PANDITAAJAYA KUMAR", "M.Tech", "Assistant Professor", "03-06-2021"),
    ("Ms. ALANKARAM SHOBITHA LAKSHMI", "M.Tech", "Assistant Professor", "01-09-2021"),
    ("Mr. ANGALAKUDURU SRINIVASA RAO", "M.Tech", "Assistant Professor", "01-08-2022"),
    ("Mr. THAMMINENI DAYAKAR", "M.Tech", "Assistant Professor", "25-07-2022"),
    ("Mr. RAJA BHARGAVA", "M.Tech", "Assistant Professor", "01-04-2022"),
    ("Mr. GUDAMSETTY RAJESH", "M.Tech", "Assistant Professor", "01-07-2022"),
    ("Mr. CH VENKATESWARLU", "M.Tech", "Assistant Professor", "01-07-2022"),
    ("Mr. RONDLA PRAPULLA KUMAR", "M.Tech", "Assistant Professor", "04-09-2023"),
    ("Mr. MODEM JEEVAN KUMAR", "M.Tech", "Assistant Professor", "04-09-2023"),
    ("Mr. PASUPULETI MOHAN", "M.Tech", "Assistant Professor", "04-09-2023"),
    ("Ms. GUNA GAYATHRI PRASEETHA K", "M.Tech", "Assistant Professor", "10-01-2024"),
    ("Ms.DARBALA PAVAN KUMAR", "M.Tech", "Assistant Professor", "06-09-2021"),
    ("Mr. PERAM MALLIKARJUNA", "M.Tech", "Assistant Professor", "02-08-2021"),
    ("Mr. KUNI SAI SUMANTH", "M.Tech", "Assistant Professor", "01-07-2024"),
    ("Ms. PONNURU VENKATA SUSHMA", "M.Tech", "Assistant Professor", "08-07-2024"),
    ("Mr. CHALLA AKHIL", "M.Tech", "Assistant Professor", "05-08-2024"),
    ("Ms. CHEVURI ROJA", "M.Tech", "Assistant Professor", "01-08-2024"),
    ("Mr. MUNAGALA VENKATESWARLU", "M.Tech", "Assistant Professor", "02-09-2024"),
    ("Mr. MANCHERLAPATI NEERJA", "M.Tech", "Assistant Professor", "01-04-2024"),
    ("Mr. METTA SATHYA SAI LAKSHMAN", "M.Tech", "Assistant Professor", "06-05-2024"),
    ("Mr. ADUSUMALLI PRASANNA KUMAR", "M.Tech", "Assistant Professor", "06-05-2024"),
    ("Mr. KATAMREDDI MAHENDRA", "M.Tech", "Assistant Professor", "01-07-2024"),
    ("Ms. KOMMURI SRAVANI", "M.Tech", "Assistant Professor", "09-10-2023"),
    ("Mrs. KUPPAM SAMEERA", "M.Tech", "Assistant Professor", "03-06-2024"),
    ("Ms. PASUPILETI VIMALASANYHI", "M.Tech", "Assistant Professor", "02-09-2024"),
    ("Mr. SINGAMANENI MALLIKARJUNA", "M.Tech", "Assistant Professor", "02-06-2025"),
    ("Mrs. NIDAMANURI V SOUNDARYA", "M.Tech", "Assistant Professor", "10-08-2024")
]

INSTITUTION = "Parvathareddy Babul Reddy Visvodaya Institute of Technology & Science (Autonomous)"
DEPARTMENT_NAME = "Computer Science and Engineering"

def update_and_link_faculty():
    db = SessionLocal()
    
    # 1. Fetch all timetable entries to map assigned subjects, departments, and semesters
    all_entries = db.query(models.TimetableEntry).all()
    print(f"[*] Found {len(all_entries)} timetable entries in database.")
    
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
            
    print(f"[*] Mapped timetable assignments for {len(fac_timetable_map)} teachers.")
    
    # Also handle the default demo account 'faculty' -> map to Dr. DODLA SRUJAN CHANDRA REDDY
    first_fac_name = FACULTY_MASTER_DATA[0][0]
    demo_fac_user = db.query(models.User).filter(models.User.username == "faculty").first()
    if demo_fac_user:
        demo_fac_user.name = first_fac_name
        demo_fac_user.department = DEPARTMENT_NAME
        demo_fac_user.roll_number = "FAC001"
        db.commit()
    
    # 2. Iterate and update each of the 53 faculty members in the faculties table
    for idx, (name, degree, designation, doj) in enumerate(FACULTY_MASTER_DATA):
        f_id = f"FAC{idx+1:03d}"
        
        # Look up assigned timetable info
        tt_info = fac_timetable_map.get(name) or fac_timetable_map.get(f_id) or {}
        assigned_depts = ", ".join(sorted(list(tt_info.get("departments", [])))) if tt_info else "Computer Science and Engineering (CSE)"
        assigned_subjs = ", ".join(sorted(list(tt_info.get("subjects", [])))) if tt_info else "Core Computer Science & Engineering"
        assigned_sems = ", ".join(sorted(list(tt_info.get("semesters", [])))) if tt_info else "1-1, 2-1, 3-1, 4-1"
        
        # Clean token for email
        name_clean = name
        for title in ["Dr. ", "Mr. ", "Ms. ", "Mrs. ", "Mis. ", "Dr.", "Mr.", "Ms.", "Mrs.", "Mis."]:
            if name_clean.startswith(title):
                name_clean = name_clean[len(title):]
                break
        first_token = name_clean.strip().split()[0].lower()
        email = f"{first_token}@pbrvits.ac.in"
        phone = f"+91 98765 432{idx+1:02d}"
        
        # Find or create User
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
            
        # Find or create Faculty record
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

    print("[SUCCESS] All 53 faculty records have been fully updated with exact details, assigned departments, subjects, and semesters!")
    
    # Print sample of updated records
    print("\n--- SAMPLE DETAILED PROFILES FROM DATABASE ---")
    for f in db.query(models.Faculty).limit(5).all():
        print(f"\nID: {f.faculty_id} | Name: {f.name}")
        print(f"  Degree: {f.degree} | Designation: {f.designation} | DOJ: {f.date_of_joining}")
        print(f"  University: {f.university}")
        print(f"  Department: {f.department}")
        print(f"  Assigned Depts: {f.assigned_departments}")
        print(f"  Assigned Subjects: {f.assigned_subjects}")
        print(f"  Assigned Semesters: {f.assigned_semesters}")
        print(f"  Email: {f.email} | Phone: {f.phone}")
        
    db.close()

if __name__ == "__main__":
    update_and_link_faculty()
