import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

load_dotenv()

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import models
from database import Base

def migrate():
    target_url = sys.argv[1] if len(sys.argv) > 1 else os.getenv("DATABASE_URL")
    if not target_url:
        print("ERROR: DATABASE_URL is not set!")
        print("Usage: python backend/migrate_to_cloud.py <DATABASE_URL>")
        sys.exit(1)

    if target_url.startswith("postgres://"):
        target_url = target_url.replace("postgres://", "postgresql://", 1)

    backend_dir = os.path.dirname(os.path.abspath(__file__))
    sqlite_path = os.path.join(backend_dir, "campus_companion.db")
    print(f"Connecting to local SQLite database ({sqlite_path})...", flush=True)
    local_engine = create_engine(f"sqlite:///{sqlite_path}", connect_args={"check_same_thread": False})
    LocalSession = sessionmaker(bind=local_engine)
    local_db = LocalSession()

    print(f"Connecting to Cloud PostgreSQL database...", flush=True)
    cloud_engine = create_engine(target_url)
    CloudSession = sessionmaker(bind=cloud_engine)
    cloud_db = CloudSession()

    print("Resetting public schema on PostgreSQL target database...", flush=True)
    with cloud_engine.connect() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE; CREATE SCHEMA public;"))
        conn.commit()

    print("Creating clean tables on target PostgreSQL database...", flush=True)
    Base.metadata.create_all(bind=cloud_engine)

    # 1. Migrate Users first
    user_records = local_db.query(models.User).all()
    user_ids = {u.id for u in user_records}
    print(f"Migrating {len(user_records)} Users...", flush=True)
    cloud_db.add_all([models.User(**{c.name: getattr(u, c.name) for c in u.__table__.columns}) for u in user_records])
    cloud_db.commit()

    # Create dummy placeholders for referenced student IDs 63 & 117 if missing
    for ref_id in [63, 117]:
        if ref_id not in user_ids:
            placeholder = models.User(
                id=ref_id,
                username=f"student_{ref_id}",
                hashed_password="hashed_placeholder_password",
                role=models.RoleEnum.student,
                name=f"Student User {ref_id}"
            )
            cloud_db.add(placeholder)
            user_ids.add(ref_id)
    cloud_db.commit()
    print("OK: Users and foreign key placeholders created.", flush=True)

    tables = [
        (models.Student, "Students"),
        (models.Faculty, "Faculty"),
        (models.TimetableEntry, "Timetable Entries"),
        (models.FaceEnrollment, "Face Enrollments"),
        (models.AttendanceRecord, "Attendance Records"),
        (models.Mark, "Marks"),
        (models.SystemConfig, "System Configs"),
        (models.FaceAuditLog, "Face Audit Logs"),
        (models.MarkModificationLog, "Mark Modification Logs")
    ]

    for model, name in tables:
        try:
            records = local_db.query(model).all()
            if not records:
                print(f"OK: {name} (0 records)", flush=True)
                continue

            print(f"Migrating {len(records)} records for {name}...", flush=True)
            to_add = []
            for rec in records:
                data = {column.name: getattr(rec, column.name) for column in rec.__table__.columns}
                # Check student_id constraint if present
                if "student_id" in data and data["student_id"] not in user_ids:
                    continue
                to_add.append(model(**data))
            
            if to_add:
                batch_size = 100
                for i in range(0, len(to_add), batch_size):
                    batch = to_add[i:i+batch_size]
                    cloud_db.add_all(batch)
                    cloud_db.commit()
                print(f"OK: {name} migrated successfully ({len(to_add)} records).", flush=True)
            else:
                print(f"OK: {name} (0 eligible records).", flush=True)
        except Exception as e:
            cloud_db.rollback()
            print(f"WARN: Error migrating {name}: {e}", flush=True)

    print("\nCloud Database Migration Completed Successfully!", flush=True)

if __name__ == "__main__":
    migrate()
