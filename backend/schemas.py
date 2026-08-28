from pydantic import BaseModel, Field
from typing import Optional, List
from models import RoleEnum

class UserCreate(BaseModel):
    username: str
    password: str = Field(...)
    role: RoleEnum = RoleEnum.student
    name: Optional[str] = None
    email: Optional[str] = None
    roll_number: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    semester: Optional[str] = None
    section: Optional[str] = None
    subjects: Optional[str] = None
    profile_photo: Optional[str] = None
    approval_status: Optional[str] = "Approved"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    roll_number: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    semester: Optional[str] = None
    section: Optional[str] = None
    subjects: Optional[str] = None
    password: Optional[str] = None
    profile_photo: Optional[str] = None
    approval_status: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    role: RoleEnum
    name: Optional[str] = None
    email: Optional[str] = None
    roll_number: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    semester: Optional[str] = None
    section: Optional[str] = None
    subjects: Optional[str] = None
    profile_photo: Optional[str] = None
    approval_status: Optional[str] = "Approved"
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[UserResponse] = None

class ChatRequest(BaseModel):
    message: str
    
class ChatResponse(BaseModel):
    response: str


class TimetableEntryBase(BaseModel):
    department: str
    semester: str
    day: str
    period: int
    subject: str
    subject_type: str
    faculty_username: Optional[str] = None
    room: str
    start_time: str
    end_time: str


class TimetableEntryCreate(TimetableEntryBase):
    pass


class TimetableEntryResponse(TimetableEntryBase):
    id: int

    class Config:
        from_attributes = True

class FaceEnrollmentBase(BaseModel):
    student_id: int
    embedding: str
    is_active: Optional[int] = 1

class FaceEnrollmentCreate(FaceEnrollmentBase):
    pass

class FaceEnrollmentResponse(FaceEnrollmentBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True

class AttendanceRecordBase(BaseModel):
    student_id: int
    semester: str
    subject: str
    faculty_username: Optional[str] = None
    date: str
    period: int
    start_time: str
    end_time: str
    status: str
    verification_method: str
    confidence_score: Optional[str] = None

class AttendanceRecordCreate(AttendanceRecordBase):
    pass

class AttendanceRecordResponse(AttendanceRecordBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True

class SystemConfigSchema(BaseModel):
    key: str
    value: str

    class Config:
        from_attributes = True

class FaceAuditLogResponse(BaseModel):
    id: int
    student_id: int
    action: str
    performed_by: str
    timestamp: str

    class Config:
        from_attributes = True

class FacultyBase(BaseModel):
    faculty_id: str
    name: str
    university: Optional[str] = "Not Provided"
    degree: str
    designation: str
    date_of_joining: str
    department: Optional[str] = "Computer Science and Engineering"
    assigned_departments: Optional[str] = None
    assigned_subjects: Optional[str] = None
    assigned_semesters: Optional[str] = None
    email: str
    phone: Optional[str] = None
    profile_photo: Optional[str] = None
    status: Optional[str] = "Active"

class FacultyCreate(FacultyBase):
    user_id: Optional[int] = None

class FacultyResponse(FacultyBase):
    id: int
    user_id: Optional[int] = None

    class Config:
        from_attributes = True

class MarkBase(BaseModel):
    student_id: int
    subject: str
    faculty_username: Optional[str] = None
    semester: str
    department: str
    assessment_type: str
    marks: int

class MarkCreate(MarkBase):
    pass

class MarkResponse(MarkBase):
    id: int
    updated_at: str

    class Config:
        from_attributes = True

class MarkModificationLogResponse(BaseModel):
    id: int
    performer_username: str
    student_id: int
    subject: str
    old_value: Optional[int] = None
    new_value: int
    timestamp: str

    class Config:
        from_attributes = True


