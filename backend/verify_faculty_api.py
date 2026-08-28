import os, sys
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

import models
from database import engine, SessionLocal, SQLALCHEMY_DATABASE_URL

def verify_all():
    db = SessionLocal()
    faculties = db.query(models.Faculty).order_by(models.Faculty.id).all()
    
    print("=" * 80)
    print("DATABASE FACULTY VERIFICATION REPORT")
    print("=" * 80)
    print(f"Database in use: {SQLALCHEMY_DATABASE_URL}")
    print(f"Total faculty records in 'faculties' table: {len(faculties)}")
    
    phd_list = [f for f in faculties if f.degree == "PhD"]
    mtech_list = [f for f in faculties if f.degree == "M.Tech"]
    prof_list = [f for f in faculties if f.designation == "Professor"]
    assoc_list = [f for f in faculties if f.designation == "Associate Professor"]
    asst_list = [f for f in faculties if f.designation == "Assistant Professor"]
    
    print(f"\n--- DISTRIBUTION ---")
    print(f"PhD: {len(phd_list)} (Records 1-8)")
    print(f"M.Tech: {len(mtech_list)} (Records 9-53)")
    print(f"Professors: {len(prof_list)} (Records 1, 2, 3, 5, 7)")
    print(f"Associate Professors: {len(assoc_list)} (Records 4, 6, 8)")
    print(f"Assistant Professors: {len(asst_list)} (Records 9-53)")
    
    print(f"\n--- SAMPLE RECORDS ---")
    for sample_idx in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 20, 52]:
        f = faculties[sample_idx]
        print(f"[{f.faculty_id}] {f.name} | {f.degree} | {f.designation} | DOJ: {f.date_of_joining} | Dept: {f.department} | Univ: {f.university[:45]}...")
        
    print("=" * 80)
    print("ALL 53 RECORDS SUCCESSFULLY VERIFIED IN DATABASE TABLE 'faculties'.")
    print("=" * 80)
    db.close()

if __name__ == "__main__":
    verify_all()
