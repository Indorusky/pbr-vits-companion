import os, sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Set current dir to backend
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

import models, schemas
from database import engine, SessionLocal, SQLALCHEMY_DATABASE_URL

FACULTY_MASTER = [
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

def run_upsert():
    models.Base.metadata.create_all(bind=engine)
    
    # Run auto-migration for any missing columns
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE faculties ADD COLUMN department VARCHAR(255) DEFAULT 'Computer Science and Engineering'"))
            conn.commit()
            print("[*] Added missing department column to faculties table.")
        except Exception:
            pass # Already exists

    db = SessionLocal()
    
    print(f"[*] Database URL: {SQLALCHEMY_DATABASE_URL}")
    print(f"[*] Table Name: {models.Faculty.__tablename__}")
    
    initial_faculty_count = db.query(models.Faculty).count()
    initial_user_count = db.query(models.User).filter(models.User.role == models.RoleEnum.faculty).count()
    print(f"[*] Initial Faculty Count in DB: {initial_faculty_count}")
    print(f"[*] Initial Faculty Users in DB: {initial_user_count}")
    
    existing_emails = set()
    for u in db.query(models.User).all():
        if u.email:
            existing_emails.add(u.email)
            
    updated_count = 0
    inserted_count = 0
    
    for idx, (name, degree, designation, doj) in enumerate(FACULTY_MASTER):
        f_id = f"FAC{idx+1:03d}"
        
        # Clean token for email
        name_clean = name
        for title in ["Dr. ", "Mr. ", "Ms. ", "Mrs. ", "Mis. ", "Dr.", "Mr.", "Ms.", "Mrs.", "Mis."]:
            if name_clean.startswith(title):
                name_clean = name_clean[len(title):]
                break
        tokens = name_clean.strip().split()
        first_token = tokens[0].lower() if tokens else "faculty"
        
        email = f"{first_token}@gmail.com"
        if email in existing_emails:
            suffix = 2
            while f"{first_token}{suffix}@gmail.com" in existing_emails and f"{first_token}{suffix}@gmail.com" != email:
                suffix += 1
            email = f"{first_token}{suffix}@gmail.com"
        existing_emails.add(email)
        
        # 1. Upsert User record
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
            inserted_count += 1
        else:
            user.name = name
            user.role = models.RoleEnum.faculty
            user.department = DEPARTMENT_NAME
            user.roll_number = f_id
            user.approval_status = "Approved"
            db.commit()
            
        # 2. Upsert Faculty record
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
                assigned_departments=DEPARTMENT_NAME,
                email=email,
                phone=f"98765432{idx+1:02d}",
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
            fac.assigned_departments = DEPARTMENT_NAME
            fac.status = "Active"
            fac.approval_status = "Approved"
            db.commit()
            updated_count += 1

    final_faculty_count = db.query(models.Faculty).count()
    print(f"\n[SUCCESS] Upsert Complete!")
    print(f"[*] Final Faculty Count: {final_faculty_count}")
    
    # Detailed verification
    all_facs = db.query(models.Faculty).order_by(models.Faculty.id).all()
    phd_count = sum(1 for f in all_facs if f.degree == "PhD")
    mtech_count = sum(1 for f in all_facs if f.degree == "M.Tech")
    prof_count = sum(1 for f in all_facs if f.designation == "Professor")
    assoc_count = sum(1 for f in all_facs if f.designation == "Associate Professor")
    asst_count = sum(1 for f in all_facs if f.designation == "Assistant Professor")
    
    print("\n--- DATA INTEGRITY VERIFICATION ---")
    print(f"Total Verified Faculty Records: {len(all_facs)}")
    print(f"PhD Faculty: {phd_count} (Expected: 8)")
    print(f"M.Tech Faculty: {mtech_count} (Expected: 45)")
    print(f"Professors: {prof_count} (Expected: 5)")
    print(f"Associate Professors: {assoc_count} (Expected: 3)")
    print(f"Assistant Professors: {asst_count} (Expected: 45)")
    
    assert len(all_facs) == 53, f"Expected 53 records, got {len(all_facs)}"
    assert phd_count == 8, f"Expected 8 PhD, got {phd_count}"
    assert mtech_count == 45, f"Expected 45 M.Tech, got {mtech_count}"
    assert prof_count == 5, f"Expected 5 Professors, got {prof_count}"
    assert assoc_count == 3, f"Expected 3 Associate Professors, got {assoc_count}"
    assert asst_count == 45, f"Expected 45 Assistant Professors, got {asst_count}"
    
    print("\n[ALL 53 FACULTY RECORDS FULLY VERIFIED IN DATABASE]")
    db.close()

if __name__ == "__main__":
    run_upsert()
