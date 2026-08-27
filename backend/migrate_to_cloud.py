import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()

# Add current directory to path so models can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import models
from database import Base

def migrate():
    target_url = os.getenv("DATABASE_URL")
    if not target_url:
        print("ERROR: DATABASE_URL environment variable is not set!")
        print("Usage: DATABASE_URL='postgresql://user:pass@host:port/dbname' python migrate_to_cloud.py")
        sys.exit(1)

    if target_url.startswith("postgres://"):
        target_url = target_url.replace("postgres://", "postgresql://", 1)

    print("Connecting to local SQLite database (campus_companion.db)...")
    local_engine = create_engine("sqlite:///./campus_companion.db", connect_args={"check_same_thread": False})
    LocalSession = sessionmaker(bind=local_engine)
    local_db = LocalSession()

    print(f"Connecting to Cloud PostgreSQL database...")
    cloud_engine = create_engine(target_url)
    CloudSession = sessionmaker(bind=cloud_engine)
    cloud_db = CloudSession()

    print("Creating schema on target database...")
    Base.metadata.create_all(bind=cloud_engine)

    # Tables in topological order
    tables = [
        (models.User, "Users"),
        (models.Faculty, "Faculty"),
        (models.TimetableEntry, "Timetable Entries"),
        (models.FaceEnrollment, "Face Enrollments"),
        (models.AttendanceRecord, "Attendance Records"),
        (models.MarksRecord, "Marks Records"),
        (models.SystemConfig, "System Configs"),
        (models.AttendanceAuditLog, "Attendance Audit Logs")
    ]

    for model, name in tables:
        try:
            records = local_db.query(model).all()
            print(f"Migrating {len(records)} records for {name}...")
            for rec in records:
                # Convert SQLAlchemy instance to dictionary
                data = {column.name: getattr(rec, column.name) for column in rec.__table__.columns}
                
                # Check if already exists by id
                existing = cloud_db.query(model).filter(model.id == rec.id).first()
                if not existing:
                    new_obj = model(**data)
                    cloud_db.add(new_obj)
            cloud_db.commit()
            print(f"✓ {name} migrated successfully.")
        except Exception as e:
            cloud_db.rollback()
            print(f"⚠ Skipping/Error migrating {name}: {e}")

    print("\n🎉 Cloud Database Migration Completed Successfully!")

if __name__ == "__main__":
    migrate()
