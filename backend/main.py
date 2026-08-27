from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import models, schemas, database
from database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Campus Companion API")

# Configure CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def seed_timetable(db):
    try:
        # Skip re-seeding if faculty users already exist in the database
        if db.query(models.User).filter(models.User.role == models.RoleEnum.faculty).first() is not None:
            print("Database already seeded. Skipping re-seed.")
            return

        # Clear existing timetable entries to allow clean re-seeding under the new department schema
        db.query(models.TimetableEntry).delete()
        db.query(models.Faculty).delete()
        
        # Clear user accounts for faculty to prevent stale logins, except admin
        db.query(models.User).filter(models.User.role == models.RoleEnum.faculty).delete()
        db.commit()
            
        print("Seeding 53 official faculty members...")
        
        faculty_master_data = [
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
        
        existing_emails = set()
        faculty_pool = []
        for idx, (name, degree, designation, doj) in enumerate(faculty_master_data):
            f_id = f"FAC{idx+1:03d}"
            
            # Generate email removing titles and suffixing duplicates
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
                while f"{first_token}{suffix}@gmail.com" in existing_emails:
                    suffix += 1
                email = f"{first_token}{suffix}@gmail.com"
            existing_emails.add(email)
            
            # Username is COMPLETE NAME
            username = name
            
            # Create User login credentials
            new_user = models.User(
                username=username,
                hashed_password="kane mamanotreallyhashed",
                role=models.RoleEnum.faculty,
                name=name,
                email=email,
                department="Engineering",
                roll_number=f_id
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            # Create Faculty Profile
            new_fac = models.Faculty(
                user_id=new_user.id,
                faculty_id=f_id,
                name=name,
                university="Not Provided",
                degree=degree,
                designation=designation,
                date_of_joining=doj,
                email=email,
                phone=f"98765432{idx+1:02d}",
                status="Active"
            )
            db.add(new_fac)
            faculty_pool.append(username)
            
        db.commit()
        
        # Helper to determine type
        def get_type(name):
            name_lower = name.lower()
            if "lab" in name_lower or "workshop" in name_lower:
                return "Laboratory"
            elif "project" in name_lower:
                return "Project"
            elif "seminar" in name_lower:
                return "Seminar"
            else:
                return "Lecture"
                
        # Default rooms
        def get_room(name, dept_code):
            name_lower = name.lower()
            if "lab" in name_lower or "workshop" in name_lower:
                return f"{dept_code} Lab 2"
            elif "graphics" in name_lower:
                return "Drawing Hall"
            elif "project" in name_lower or "seminar" in name_lower:
                return f"{dept_code} Project Room"
            else:
                return f"{dept_code} LH-101"

        # 6 Departments
        departments = [
            ("CSE", "Computer Science and Engineering (CSE)"),
            ("AI", "CSE AI"),
            ("AIML", "CSE AIML"),
            ("ECE", "Electronics and Communication Engineering (ECE)"),
            ("EEE", "Electrical and Electronics Engineering (EEE)"),
            ("CIVIL", "Civil Engineering")
        ]
        
        semesters = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"]
        
        # Subjects Map
        subjects_map = {
            "CSE": {
                "1-1": ['Mathematics-I', 'Engineering Physics', 'Programming in C', 'English', 'C Programming Lab'],
                "1-2": ['Mathematics-II', 'Data Structures', 'Basic Electrical', 'Python Programming', 'Data Structures Lab'],
                "2-1": ['Discrete Mathematics', 'DBMS', 'Operating Systems', 'OOP using Java', 'DBMS Lab'],
                "2-2": ['Design & Analysis of Algorithms', 'Computer Networks', 'Software Engineering', 'Automata Theory', 'Algorithms Lab'],
                "3-1": ['Compiler Design', 'Web Technologies', 'Artificial Intelligence', 'Cyber Security', 'Web Lab'],
                "3-2": ['Cloud Computing', 'Distributed Systems', 'Data Warehousing', 'Professional Elective-I', 'Cloud Lab'],
                "4-1": ['Cryptography', 'Big Data Analytics', 'DevOps', 'Project Phase-I', 'Big Data Lab'],
                "4-2": ['Management Science', 'Professional Elective-II', 'Major Project Phase-II', 'Seminar']
            },
            "AI": {
                "1-1": ['Mathematics-I', 'Engineering Chemistry', 'Programming in C', 'Communicative English', 'C Programming Lab'],
                "1-2": ['Mathematics-II', 'Data Structures', 'Python Programming', 'Basic Electronics', 'Python Lab'],
                "2-1": ['Discrete Mathematics', 'Intro to AI', 'DBMS', 'Knowledge Representation', 'AI Programming Lab'],
                "2-2": ['Machine Learning', 'Probability & Statistics', 'Operating Systems', 'Intelligent Systems', 'ML Lab'],
                "3-1": ['Deep Learning', 'Computer Vision', 'NLP', 'Data Mining', 'Deep Learning Lab'],
                "3-2": ['Reinforcement Learning', 'AI Ethics', 'Pattern Recognition', 'Neural Networks', 'RL Lab'],
                "4-1": ['Generative AI', 'Expert Systems', 'AI in Robotics', 'Project Phase-I', 'GenAI Lab'],
                "4-2": ['Advanced AI Elective', 'AI in Healthcare', 'Major Project Phase-II', 'Seminar']
            },
            "AIML": {
                "1-1": ['Mathematics-I', 'Applied Physics', 'Programming in C', 'English', 'C Programming Lab'],
                "1-2": ['Mathematics-II', 'Python Programming', 'Data Structures', 'Basic Electronics', 'Python Lab'],
                "2-1": ['Discrete Mathematics', 'Intro to ML', 'DBMS', 'Computer Organization', 'ML Lab'],
                "2-2": ['Deep Learning', 'Statistical Learning', 'Operating Systems', 'Algorithms', 'Deep Learning Lab'],
                "3-1": ['NLP', 'Computer Vision', 'Reinforcement Learning', 'Data Warehouse', 'NLP Lab'],
                "3-2": ['MLOps', 'Big Data Analytics', 'Generative AI', 'Optimization Techniques', 'MLOps Lab'],
                "4-1": ['Advanced ML', 'Predictive Modeling', 'AI in Finance', 'Project Phase-I', 'Project Lab'],
                "4-2": ['Business Intelligence', 'Ethics in AI/ML', 'Major Project Phase-II', 'Seminar']
            },
            "ECE": {
                "1-1": ['Mathematics-I', 'Engineering Physics', 'Programming in C', 'Engineering Graphics', 'C Programming Lab'],
                "1-2": ['Mathematics-II', 'Network Analysis', 'Electronic Devices', 'Data Structures', 'Devices Lab'],
                "2-1": ['Signals & Systems', 'Digital Electronics', 'Analog Circuits', 'Random Variables', 'Analog Lab'],
                "2-2": ['Control Systems', 'Electromagnetic Waves', 'Analog Communications', 'Microprocessors', 'Microprocessor Lab'],
                "3-1": ['Digital Communications', 'VLSI Design', 'DSP', 'Antennas & Propagation', 'VLSI Lab'],
                "3-2": ['Embedded Systems', 'Computer Networks', 'Information Theory', 'DSP Lab', 'Embedded Lab'],
                "4-1": ['Microwave Engineering', 'Optical Communications', 'Satellite Communication', 'Project Phase-I', 'Microwave Lab'],
                "4-2": ['Wireless Networks', 'Radar Systems', 'Major Project Phase-II', 'Seminar']
            },
            "EEE": {
                "1-1": ['Mathematics-I', 'Engineering Chemistry', 'Programming in C', 'Engineering Graphics', 'C Programming Lab'],
                "1-2": ['Mathematics-II', 'Basic Electrical Engineering', 'Network Analysis', 'Data Structures', 'BEE Lab'],
                "2-1": ['Electrical Circuit Analysis', 'DC Machines & Transformers', 'Electromagnetic Fields', 'Electronic Circuits', 'Machines Lab'],
                "2-2": ['AC Machines', 'Control Systems', 'Power Systems-I', 'Digital Electronics', 'Control Lab'],
                "3-1": ['Power Electronics', 'Power Systems-II', 'Electrical Measurements', 'Microprocessors', 'Power Electronics Lab'],
                "3-2": ['Power System Analysis', 'DSP', 'Renewable Energy Systems', 'Drives & Control', 'DSP Lab'],
                "4-1": ['Switchgear & Protection', 'White Coal Processing', 'Smart Grid', 'Project Phase-I', 'Power Systems Lab'],
                "4-2": ['High Voltage Engineering', 'Industrial Automation', 'Major Project Phase-II', 'Seminar']
            },
            "CIVIL": {
                "1-1": ['Mathematics-I', 'Engineering Physics', 'Engineering Mechanics', 'English', 'Engineering Drawing'],
                "1-2": ['Mathematics-II', 'Engineering Chemistry', 'Strength of Materials-I', 'Programming in C', 'C Programming Lab'],
                "2-1": ['Fluid Mechanics-I', 'Surveying-I', 'Strength of Materials-II', 'Building Materials', 'Surveying Lab'],
                "2-2": ['Fluid Mechanics-II', 'Surveying-II', 'Structural Analysis-I', 'Geotechnical Engineering-I', 'Geotech Lab'],
                "3-1": ['Structural Analysis-II', 'Geotechnical Engineering-II', 'Environmental Engineering-I', 'Transportation Engineering-I', 'Environmental Lab'],
                "3-2": ['RCC Design', 'Environmental Engineering-II', 'Transportation Engineering-II', 'Water Resources', 'RCC Lab'],
                "4-1": ['Steel Structures Design', 'Estimation & Costing', 'Construction Management', 'Project Phase-I', 'CAD Lab'],
                "4-2": ['Bridge Engineering', 'Prestressed Concrete', 'Major Project Phase-II', 'Seminar']
            }
        }

        timings = [
            ("9:00 AM", "10:30 AM"),
            ("10:45 AM", "12:15 PM"),
            ("1:00 PM", "2:30 PM"),
            ("2:45 PM", "4:15 PM")
        ]
        
        weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        
        # Schedule algorithm: loop weekday -> period -> assign department-semester slots without faculty duplicate
        for day in weekdays:
            for period_idx, (start_t, end_t) in enumerate(timings):
                period_num = period_idx + 1
                busy_faculty = set()
                
                # Assign slot for each of the 48 combinations
                for dept_code, dept_name in departments:
                    for sem in semesters:
                        # Get subject list for this sem/dept
                        subjects = subjects_map[dept_code][sem]
                        
                        # Choose subject based on rotation to keep it deterministic but varied
                        subj_index = (weekdays.index(day) + period_idx) % len(subjects)
                        subject_name = subjects[subj_index]
                        
                        # Assign faculty member who is free
                        assigned_fac = None
                        start_search = (departments.index((dept_code, dept_name)) * len(semesters) + semesters.index(sem) + weekdays.index(day) * 4 + period_idx) % len(faculty_pool)
                        
                        for offset in range(len(faculty_pool)):
                            fac_idx = (start_search + offset) % len(faculty_pool)
                            fac_uname = faculty_pool[fac_idx]
                            if fac_uname not in busy_faculty:
                                assigned_fac = fac_uname
                                busy_faculty.add(fac_uname)
                                break
                                
                        if not assigned_fac:
                            assigned_fac = faculty_pool[0]
                            
                        # Create entry
                        entry = models.TimetableEntry(
                            department=dept_name,
                            semester=sem,
                            day=day,
                            period=period_num,
                            subject=subject_name,
                            subject_type=get_type(subject_name),
                            faculty_username=assigned_fac,
                            room=get_room(subject_name, dept_code),
                            start_time=start_t,
                            end_time=end_t
                        )
                        db.add(entry)
                        
        db.commit()
        
        # Update each faculty's assigned departments, subjects, and semesters from their scheduled classes
        all_faculties = db.query(models.Faculty).all()
        for f in all_faculties:
            username = f.faculty_id.lower()
            classes = db.query(models.TimetableEntry).filter(models.TimetableEntry.faculty_username == username).all()
            
            depts = sorted(list(set(c.department for c in classes)))
            subjs = sorted(list(set(c.subject for c in classes)))
            sems = sorted(list(set(c.semester for c in classes)))
            
            f.assigned_departments = ", ".join(depts)
            f.assigned_subjects = ", ".join(subjs)
            f.assigned_semesters = ", ".join(sems)
            
            # Sync back to the User model as well
            db_user = db.query(models.User).filter(models.User.id == f.user_id).first()
            if db_user:
                db_user.department = ", ".join(depts)
                db_user.subjects = ", ".join(subjs)
                db_user.semester = ", ".join(sems)
                
        db.commit()
        print("Timetable and Faculty seeding finished successfully.")
    except Exception as e:
        print("Error seeding timetable:", e)

# Auto-seed the database if no users exist
def seed_data():
    db = database.SessionLocal()
    try:
        user_count = db.query(models.User).count()
        if user_count <= 1: # only admin or none
            print("Seeding database with default accounts...")
            
            # Clear to prevent key constraint violations
            db.query(models.User).delete()
            db.commit()
            
            # Default Admin
            admin_user = models.User(
                username="admin",
                hashed_password="adminnotreallyhashed",
                role=models.RoleEnum.admin,
                name="Admin",
                email="admin@gmail.com"
            )
            
            db.add(admin_user)
            db.commit()
            print("Seeding finished successfully.")
        
        seed_timetable(db)
    except Exception as e:
        print("Error seeding database:", e)
    finally:
        db.close()

seed_data()

class AttendancePredictReq(BaseModel):
    attended: int
    total: int
    target: float = 75.0

def generate_roll_number(db: Session, department: str, year_str: str) -> str:
    import datetime
    current_year = datetime.datetime.now().year
    year_suffix = str(current_year)[-2:]
    
    if year_str:
        y_lower = year_str.lower()
        if "1st" in y_lower or "first" in y_lower:
            year_suffix = "25"  # Assuming current academic year reference matches 2025/2026
        elif "2nd" in y_lower or "second" in y_lower:
            year_suffix = "24"
        elif "3rd" in y_lower or "third" in y_lower:
            year_suffix = "23"
        elif "4th" in y_lower or "fourth" in y_lower:
            year_suffix = "22"
        else:
            import re
            match = re.search(r'\b(20)?(\d{2})\b', year_str)
            if match:
                year_suffix = match.group(2)

    college_code = "73"
    
    # Department codes mapping
    dep_norm = (department or "").lower().strip()
    course_code = "A0"
    branch_code = "1"
    
    if "aiml" in dep_norm:
        course_code, branch_code = "A0", "3"
    elif "ai" in dep_norm:
        course_code, branch_code = "A0", "2"
    elif "computer science" in dep_norm or "cse" in dep_norm:
        course_code, branch_code = "A0", "1"
    elif "electrical" in dep_norm or "eee" in dep_norm:
        course_code, branch_code = "C0", "5"
    elif "electronics" in dep_norm or "ece" in dep_norm:
        course_code, branch_code = "B0", "4"
    elif "civil" in dep_norm:
        course_code, branch_code = "D0", "6"
    elif "mechanical" in dep_norm:
        course_code, branch_code = "E0", "7"

    prefix = f"{year_suffix}{college_code}{course_code}{branch_code}"

    # Query existing student roll numbers that start with this prefix
    existing_rolls = db.query(models.User.roll_number).filter(
        models.User.roll_number.like(f"{prefix}%")
    ).all()
    
    existing_serials = []
    for (r,) in existing_rolls:
        if r and len(r) > len(prefix):
            serial_part = r[len(prefix):]
            if serial_part.isdigit():
                existing_serials.append(int(serial_part))
                
    next_serial = 1
    if existing_serials:
        next_serial = max(existing_serials) + 1
        
    serial_str = f"{next_serial:03d}"
    return f"{prefix}{serial_str}"

@app.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    roll_number = user.roll_number
    if user.role == models.RoleEnum.student:
        if not roll_number:
            roll_number = generate_roll_number(db, user.department or "Computer Science", user.year or "1st Year")
        else:
            existing_roll = db.query(models.User).filter(models.User.roll_number == roll_number).first()
            if existing_roll:
                raise HTTPException(status_code=400, detail="Roll Number already in use")
    else:
        # Check non-student roll_number uniqueness
        if roll_number:
            existing_roll = db.query(models.User).filter(models.User.roll_number == roll_number).first()
            if existing_roll:
                raise HTTPException(status_code=400, detail="Roll Number/ID already in use")

    hashed_pw = user.password + "notreallyhashed"
    
    new_user = models.User(
        username=user.username,
        hashed_password=hashed_pw,
        role=user.role,
        name=user.name,
        email=user.email,
        roll_number=roll_number,
        department=user.department,
        year=user.year,
        semester=user.semester,
        section=user.section,
        subjects=user.subjects,
        profile_photo=user.profile_photo
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    if user.role == models.RoleEnum.student:
        student_rec = models.Student(
            user_id=new_user.id,
            name=user.name or user.username,
            roll_number=new_user.roll_number,
            department=user.department or "Computer Science and Engineering (CSE)",
            year=user.year or "1st Year",
            semester=user.semester or "1-1",
            section=user.section or "Section A",
            profile_photo=user.profile_photo
        )
        db.add(student_rec)
        db.commit()
        
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or db_user.hashed_password != user.password + "notreallyhashed":
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    # Return user details in token response so frontend gets all profile info
    user_resp = schemas.UserResponse.from_orm(db_user)
    return {
        "access_token": db_user.username,
        "token_type": "bearer",
        "user": user_resp
    }

@app.get("/users", response_model=List[schemas.UserResponse])
def get_users(role: Optional[str] = None, search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.User)
    
    if role:
        query = query.filter(models.User.role == role)
        
    users_list = query.all()
    
    if search:
        search_lower = search.lower()
        users_list = [
            u for u in users_list
            if (u.name and search_lower in u.name.lower()) or 
               (u.username and search_lower in u.username.lower()) or 
               (u.roll_number and search_lower in u.roll_number.lower())
        ]
        
    return users_list

@app.post("/users", response_model=schemas.UserResponse)
def provision_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return signup(user, db)

@app.delete("/users/{username}")
def delete_user(username: str, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if db_user.username == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete root admin account")
        
    # Also delete Student record if student
    if db_user.role == models.RoleEnum.student:
        db_student = db.query(models.Student).filter(models.Student.user_id == db_user.id).first()
        if db_student:
            db.delete(db_student)
            
    db.delete(db_user)
    db.commit()
    return {"message": f"User {username} deleted successfully"}

@app.put("/users/{username}", response_model=schemas.UserResponse)
def update_user(username: str, profile_data: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Update fields
    if profile_data.name is not None:
        db_user.name = profile_data.name
    if profile_data.email is not None:
        db_user.email = profile_data.email
    if profile_data.roll_number is not None:
        # Check uniqueness of new roll number
        if profile_data.roll_number != db_user.roll_number:
            existing = db.query(models.User).filter(models.User.roll_number == profile_data.roll_number).first()
            if existing:
                raise HTTPException(status_code=400, detail="Roll Number already in use")
        db_user.roll_number = profile_data.roll_number
    if profile_data.department is not None:
        db_user.department = profile_data.department
    if profile_data.year is not None:
        db_user.year = profile_data.year
    if profile_data.semester is not None:
        db_user.semester = profile_data.semester
    if profile_data.section is not None:
        db_user.section = profile_data.section
    if profile_data.subjects is not None:
        db_user.subjects = profile_data.subjects
    if profile_data.password is not None:
        db_user.hashed_password = profile_data.password + "notreallyhashed"
        
    db.commit()
    db.refresh(db_user)
    
    # Sync to Student table if applicable
    if db_user.role == models.RoleEnum.student:
        db_student = db.query(models.Student).filter(models.Student.user_id == db_user.id).first()
        if db_student:
            if profile_data.name is not None:
                db_student.name = profile_data.name
            if profile_data.roll_number is not None:
                db_student.roll_number = profile_data.roll_number
            if profile_data.department is not None:
                db_student.department = profile_data.department
            if profile_data.year is not None:
                db_student.year = profile_data.year
            if profile_data.semester is not None:
                db_student.semester = profile_data.semester
            if profile_data.section is not None:
                db_student.section = profile_data.section
            db.commit()
            
    return db_user

@app.get("/students")
def get_students(faculty_username: Optional[str] = None, db: Session = Depends(get_db)):
    students_query = db.query(models.User).filter(models.User.role == models.RoleEnum.student)
    if faculty_username:
        # Get combinations of department and semester taught by this faculty member
        timetable_entries = db.query(models.TimetableEntry).filter(
            models.TimetableEntry.faculty_username == faculty_username
        ).all()
        taught_combos = {(entry.department, entry.semester) for entry in timetable_entries}
        all_students = students_query.all()
        matched_students = [s for s in all_students if (s.department, s.semester) in taught_combos]
    else:
        matched_students = students_query.all()
        
    res = []
    for s in matched_students:
        records = db.query(models.AttendanceRecord).filter(models.AttendanceRecord.student_id == s.id).all()
        total_att = len(records)
        present_att = len([r for r in records if r.status == "Present"])
        att_pct = round((present_att / total_att) * 100, 1) if total_att > 0 else 75.0
        
        ensure_student_marks(db, s)
        marks_records = db.query(models.Mark).filter(models.Mark.student_id == s.id).all()
        
        subject_sums = {}
        for m in marks_records:
            if m.subject not in subject_sums:
                subject_sums[m.subject] = 0
            subject_sums[m.subject] += m.marks
            
        marks_avg = 75
        if subject_sums:
            marks_avg = round(sum(subject_sums.values()) / len(subject_sums))
            
        res.append({
            "id": s.id,
            "username": s.username,
            "name": s.name,
            "email": s.email,
            "role": s.role,
            "department": s.department,
            "year": s.year,
            "semester": s.semester,
            "roll_number": s.roll_number,
            "attendance": att_pct,
            "marks": marks_avg,
            "profile_photo": s.profile_photo
        })
    return res

@app.get("/student/dashboard")
def get_student_dashboard():
    return {
        "attendance": 85.5,
        "health_score": 88,
        "ai_insight": "Your performance in CS is excellent. Focus on Physics to boost your overall health score!",
        "marks": {
            "Math": 90,
            "Physics": 85,
            "CS": 95
        },
        "recent_announcements": [
            "Hackathon next week!",
            "Midterm schedules are out."
        ]
    }

@app.post("/student/predict-attendance")
def predict_attendance(req: AttendancePredictReq):
    current_pct = (req.attended / req.total) * 100 if req.total > 0 else 0
    target_ratio = req.target / 100.0
    needed = 0
    if req.total > 0 and (req.attended / req.total) < target_ratio:
        import math
        needed = math.ceil((target_ratio * req.total - req.attended) / (1 - target_ratio))
    
    return {
        "current_percentage": round(current_pct, 1),
        "target_percentage": req.target,
        "needed_classes": max(0, needed)
    }

@app.post("/chat", response_model=schemas.ChatResponse)
def chat_bot(request: schemas.ChatRequest):
    user_msg = request.message.lower()
    if "attendance" in user_msg or "shortage" in user_msg:
        response = "Your current overall attendance is 81.5%. Math (88%), CS (92%), and Physics (69.5%). You need to attend 3 more classes in Physics to stay above 75%."
    elif "exam" in user_msg or "midterm" in user_msg or "schedule" in user_msg:
        response = "Midterm exams schedule: Math on Oct 15, Physics on Oct 18, and Computer Science on Oct 22."
    elif "physics" in user_msg:
        response = "For Physics, focus on Quantum Mechanics & Wave Optics. Your current internal mark is 85%."
    elif "cs" in user_msg or "math" in user_msg:
        response = "Your CS performance is outstanding at 95%. Math internal score is 90%."
    else:
        response = f"I am your AI Campus Companion. I analyzed your query: '{request.message}'. How else can I assist with your courses, study schedule, or attendance?"
    
    return {"response": response}

class NotesRequest(BaseModel):
    subject: str
    title: str

class ChatAboutNotesRequest(BaseModel):
    subject: str
    topic: str
    notes_context: str
    question: str

@app.post("/generate-notes")
def generate_notes(req: NotesRequest):
    import os
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        try:
            import urllib.request
            import json
            
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            headers = {"Content-Type": "application/json"}
            prompt = (
                f"You are an expert university professor. Generate highly detailed, comprehensive study notes "
                f"for the college course subject: '{req.subject}' with topic: '{req.title}'.\n\n"
                f"Provide your response in JSON format matching this exact schema:\n"
                f"1. 'detailed_notes': A very detailed, long-form study guide in Markdown including key theories, equations (using standard MathJax or LaTeX syntax), explanations, and practice questions.\n"
                f"2. 'flashcards': An array of 5 objects, each with a 'front' field (a core term or question) and a 'back' field (its explanation or answer).\n"
                f"3. 'quiz': An array of 5 multiple-choice questions. Each object has 'question' (string), 'options' (array of 4 strings), 'correct_answer_index' (integer 0-3), and 'explanation' (string).\n"
                f"4. 'interactive_element': An object with 'title' (string), 'type' (either 'code' or 'formula'), 'code_or_formula' (the code snippet or formula string), 'explanation' (string), and 'simulated_output' (string representing simulated program output or parameter explanations)."
            )
            
            # Use JSON schema response enforcement
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "responseSchema": {
                        "type": "OBJECT",
                        "properties": {
                          "detailed_notes": {"type": "STRING"},
                          "flashcards": {
                            "type": "ARRAY",
                            "items": {
                              "type": "OBJECT",
                              "properties": {
                                "front": {"type": "STRING"},
                                "back": {"type": "STRING"}
                              },
                              "required": ["front", "back"]
                            }
                          },
                          "quiz": {
                            "type": "ARRAY",
                            "items": {
                              "type": "OBJECT",
                              "properties": {
                                "question": {"type": "STRING"},
                                "options": {
                                  "type": "ARRAY",
                                  "items": {"type": "STRING"}
                                },
                                "correct_answer_index": {"type": "INTEGER"},
                                "explanation": {"type": "STRING"}
                              },
                              "required": ["question", "options", "correct_answer_index", "explanation"]
                            }
                          },
                          "interactive_element": {
                            "type": "OBJECT",
                            "properties": {
                              "title": {"type": "STRING"},
                              "type": {"type": "STRING"},
                              "code_or_formula": {"type": "STRING"},
                              "explanation": {"type": "STRING"},
                              "simulated_output": {"type": "STRING"}
                            },
                            "required": ["title", "type", "code_or_formula", "explanation", "simulated_output"]
                          }
                        },
                        "required": ["detailed_notes", "flashcards", "quiz", "interactive_element"]
                    }
                }
            }
            req_data = json.dumps(payload).encode("utf-8")
            api_req = urllib.request.Request(url, data=req_data, headers=headers, method="POST")
            with urllib.request.urlopen(api_req, timeout=15) as response:
                resp_json = json.loads(response.read().decode("utf-8"))
                notes_json_str = resp_json["candidates"][0]["content"]["parts"][0]["text"]
                notes_data = json.loads(notes_json_str)
                return notes_data
        except Exception as e:
            print("Failed to contact Gemini API directly or parse structured notes:", e)

    # Gracious local fallback with structured layout
    subject_lower = req.subject.lower()
    
    # Detailed Notes fallback
    detailed = f"# Detailed Study Lecture Notes: {req.subject}\n"
    detailed += f"## Topic: {req.title}\n\n"
    
    if "machine learning" in subject_lower or "artificial intelligence" in subject_lower:
        detailed += (
            "### 1. Theoretical Foundations\n"
            "Machine Learning (ML) focuses on algorithms that build mathematical models from sample data in order to make predictions or decisions without being explicitly programmed.\n\n"
            "#### Supervised vs Unsupervised Learning\n"
            "*   **Supervised Learning:** Training data includes labels. Formula: $y = f(x) + \\epsilon$\n"
            "*   **Unsupervised Learning:** Data points are unlabeled. Focuses on structure discovery (e.g. Clustering, PCA).\n\n"
            "### 2. Loss Functions & Optimization\n"
            "To train models, we define a loss function $L(\\theta)$ and minimize it using Gradient Descent:\n"
            "$$\\theta_{t+1} = \\theta_t - \\eta \\nabla L(\\theta_t)$$\n"
            "Where $\\eta$ is the learning rate.\n"
        )
        flashcards = [
            {"front": "Supervised Learning", "back": "A type of machine learning where the model is trained on labeled data (inputs paired with their corresponding correct outputs)."},
            {"front": "Gradient Descent", "back": "An optimization algorithm used to minimize a loss function by iteratively moving in the direction of steepest descent."},
            {"front": "Overfitting", "back": "A modeling error that occurs when a machine learning function fits the training data too closely, failing to generalize to new data."},
            {"front": "Loss Function", "back": "A method of evaluating how well a specific algorithm models the given data, representing the error between predicted and actual values."},
            {"front": "Feature Engineering", "back": "The process of using domain knowledge to select, modify, or create input variables to improve machine learning model performance."}
        ]
        quiz = [
            {
                "question": "What is the primary difference between Supervised and Unsupervised learning?",
                "options": [
                    "Supervised learning uses labeled training data, while Unsupervised learning does not.",
                    "Supervised learning is faster to train.",
                    "Unsupervised learning requires humans to label all inputs.",
                    "There is no difference between them."
                ],
                "correct_answer_index": 0,
                "explanation": "Supervised learning relies on training samples that have target outputs (labels), whereas unsupervised learning analyzes unlabeled data to find hidden patterns."
            },
            {
                "question": "In gradient descent, what does the learning rate control?",
                "options": [
                    "The number of features to select.",
                    "The step size taken towards the minimum of the loss function in each iteration.",
                    "The depth of the decision tree.",
                    "The accuracy of the database queries."
                ],
                "correct_answer_index": 1,
                "explanation": "The learning rate (step size) determines how far gradient descent adjusts parameter values during each optimization step."
            },
            {
                "question": "Which of the following is a classic sign of model overfitting?",
                "options": [
                    "High training error and high test error.",
                    "Low training error and high test error.",
                    "High training error and low test error.",
                    "Low training error and low test error."
                ],
                "correct_answer_index": 1,
                "explanation": "Overfitting occurs when a model performs exceptionally well on the training data but fails to generalize well to unseen test data."
            },
            {
                "question": "What does PCA stand for in unsupervised learning?",
                "options": [
                    "Principal Component Analysis",
                    "Predictive Computer Algorithm",
                    "Primary Component Assembly",
                    "Pattern Classification Assistant"
                ],
                "correct_answer_index": 0,
                "explanation": "Principal Component Analysis (PCA) is a popular unsupervised technique used for dimensionality reduction."
            },
            {
                "question": "What loss function is commonly minimized in linear regression?",
                "options": [
                    "Cross-Entropy Loss",
                    "Mean Squared Error (MSE)",
                    "Hinge Loss",
                    "Kullback-Leibler Divergence"
                ],
                "correct_answer_index": 1,
                "explanation": "Mean Squared Error (MSE) is the standard loss function minimized to find the line of best fit in linear regression."
            }
        ]
        interactive = {
            "title": "Gradient Descent Learning Rate Simulator",
            "type": "code",
            "code_or_formula": "import numpy as np\n\ndef simulate_gradient_descent(learning_rate=0.1, epochs=5):\n    x = 10.0  # Starting value\n    history = []\n    for epoch in range(epochs):\n        gradient = 2 * x  # derivative of f(x) = x^2\n        x = x - learning_rate * gradient\n        history.append(round(x, 4))\n    return history",
            "explanation": "This script simulates gradient descent minimizing the function f(x) = x^2. The learning rate controls the step sizes. If it is too large, the algorithm can overshoot or diverge.",
            "simulated_output": "Epoch 1: x = 8.0\nEpoch 2: x = 6.4\nEpoch 3: x = 5.12\nEpoch 4: x = 4.096\nEpoch 5: x = 3.2768\nOptimized minimum located around x=0"
        }
    elif "data structures" in subject_lower or "algorithm" in subject_lower or "dbms" in subject_lower or "programming" in subject_lower:
        detailed += (
            "### 1. Computational Complexity & Big O\n"
            "Algorithms are evaluated based on their time and space complexity. The hierarchy of complexity is:\n"
            "$$O(1) < O(\\log n) < O(n) < O(n \\log n) < O(n^2)$$\n\n"
            "### 2. Advanced Dynamic Programming (DP)\n"
            "Dynamic Programming solves complex problems by breaking them down into simpler subproblems, caching solutions (memoization) to avoid redundant computation.\n"
            "#### Fibonacci DP Relation:\n"
            "$$DP[i] = DP[i-1] + DP[i-2]$$\n"
        )
        flashcards = [
            {"front": "Time Complexity", "back": "The amount of computer time it takes to run an algorithm, as a function of the length of the input."},
            {"front": "Dynamic Programming", "back": "An algorithmic technique that solves a complex problem by breaking it into subproblems, solving each subproblem once, and storing their solutions."},
            {"front": "Memoization", "back": "An optimization technique used primarily to speed up computer programs by storing the results of expensive function calls and returning the cached result when the same inputs occur again."},
            {"front": "Binary Search", "back": "A search algorithm that finds the position of a target value within a sorted array in O(log n) time by repeatedly dividing the search interval in half."},
            {"front": "Hash Map", "back": "A data structure that maps keys to values, offering an average time complexity of O(1) for lookup operations."}
        ]
        quiz = [
            {
                "question": "What is the worst-case time complexity of Binary Search on a sorted array?",
                "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
                "correct_answer_index": 2,
                "explanation": "Binary search divides the search space in half with each comparison, yielding log2(n) worst-case time complexity."
            },
            {
                "question": "Which data structure operates on a First-In, First-Out (FIFO) basis?",
                "options": ["Stack", "Queue", "Binary Tree", "Graph"],
                "correct_answer_index": 1,
                "explanation": "A queue processes elements in a FIFO manner, similar to a line at a store, whereas stacks are LIFO (Last-In, First-Out)."
            },
            {
                "question": "What optimization technique is central to dynamic programming?",
                "options": ["Randomization", "Recursion without caching", "Memoization / Tabulation", "Linear Search"],
                "correct_answer_index": 2,
                "explanation": "Dynamic Programming relies on saving subproblem solutions using either memoization (top-down) or tabulation (bottom-up) to avoid redundant calculations."
            },
            {
                "question": "What is the average time complexity of lookup in a Hash Table?",
                "options": ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
                "correct_answer_index": 0,
                "explanation": "Hash tables offer average O(1) constant time lookup by mapping keys directly to array buckets using a hash function."
            },
            {
                "question": "Which sorting algorithm has a guaranteed worst-case complexity of O(n log n)?",
                "options": ["Bubble Sort", "Quick Sort", "Insertion Sort", "Merge Sort"],
                "correct_answer_index": 3,
                "explanation": "Merge Sort splits and merges arrays in O(n log n) time in all cases. Quick Sort has O(n^2) worst case if pivot selections are poor."
            }
        ]
        interactive = {
            "title": "Binary Search Index Explorer",
            "type": "code",
            "code_or_formula": "def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    steps = []\n    while low <= high:\n        mid = (low + high) // 2\n        steps.append(f'Low: {low}, High: {high}, Mid: {mid}, Val: {arr[mid]}')\n        if arr[mid] == target:\n            return mid, steps\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1, steps",
            "explanation": "This function performs a binary search on a sorted array and logs the variables `low`, `high`, and `mid` in each iteration to demonstrate index splitting.",
            "simulated_output": "Target: 23, Array: [2, 5, 8, 12, 16, 23, 38, 56]\nStep 1: Low: 0, High: 7, Mid: 3, Val: 12\nStep 2: Low: 4, High: 7, Mid: 5, Val: 23\nFound index: 5 in 2 steps!"
        }
    else:
        detailed += (
            "### 1. Subject Fundamentals\n"
            f"Detailed overview of the foundational mechanics, theorems, and paradigms under {req.subject}.\n\n"
            "### 2. Analytical Formulations\n"
            "Here we examine the central modeling equation governing this system:\n"
            "$$\\oint_C \\vec{B} \\cdot d\\vec{l} = \\mu_0 \\left( I_{encl} + \\epsilon_0 \\frac{d\\Phi_E}{dt} \\right)$$\n"
        )
        flashcards = [
            {"front": "System State", "back": "The complete mathematical description of the state of the system at any given moment in time."},
            {"front": "Boundary Conditions", "back": "Constraints specified at the boundaries of the system that allow differential equations to resolve to unique solutions."},
            {"front": "Conservation Law", "back": "A principle stating that a particular measurable property of an isolated physical system does not change as the system evolves over time."},
            {"front": "Equilibrium", "back": "A state in which opposing forces or influences are balanced, resulting in no net change over time."},
            {"front": "Linearity", "back": "A system property where the response to a sum of inputs is the sum of responses to individual inputs."}
        ]
        quiz = [
            {
                "question": "What defines a system in static equilibrium?",
                "options": [
                    "The net force and net torque acting on the system are zero.",
                    "The system is moving at the speed of light.",
                    "The system temperature is absolute zero.",
                    "The system has infinite potential energy."
                ],
                "correct_answer_index": 0,
                "explanation": "Static equilibrium requires all net external forces and torques to sum to zero, preventing linear or rotational acceleration."
            },
            {
                "question": "Which condition is necessary for applying superposition in system analysis?",
                "options": [
                    "The system must be non-linear.",
                    "The system must be linear.",
                    "The system must be chaotic.",
                    "The system must have zero inputs."
                ],
                "correct_answer_index": 1,
                "explanation": "Superposition can only be applied to linear systems, where the total response equals the sum of the individual responses."
            },
            {
                "question": "What does a boundary condition constrain?",
                "options": [
                    "The database size limit.",
                    "The values of variables at the limits/borders of the system.",
                    "The processor speed of the host hardware.",
                    "The cost of construction materials."
                ],
                "correct_answer_index": 1,
                "explanation": "Boundary conditions specify values or derivatives of the system variables at its physical boundaries."
            },
            {
                "question": "Which conservation law governs electrical circuits in Kirchhoff's Current Law (KCL)?",
                "options": [
                    "Conservation of Momentum",
                    "Conservation of Energy",
                    "Conservation of Electric Charge",
                    "Conservation of Mass"
                ],
                "correct_answer_index": 2,
                "explanation": "KCL is a direct statement of the conservation of electric charge, requiring total current entering a node to equal total current leaving."
            },
            {
                "question": "What does absolute convergence of a sequence imply?",
                "options": [
                    "The sequence diverges to infinity.",
                    "The sequence converges to multiple values.",
                    "The sequence converges to a single finite value.",
                    "The sequence is periodic."
                ],
                "correct_answer_index": 2,
                "explanation": "Absolute convergence implies that the series of absolute values converges, which guarantees that the original series also converges to a finite sum."
            }
        ]
        interactive = {
            "title": "System Parameters & Boundary Explorer",
            "type": "formula",
            "code_or_formula": "y(t) = A * e^(-k * t) * cos(w * t + phi)",
            "explanation": "This represents the displacement of a damped harmonic oscillator. The rate of decay is controlled by k, frequency by w, and initial amplitude by A.",
            "simulated_output": "A (Amplitude): controls peak height.\nk (Damping factor): controls how fast the oscillations die out.\nw (Angular frequency): controls the frequency of oscillations.\nphi (Phase shift): moves the wave left or right."
        }

    return {
        "detailed_notes": detailed,
        "flashcards": flashcards,
        "quiz": quiz,
        "interactive_element": interactive
    }

@app.post("/chat-about-notes")
def chat_about_notes(req: ChatAboutNotesRequest):
    import os
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        try:
            import urllib.request
            import json
            
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            headers = {"Content-Type": "application/json"}
            prompt = (
                f"You are an expert academic tutor. You are helping a student study the subject '{req.subject}' "
                f"on the topic '{req.topic}'.\n"
                f"Here is the context of the study notes they are reading:\n"
                f"--- START NOTES ---\n"
                f"{req.notes_context}\n"
                f"--- END NOTES ---\n\n"
                f"The student asked the following question:\n"
                f"'{req.question}'\n\n"
                f"Provide a clear, detailed, and helpful academic explanation based on the notes context. "
                f"Use markdown formatting, bold keywords, and formulas where appropriate. Make your tone encouraging and educational."
            )
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            req_data = json.dumps(payload).encode("utf-8")
            api_req = urllib.request.Request(url, data=req_data, headers=headers, method="POST")
            with urllib.request.urlopen(api_req, timeout=15) as response:
                resp_json = json.loads(response.read().decode("utf-8"))
                answer = resp_json["candidates"][0]["content"]["parts"][0]["text"]
                return {"response": answer}
        except Exception as e:
            print("Failed to chat about notes with Gemini API:", e)
            
    # Fallback response
    return {"response": f"I parsed your question: '{req.question}' regarding '{req.topic}' (Subject: {req.subject}). To study this successfully, focus on understanding the key definitions, practice problems, and the interactive simulator provided in the notes tabs."}


@app.get("/")
def read_root():
    return {"message": "Welcome to Campus Companion API"}


# Timetable API endpoints & validation
def check_timetable_conflicts(db: Session, entry: schemas.TimetableEntryCreate, current_id: Optional[int] = None):
    query = db.query(models.TimetableEntry).filter(
        models.TimetableEntry.day == entry.day,
        models.TimetableEntry.period == entry.period
    )
    if current_id is not None:
        query = query.filter(models.TimetableEntry.id != current_id)
        
    existing = query.all()
    for e in existing:
        if e.department == entry.department and e.semester == entry.semester:
            raise HTTPException(
                status_code=400, 
                detail=f"Conflict: Semester {entry.semester} of Department {entry.department} already has class '{e.subject}' scheduled on {entry.day} period {entry.period}."
            )
        if entry.faculty_username and e.faculty_username == entry.faculty_username:
            raise HTTPException(
                status_code=400,
                detail=f"Faculty conflict: Teacher '{entry.faculty_username}' is already teaching class '{e.subject}' on {entry.day} period {entry.period}."
            )
        if e.room == entry.room:
            raise HTTPException(
                status_code=400,
                detail=f"Room conflict: Room/Lab '{entry.room}' is already occupied by class '{e.subject}' on {entry.day} period {entry.period}."
            )

@app.get("/timetable", response_model=List[schemas.TimetableEntryResponse])
def get_timetable(
    department: Optional[str] = None,
    semester: Optional[str] = None,
    day: Optional[str] = None,
    faculty_username: Optional[str] = None,
    requester_username: Optional[str] = Header(None, alias="x-requester-username"),
    requester_role: Optional[str] = Header(None, alias="x-requester-role"),
    db: Session = Depends(get_db)
):
    # Security: Students can only access their current semester and department
    if requester_role == "student" and requester_username:
        user = db.query(models.User).filter(models.User.username == requester_username).first()
        if user:
            student_dept = get_normalized_department(user.department)
            req_dept = get_normalized_department(department) if department else ""
            
            if (department and req_dept != student_dept) or (semester and semester != user.semester):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access Denied: Students can only access their current department and semester."
                )
            department = student_dept
            semester = user.semester
            
    query = db.query(models.TimetableEntry)
    if department:
        query = query.filter(models.TimetableEntry.department == department)
    if semester:
        query = query.filter(models.TimetableEntry.semester == semester)
    if day:
        query = query.filter(models.TimetableEntry.day == day)
    if faculty_username:
        query = query.filter(models.TimetableEntry.faculty_username == faculty_username)
    return query.all()

@app.post("/timetable", response_model=schemas.TimetableEntryResponse)
def create_timetable_entry(entry: schemas.TimetableEntryCreate, db: Session = Depends(get_db)):
    check_timetable_conflicts(db, entry)
    db_entry = models.TimetableEntry(**entry.dict())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.delete("/timetable/{id}")
def delete_timetable_entry(id: int, db: Session = Depends(get_db)):
    db_entry = db.query(models.TimetableEntry).filter(models.TimetableEntry.id == id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Timetable entry not found")
    db.delete(db_entry)
    db.commit()
    return {"message": "Timetable entry deleted successfully"}


# ==============================================================================
# FACE RECOGNITION STUDENT ATTENDANCE SYSTEM
# ==============================================================================

import json
import math
import datetime

def calculate_distance(embedding1, embedding2):
    if len(embedding1) != len(embedding2):
        return 999.0
    sum_sq = sum((float(f1) - float(f2)) ** 2 for f1, f2 in zip(embedding1, embedding2))
    return math.sqrt(sum_sq)

def get_weekday_from_date(date_str: str) -> str:
    try:
        dt = datetime.datetime.strptime(date_str, "%Y-%m-%d")
        return dt.strftime("%A")
    except Exception:
        return "Monday"

def get_config_val(db: Session, key: str, default: str) -> str:
    cfg = db.query(models.SystemConfig).filter(models.SystemConfig.key == key).first()
    if cfg:
        return cfg.value
    try:
        new_cfg = models.SystemConfig(key=key, value=default)
        db.add(new_cfg)
        db.commit()
        db.refresh(new_cfg)
        return default
    except Exception:
        return default

def ensure_daily_attendance_records(db: Session, date_str: str, student_id_filter: Optional[int] = None):
    # Only verify attendance beginning on 27 August 2026
    if date_str < "2026-08-27":
        return
        
    day_of_week = get_weekday_from_date(date_str)
    
    # Get current time
    now = datetime.datetime.now()
    now_time_str = now.strftime("%H:%M")
    today_str = now.strftime("%Y-%m-%d")
    
    query = db.query(models.User).filter(models.User.role == models.RoleEnum.student)
    if student_id_filter:
        query = query.filter(models.User.id == student_id_filter)
    students = query.all()
    
    for student in students:
        # Check timetable for student's department and semester on this weekday
        timetable = db.query(models.TimetableEntry).filter(
            models.TimetableEntry.department == (student.department or "Computer Science and Engineering (CSE)"),
            models.TimetableEntry.semester == (student.semester or "1-1"),
            models.TimetableEntry.day == day_of_week
        ).all()
        
        for entry in timetable:
            existing_period = db.query(models.AttendanceRecord).filter(
                models.AttendanceRecord.student_id == student.id,
                models.AttendanceRecord.date == date_str,
                models.AttendanceRecord.period == entry.period
            ).first()
            
            if not existing_period:
                # Check if the 15-minute window for this period has passed
                is_window_passed = False
                if date_str < today_str:
                    is_window_passed = True
                elif date_str == today_str:
                    try:
                        start_clean = entry.start_time[:5]
                        start_dt = datetime.datetime.strptime(start_clean, "%H:%M")
                        end_dt = start_dt + datetime.timedelta(minutes=15)
                        end_time_str = end_dt.strftime("%H:%M")
                        if now_time_str > end_time_str:
                            is_window_passed = True
                    except Exception:
                        if now_time_str > entry.start_time:
                            is_window_passed = True
                            
                if is_window_passed:
                    rec = models.AttendanceRecord(
                        student_id=student.id,
                        semester=student.semester or "1-1",
                        subject=entry.subject,
                        faculty_username=entry.faculty_username,
                        date=date_str,
                        period=entry.period,
                        start_time=entry.start_time,
                        end_time=entry.end_time,
                        status="Absent",
                        verification_method="SYSTEM",
                        confidence_score="0.0",
                        created_at=now.isoformat()
                    )
                    db.add(rec)
        db.commit()

class SystemConfigUpdate(BaseModel):
    attendance_window_start: str
    attendance_window_end: str

class FaceRegisterRequest(BaseModel):
    student_id: int
    embedding: str  # JSON array of 128 floats

class DailyAttendanceRequest(BaseModel):
    live_embedding: str  # JSON array of 128 floats
    student_id: Optional[int] = None
    date_override: Optional[str] = None
    time_override: Optional[str] = None

class AttendanceOverrideRequest(BaseModel):
    status: str  # "Present" or "Absent"

@app.get("/system-config")
def get_system_config(db: Session = Depends(get_db)):
    start = get_config_val(db, "attendance_window_start", "08:00")
    end = get_config_val(db, "attendance_window_end", "10:00")
    return {
        "attendance_window_start": start,
        "attendance_window_end": end
    }

@app.put("/system-config")
def update_system_config(config: SystemConfigUpdate, db: Session = Depends(get_db)):
    cfg_start = db.query(models.SystemConfig).filter(models.SystemConfig.key == "attendance_window_start").first()
    if not cfg_start:
        cfg_start = models.SystemConfig(key="attendance_window_start")
        db.add(cfg_start)
    cfg_start.value = config.attendance_window_start

    cfg_end = db.query(models.SystemConfig).filter(models.SystemConfig.key == "attendance_window_end").first()
    if not cfg_end:
        cfg_end = models.SystemConfig(key="attendance_window_end")
        db.add(cfg_end)
    cfg_end.value = config.attendance_window_end

    db.commit()
    return {"message": "Config updated successfully"}

@app.post("/attendance/reset")
def reset_attendance(db: Session = Depends(get_db)):
    db.query(models.AttendanceRecord).delete()
    db.query(models.FaceAuditLog).delete()
    # Wipe face enrollments too to trigger re-registration
    db.query(models.FaceEnrollment).delete()
    db.commit()
    return {"message": "Attendance records and face enrollments successfully reset."}

@app.post("/register-face")
def register_face(req: FaceRegisterRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == req.student_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Try parsing embedding to make sure it's valid JSON
    try:
        parsed = json.loads(req.embedding)
        if not isinstance(parsed, list) or len(parsed) != 128:
            raise ValueError()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid embedding format. Must be a JSON list of 128 floats.")

    enrollment = db.query(models.FaceEnrollment).filter(models.FaceEnrollment.student_id == req.student_id).first()
    action = "RE-REGISTER" if enrollment else "REGISTER"
    
    if not enrollment:
        enrollment = models.FaceEnrollment(student_id=req.student_id)
        db.add(enrollment)
        
    enrollment.embedding = req.embedding
    enrollment.is_active = 1
    enrollment.created_at = datetime.datetime.now().isoformat()
    
    # Log the action
    audit = models.FaceAuditLog(
        student_id=req.student_id,
        action=action,
        performed_by="admin" if action == "RE-REGISTER" else "student",
        timestamp=datetime.datetime.now().isoformat()
    )
    db.add(audit)
    db.commit()
    
    return {"message": "Face registered successfully", "action": action}

@app.post("/daily-attendance")
def daily_attendance(req: DailyAttendanceRequest, db: Session = Depends(get_db)):
    now = datetime.datetime.now()
    today_str = req.date_override or now.strftime("%Y-%m-%d")
    current_time_str = req.time_override or now.strftime("%H:%M")
    
    # Validate embedding
    try:
        live_list = json.loads(req.live_embedding)
        if not isinstance(live_list, list) or len(live_list) != 128:
            raise ValueError()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid live embedding format.")

    best_match_id = None
    best_dist = 999.0
    threshold = 0.6  # Standard Euclidean distance threshold for 128-d face embeddings

    if req.student_id:
        enrollment = db.query(models.FaceEnrollment).filter(
            models.FaceEnrollment.student_id == req.student_id,
            models.FaceEnrollment.is_active == 1
        ).first()
        if enrollment:
            reg_list = json.loads(enrollment.embedding)
            dist = calculate_distance(live_list, reg_list)
            if dist < threshold:
                best_match_id = req.student_id
                best_dist = dist
    else:
        # Kiosk mode: search all
        enrollments = db.query(models.FaceEnrollment).filter(models.FaceEnrollment.is_active == 1).all()
        for enr in enrollments:
            reg_list = json.loads(enr.embedding)
            dist = calculate_distance(live_list, reg_list)
            if dist < threshold and dist < best_dist:
                best_dist = dist
                best_match_id = enr.student_id

    if not best_match_id:
        raise HTTPException(status_code=400, detail="Face not recognized. Please try again or contact the administrator.")

    student = db.query(models.User).filter(models.User.id == best_match_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Matched student account not found.")

    # Fetch timetable entries
    day_name = get_weekday_from_date(today_str)
    timetable = db.query(models.TimetableEntry).filter(
        models.TimetableEntry.department == (student.department or "Computer Science and Engineering (CSE)"),
        models.TimetableEntry.semester == (student.semester or "1-1"),
        models.TimetableEntry.day == day_name
    ).all()

    # Find the active period matching current time within its 15-minute window
    active_entry = None
    for entry in timetable:
        try:
            start_clean = entry.start_time[:5]
            start_dt = datetime.datetime.strptime(start_clean, "%H:%M")
            end_dt = start_dt + datetime.timedelta(minutes=15)
            start_time_str = start_dt.strftime("%H:%M")
            end_time_str = end_dt.strftime("%H:%M")

            if start_time_str <= current_time_str <= end_time_str:
                active_entry = entry
                break
        except Exception:
            if entry.start_time <= current_time_str <= entry.start_time:
                active_entry = entry
                break

    if not active_entry:
        raise HTTPException(
            status_code=400,
            detail=f"No active attendance window found. Attendance is only open during the first 15 minutes of a scheduled class. Current time: {current_time_str}"
        )

    # Duplicate check for the active period
    existing = db.query(models.AttendanceRecord).filter(
        models.AttendanceRecord.student_id == student.id,
        models.AttendanceRecord.date == today_str,
        models.AttendanceRecord.period == active_entry.period
    ).first()

    if existing and existing.status == "Present":
        return {
            "already_recorded": True,
            "message": f"Attendance already recorded for Period {active_entry.period} ({active_entry.subject}) today.",
            "student": {
                "id": student.id,
                "name": student.name,
                "roll_number": student.roll_number,
                "semester": student.semester,
                "date": today_str
            }
        }

    # Mark Present for the active period
    confidence_pct = round((1.0 - (best_dist / threshold)) * 100, 1)
    confidence_pct = max(0.0, min(100.0, confidence_pct))

    if existing:
        # Update existing Absent record if they scanned within the window
        existing.status = "Present"
        existing.verification_method = "FACE_RECOGNITION"
        existing.confidence_score = f"{confidence_pct}%"
        existing.created_at = now.isoformat()
    else:
        rec = models.AttendanceRecord(
            student_id=student.id,
            semester=student.semester or "1-1",
            subject=active_entry.subject,
            faculty_username=active_entry.faculty_username,
            date=today_str,
            period=active_entry.period,
            start_time=active_entry.start_time,
            end_time=active_entry.end_time,
            status="Present",
            verification_method="FACE_RECOGNITION",
            confidence_score=f"{confidence_pct}%",
            created_at=now.isoformat()
        )
        db.add(rec)

    db.commit()

    return {
        "already_recorded": False,
        "message": f"Attendance for Period {active_entry.period} ({active_entry.subject}) Marked Successfully",
        "student": {
            "id": student.id,
            "name": student.name,
            "roll_number": student.roll_number,
            "semester": student.semester,
            "date": today_str,
            "status": "Present"
        }
    }

@app.get("/attendance/student/{student_id}")
def get_student_attendance_dashboard(
    student_id: int,
    requester_username: Optional[str] = Header(None, alias="x-requester-username"),
    requester_role: Optional[str] = Header(None, alias="x-requester-role"),
    db: Session = Depends(get_db)
):
    # Security: student can only fetch their own attendance records
    if requester_role == "student" and requester_username:
        user = db.query(models.User).filter(models.User.username == requester_username).first()
        if not user or user.id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: Students can only access their own attendance records."
            )
            
    student = db.query(models.User).filter(models.User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Run backfill for today and past days if needed
    now = datetime.datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    ensure_daily_attendance_records(db, today_str, student_id_filter=student_id)

    # Also backfill last 7 days of school days to show history
    for i in range(1, 8):
        past_date = (now - datetime.timedelta(days=i)).strftime("%Y-%m-%d")
        ensure_daily_attendance_records(db, past_date, student_id_filter=student_id)

    records = db.query(models.AttendanceRecord).filter(
        models.AttendanceRecord.student_id == student_id
    ).order_by(models.AttendanceRecord.date.desc(), models.AttendanceRecord.period.asc()).all()

    # Calculate overall presence
    total_classes = len(records)
    present_classes = len([r for r in records if r.status == "Present"])
    absent_classes = total_classes - present_classes
    overall_pct = round((present_classes / total_classes) * 100, 1) if total_classes > 0 else 0.0

    # Calculate subject-wise breakdown
    subject_stats = {}
    for r in records:
        if r.subject not in subject_stats:
            subject_stats[r.subject] = {"attended": 0, "total": 0}
        subject_stats[r.subject]["total"] += 1
        if r.status == "Present":
            subject_stats[r.subject]["attended"] += 1

    subject_list = []
    for subj, stats in subject_stats.items():
        pct = round((stats["attended"] / stats["total"]) * 100, 1) if stats["total"] > 0 else 0.0
        subject_list.append({
            "subject": subj,
            "total": stats["total"],
            "attended": stats["attended"],
            "absent": stats["total"] - stats["attended"],
            "percentage": pct
        })

    # Calendar log grouping by date
    calendar_map = {}
    for r in records:
        if r.date not in calendar_map:
            calendar_map[r.date] = []
        calendar_map[r.date].append({
            "period": r.period,
            "subject": r.subject,
            "status": r.status,
            "verification_method": r.verification_method,
            "confidence_score": r.confidence_score
        })

    calendar_history = [{"date": d, "records": recs} for d, recs in calendar_map.items()]

    # Face registration status
    face_enrolled = db.query(models.FaceEnrollment).filter(
        models.FaceEnrollment.student_id == student_id,
        models.FaceEnrollment.is_active == 1
    ).first()

    return {
        "overall_percentage": overall_pct,
        "total_classes": total_classes,
        "present_classes": present_classes,
        "absent_classes": absent_classes,
        "subjects": subject_list,
        "history": calendar_history,
        "face_registered": bool(face_enrolled),
        "semester": student.semester or "1-1"
    }

@app.get("/attendance/faculty")
def get_faculty_attendance(faculty_username: str, db: Session = Depends(get_db)):
    records = db.query(models.AttendanceRecord, models.User.name, models.User.roll_number).join(
        models.User, models.User.id == models.AttendanceRecord.student_id
    ).filter(
        models.AttendanceRecord.faculty_username == faculty_username
    ).order_by(models.AttendanceRecord.date.desc(), models.AttendanceRecord.period.asc()).all()

    formatted = []
    for r, name, roll in records:
        formatted.append({
            "id": r.id,
            "student_id": r.student_id,
            "student_name": name,
            "roll_number": roll,
            "semester": r.semester,
            "subject": r.subject,
            "date": r.date,
            "period": r.period,
            "start_time": r.start_time,
            "end_time": r.end_time,
            "status": r.status,
            "verification_method": r.verification_method,
            "confidence_score": r.confidence_score
        })
    return formatted

@app.get("/attendance/admin")
def get_admin_attendance(db: Session = Depends(get_db)):
    records = db.query(models.AttendanceRecord, models.User.name, models.User.roll_number).join(
        models.User, models.User.id == models.AttendanceRecord.student_id
    ).order_by(models.AttendanceRecord.date.desc(), models.AttendanceRecord.period.asc()).all()

    formatted = []
    for r, name, roll in records:
        formatted.append({
            "id": r.id,
            "student_id": r.student_id,
            "student_name": name,
            "roll_number": roll,
            "semester": r.semester,
            "subject": r.subject,
            "date": r.date,
            "period": r.period,
            "start_time": r.start_time,
            "end_time": r.end_time,
            "status": r.status,
            "verification_method": r.verification_method,
            "confidence_score": r.confidence_score
        })

    # Student enrollment status
    students = db.query(models.User).filter(models.User.role == models.RoleEnum.student).all()
    enrollments = db.query(models.FaceEnrollment).all()
    enrolled_ids = {e.student_id for e in enrollments if e.is_active == 1}

    student_status = []
    for s in students:
        student_status.append({
            "student_id": s.id,
            "username": s.username,
            "name": s.name,
            "roll_number": s.roll_number,
            "semester": s.semester,
            "department": s.department,
            "face_registered": s.id in enrolled_ids,
            "profile_photo": s.profile_photo
        })

    # Face audit logs
    audit_logs = db.query(models.FaceAuditLog, models.User.name, models.User.roll_number).join(
        models.User, models.User.id == models.FaceAuditLog.student_id
    ).order_by(models.FaceAuditLog.timestamp.desc()).all()

    formatted_audits = []
    for a, name, roll in audit_logs:
        formatted_audits.append({
            "id": a.id,
            "student_name": name,
            "roll_number": roll,
            "action": a.action,
            "performed_by": a.performed_by,
            "timestamp": a.timestamp
        })

    return {
        "records": formatted,
        "students": student_status,
        "audit_logs": formatted_audits
    }

@app.put("/attendance/{id}")
def update_attendance_record(id: int, req: AttendanceOverrideRequest, db: Session = Depends(get_db)):
    rec = db.query(models.AttendanceRecord).filter(models.AttendanceRecord.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    rec.status = req.status
    rec.verification_method = "MANUAL"
    db.commit()
    return {"message": "Attendance record updated successfully"}

# ==============================================================================
# MARKS, PROMOTION & FACULTY ERP ENDPOINTS
# ==============================================================================

class MarkUpdateSchema(BaseModel):
    student_id: int
    subject: str
    semester: str
    assessment_type: str
    marks: int

class FacultyProfileUpdateSchema(BaseModel):
    university: Optional[str] = None
    degree: Optional[str] = None
    designation: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    assigned_departments: Optional[str] = None
    assigned_subjects: Optional[str] = None
    assigned_semesters: Optional[str] = None

def get_normalized_department(dept: str) -> str:
    d = (dept or "").lower()
    if "aiml" in d:
        return "CSE AIML"
    if "ai" in d:
        return "CSE AI"
    if "cse" in d or "computer science" in d:
        return "Computer Science and Engineering (CSE)"
    if "eee" in d or "electrical" in d:
        return "Electrical and Electronics Engineering (EEE)"
    if "ece" in d or "electronics" in d:
        return "Electronics and Communication Engineering (ECE)"
    if "civil" in d:
        return "Civil Engineering"
    return "Computer Science and Engineering (CSE)"

def ensure_student_marks(db: Session, student: models.User):
    dept_norm = get_normalized_department(student.department)
    timetable = db.query(models.TimetableEntry).filter(
        models.TimetableEntry.department == dept_norm,
        models.TimetableEntry.semester == (student.semester or "1-1")
    ).all()
    subjects = {entry.subject for entry in timetable}
    components = ["Midterm 1", "Quiz 1", "Assignments", "Final Exam"]
    
    import datetime
    import random
    for subj in subjects:
        # Get assigned teacher
        entry = db.query(models.TimetableEntry).filter(
            models.TimetableEntry.department == dept_norm,
            models.TimetableEntry.semester == (student.semester or "1-1"),
            models.TimetableEntry.subject == subj
        ).first()
        fac_uname = entry.faculty_username if entry else None
        
        for comp in components:
            existing = db.query(models.Mark).filter(
                models.Mark.student_id == student.id,
                models.Mark.subject == subj,
                models.Mark.semester == (student.semester or "1-1"),
                models.Mark.assessment_type == comp
            ).first()
            
            if not existing:
                # Seed default marks based on realistic limits:
                # Midterm 1 (Max 30), Quiz 1 (Max 10), Assignments (Max 20), Final Exam (Max 40)
                max_scores = {"Midterm 1": 30, "Quiz 1": 10, "Assignments": 20, "Final Exam": 40}
                max_val = max_scores[comp]
                seed_val = int(max_val * (0.7 + random.random() * 0.22))
                
                new_mark = models.Mark(
                    student_id=student.id,
                    subject=subj,
                    faculty_username=fac_uname,
                    semester=student.semester or "1-1",
                    department=dept_norm,
                    assessment_type=comp,
                    marks=seed_val,
                    updated_at=datetime.datetime.now().isoformat()
                )
                db.add(new_mark)
    db.commit()

@app.get("/marks")
def get_marks(
    student_id: Optional[int] = None,
    semester: Optional[str] = None,
    requester_username: Optional[str] = Header(None, alias="x-requester-username"),
    requester_role: Optional[str] = Header(None, alias="x-requester-role"),
    db: Session = Depends(get_db)
):
    # Security: student can only fetch their own marks and up to their current semester
    if requester_role == "student" and requester_username:
        user = db.query(models.User).filter(models.User.username == requester_username).first()
        if user:
            student_id = user.id
            if semester and semester > user.semester:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied: Cannot access marks of future semesters.")
    
    if student_id:
        student = db.query(models.User).filter(models.User.id == student_id).first()
        if student:
            ensure_student_marks(db, student)
            
    query = db.query(models.Mark)
    if student_id:
        query = query.filter(models.Mark.student_id == student_id)
    if semester:
        query = query.filter(models.Mark.semester == semester)
    return query.all()

@app.put("/marks")
def update_marks(
    req: MarkUpdateSchema,
    requester_username: Optional[str] = Header(None, alias="x-requester-username"),
    requester_role: Optional[str] = Header(None, alias="x-requester-role"),
    db: Session = Depends(get_db)
):
    if requester_role == "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied: Students cannot modify marks.")
        
    if requester_role == "faculty" and requester_username:
        # Verify faculty is assigned to teach this subject and semester
        assigned = db.query(models.TimetableEntry).filter(
            models.TimetableEntry.faculty_username == requester_username,
            models.TimetableEntry.subject == req.subject,
            models.TimetableEntry.semester == req.semester
        ).first()
        if not assigned:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied: Faculty not assigned to this subject/semester.")
            
    # Find existing mark
    mark_entry = db.query(models.Mark).filter(
        models.Mark.student_id == req.student_id,
        models.Mark.subject == req.subject,
        models.Mark.semester == req.semester,
        models.Mark.assessment_type == req.assessment_type
    ).first()
    
    import datetime
    old_val = None
    if mark_entry:
        old_val = mark_entry.marks
        mark_entry.marks = req.marks
        mark_entry.updated_at = datetime.datetime.now().isoformat()
    else:
        # Create new mark entry
        entry = db.query(models.TimetableEntry).filter(
            models.TimetableEntry.subject == req.subject,
            models.TimetableEntry.semester == req.semester
        ).first()
        fac_uname = entry.faculty_username if entry else None
        
        mark_entry = models.Mark(
            student_id=req.student_id,
            subject=req.subject,
            faculty_username=fac_uname,
            semester=req.semester,
            department=entry.department if entry else "Engineering",
            assessment_type=req.assessment_type,
            marks=req.marks,
            updated_at=datetime.datetime.now().isoformat()
        )
        db.add(mark_entry)
        
    # Log modification
    log_entry = models.MarkModificationLog(
        performer_username=requester_username or "admin",
        student_id=req.student_id,
        subject=req.subject,
        old_value=old_val,
        new_value=req.marks,
        timestamp=datetime.datetime.now().isoformat()
    )
    db.add(log_entry)
    db.commit()
    
    return {"message": "Marks updated successfully", "old_value": old_val, "new_value": req.marks}

@app.post("/students/{username}/promote")
def promote_student(username: str, db: Session = Depends(get_db)):
    student_user = db.query(models.User).filter(models.User.username == username, models.User.role == models.RoleEnum.student).first()
    if not student_user:
        raise HTTPException(status_code=404, detail="Student not found")
        
    sem_progression = {
        "1-1": "1-2",
        "1-2": "2-1",
        "2-1": "2-2",
        "2-2": "3-1",
        "3-1": "3-2",
        "3-2": "4-1",
        "4-1": "4-2",
        "4-2": "Graduate"
    }
    
    current_sem = student_user.semester or "1-1"
    next_sem = sem_progression.get(current_sem, "Graduate")
    if next_sem == "Graduate":
        raise HTTPException(status_code=400, detail="Student has already graduated.")
        
    # Advance semester
    student_user.semester = next_sem
    
    # Update year
    if next_sem in ["1-1", "1-2"]:
        student_user.year = "1st Year"
    elif next_sem in ["2-1", "2-2"]:
        student_user.year = "2nd Year"
    elif next_sem in ["3-1", "3-2"]:
        student_user.year = "3rd Year"
    elif next_sem in ["4-1", "4-2"]:
        student_user.year = "4th Year"
        
    # Sync to Student table
    db_student = db.query(models.Student).filter(models.Student.user_id == student_user.id).first()
    if db_student:
        db_student.semester = next_sem
        db_student.year = student_user.year
        
    db.commit()
    return {"message": f"Student promoted from {current_sem} to {next_sem}", "current_semester": next_sem}

@app.get("/faculties", response_model=List[schemas.FacultyResponse])
def get_faculties(db: Session = Depends(get_db)):
    return db.query(models.Faculty).all()

@app.get("/faculties/{faculty_id}", response_model=schemas.FacultyResponse)
def get_faculty_profile(faculty_id: str, db: Session = Depends(get_db)):
    fac = db.query(models.Faculty).filter(models.Faculty.faculty_id == faculty_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Faculty profile not found")
    return fac

@app.put("/faculties/{faculty_id}", response_model=schemas.FacultyResponse)
def update_faculty_profile(faculty_id: str, req: FacultyProfileUpdateSchema, db: Session = Depends(get_db)):
    fac = db.query(models.Faculty).filter(models.Faculty.faculty_id == faculty_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Faculty profile not found")
        
    if req.university is not None:
        fac.university = req.university
    if req.degree is not None:
        fac.degree = req.degree
    if req.designation is not None:
        fac.designation = req.designation
    if req.email is not None:
        fac.email = req.email
    if req.phone is not None:
        fac.phone = req.phone
    if req.assigned_departments is not None:
        fac.assigned_departments = req.assigned_departments
    if req.assigned_subjects is not None:
        fac.assigned_subjects = req.assigned_subjects
    if req.assigned_semesters is not None:
        fac.assigned_semesters = req.assigned_semesters
        
    # Sync back to the User model as well
    db_user = db.query(models.User).filter(models.User.id == fac.user_id).first()
    if db_user:
        if req.email is not None:
            db_user.email = req.email
        if req.assigned_departments is not None:
            db_user.department = req.assigned_departments
        if req.assigned_subjects is not None:
            db_user.subjects = req.assigned_subjects
        if req.assigned_semesters is not None:
            db_user.semester = req.assigned_semesters
            
    db.commit()
    db.refresh(fac)
    return fac


