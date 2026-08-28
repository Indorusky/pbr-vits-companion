from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
import enum
from database import Base

class RoleEnum(str, enum.Enum):
    student = "student"
    faculty = "faculty"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(Enum(RoleEnum), default=RoleEnum.student)
    
    # Profile fields (added to users table for dynamic direct fetching)
    name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    roll_number = Column(String(255), unique=True, index=True, nullable=True) # roll number for students, employee ID/username for faculty
    department = Column(String(255), nullable=True)
    year = Column(String(255), nullable=True)
    semester = Column(String(255), nullable=True)
    section = Column(String(255), nullable=True)
    subjects = Column(String(1000), nullable=True) # Comma-separated list of subjects
    profile_photo = Column(String, nullable=True) # base64 profile image string
    approval_status = Column(String(255), default="Approved") # "Approved" or "Pending" (for faculty signups)

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(255))
    roll_number = Column(String(255), unique=True, index=True)
    department = Column(String(255))
    year = Column(String(255))
    semester = Column(String(255))
    section = Column(String(255), nullable=True)
    profile_photo = Column(String, nullable=True) # base64 profile image string
    
    user = relationship("User")


class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    id = Column(Integer, primary_key=True, index=True)
    department = Column(String(255), index=True)
    semester = Column(String(255), index=True)
    day = Column(String(255), index=True)
    period = Column(Integer)  # 1, 2, 3, or 4
    subject = Column(String(255))
    subject_type = Column(String(255))  # Lecture, Laboratory, Project, Seminar
    faculty_username = Column(String(255), nullable=True)
    room = Column(String(255))
    start_time = Column(String(255))
    end_time = Column(String(255))

class FaceEnrollment(Base):
    __tablename__ = "face_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), unique=True)
    embedding = Column(String)  # Holds JSON string of float values
    is_active = Column(Integer, default=1)
    enrollment_count = Column(Integer, default=1) # Track biometric update attempts (max 3)
    reset_request_status = Column(String(255), default="None") # "None", "Pending", "Approved", "Rejected"
    created_at = Column(String(255))

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    semester = Column(String(255))
    subject = Column(String(255))
    faculty_username = Column(String(255), nullable=True)
    date = Column(String(255))  # "YYYY-MM-DD"
    period = Column(Integer)  # 1, 2, 3, or 4
    start_time = Column(String(255))
    end_time = Column(String(255))
    status = Column(String(255))  # "Present" or "Absent"
    verification_method = Column(String(255))  # "FACE_RECOGNITION" or "MANUAL"
    confidence_score = Column(String(255), nullable=True)  # Cosine similarity or confidence score
    created_at = Column(String(255))

class FaceAuditLog(Base):
    __tablename__ = "face_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(255))  # "REGISTER", "RE-REGISTER", "RESET"
    performed_by = Column(String(255))
    timestamp = Column(String(255))

class SystemConfig(Base):
    __tablename__ = "system_configs"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(255), unique=True, index=True)
    value = Column(String(255))

class Faculty(Base):
    __tablename__ = "faculties"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True)
    faculty_id = Column(String(255), unique=True, index=True)
    name = Column(String(255))
    university = Column(String(255), default="Not Provided")
    degree = Column(String(255))
    designation = Column(String(255))
    date_of_joining = Column(String(255))
    department = Column(String(255), default="Computer Science and Engineering")
    assigned_departments = Column(String(1000), nullable=True)
    assigned_subjects = Column(String(1000), nullable=True)
    assigned_semesters = Column(String(1000), nullable=True)
    email = Column(String(255))
    phone = Column(String(255), nullable=True)
    profile_photo = Column(String(1000), nullable=True)
    status = Column(String(255), default="Active")
    approval_status = Column(String(255), default="Pending")

class Mark(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String(255))
    faculty_username = Column(String(255), nullable=True)
    semester = Column(String(255))
    department = Column(String(255))
    assessment_type = Column(String(255))  # e.g., "Internal Assessment", "Assignment", "Test", "Mid Exam", "Practical"
    marks = Column(Integer)
    updated_at = Column(String(255))

class MarkModificationLog(Base):
    __tablename__ = "mark_modification_logs"

    id = Column(Integer, primary_key=True, index=True)
    performer_username = Column(String(255))
    student_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String(255))
    old_value = Column(Integer, nullable=True)
    new_value = Column(Integer)
    timestamp = Column(String(255))


