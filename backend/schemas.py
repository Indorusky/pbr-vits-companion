from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
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

# Assignments
class AssignmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: str
    department: str
    semester: str
    faculty_username: Optional[str] = None
    faculty_name: Optional[str] = None
    deadline: Optional[str] = None
    due_date: Optional[str] = None
    total_points: Optional[int] = 100
    points: Optional[int] = None
    attachment_url: Optional[str] = None

class AssignmentCreate(AssignmentBase):
    pass

class SubmissionSummary(BaseModel):
    """Lightweight submission info embedded inside AssignmentResponse."""
    studentId: str
    studentName: str
    rollNumber: str
    submittedFile: Optional[str] = None
    submittedAt: str
    comments: Optional[str] = None
    score: Optional[int] = None
    feedback: Optional[str] = None
    status: str  # 'Submitted' | 'Graded' | 'Resubmitted'

    class Config:
        from_attributes = True

class AssignmentResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    subject: str
    department: str
    semester: str
    faculty_username: Optional[str] = None
    faculty_name: Optional[str] = None
    deadline: Optional[str] = None
    total_points: Optional[int] = 100
    attachment_url: Optional[str] = None
    created_at: Optional[str] = None
    # Submissions dict keyed by student roll number (populated dynamically)
    submissions: Optional[Dict[str, SubmissionSummary]] = {}

    class Config:
        from_attributes = True

class AssignmentSubmissionCreate(BaseModel):
    assignment_id: Optional[int] = None
    submission_text: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    submitted_file: Optional[str] = None
    comments: Optional[str] = None

class AssignmentSubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    student_name: str
    student_roll: str
    submission_text: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    submitted_at: str
    marks_awarded: Optional[int] = None
    feedback: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

# Announcements
class AnnouncementBase(BaseModel):
    title: str
    content: str
    category: Optional[str] = "General"
    priority: Optional[str] = "Normal"
    important: Optional[bool] = False
    author_role: Optional[str] = "Faculty"
    author_name: Optional[str] = "Academic Admin"
    target_dept: Optional[str] = "All"
    target_sem: Optional[str] = "All"

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementResponse(AnnouncementBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True

# Quizzes
class QuizBase(BaseModel):
    title: str
    subject: str
    department: str
    semester: str
    year: Optional[str] = None
    faculty_username: Optional[str] = None
    duration: Optional[str] = None
    duration_minutes: Optional[int] = 15
    total_marks: Optional[int] = 10
    questions: Optional[List[Any]] = None
    questions_json: Optional[str] = None

class QuizCreate(QuizBase):
    pass

class QuizResponse(BaseModel):
    id: int
    title: str
    subject: str
    department: str
    semester: str
    faculty_username: Optional[str] = None
    duration_minutes: Optional[int] = 15
    total_marks: Optional[int] = 10
    questions_json: str
    created_at: str

    class Config:
        from_attributes = True

class QuizSubmissionCreate(BaseModel):
    quiz_id: Optional[int] = None
    answers: Optional[Dict[str, Any]] = None
    answers_json: Optional[str] = None

class QuizSubmissionResponse(BaseModel):
    id: int
    quiz_id: int
    student_id: int
    student_name: str
    student_roll: str
    answers_json: str
    score: int
    total_questions: int
    percentage: int
    submitted_at: str

    class Config:
        from_attributes = True

class FacultyChatConversationCreate(BaseModel):
    faculty_id: int

class FacultyChatMessageCreate(BaseModel):
    message: str

class FacultyListItem(BaseModel):
    id: int
    username: str
    name: str
    department: Optional[str] = None
    designation: Optional[str] = None
    email: Optional[str] = None
    profile_photo: Optional[str] = None

    class Config:
        from_attributes = True

class StudentInfoSummary(BaseModel):
    id: int
    name: str
    username: str
    roll_number: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    semester: Optional[str] = None
    section: Optional[str] = None
    profile_photo: Optional[str] = None

    class Config:
        from_attributes = True

class FacultyInfoSummary(BaseModel):
    id: int
    name: str
    username: str
    department: Optional[str] = None
    designation: Optional[str] = None
    email: Optional[str] = None
    profile_photo: Optional[str] = None

    class Config:
        from_attributes = True

class FacultyChatMessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    sender_name: str
    sender_role: str
    message: str
    created_at: str
    is_read: bool

    class Config:
        from_attributes = True

class FacultyChatConversationOut(BaseModel):
    id: int
    student_id: int
    faculty_id: int
    department: Optional[str] = None
    created_at: str
    updated_at: str
    last_message_at: Optional[str] = None
    last_message_preview: Optional[str] = None
    unread_by_student: int
    unread_by_faculty: int
    student: Optional[StudentInfoSummary] = None
    faculty: Optional[FacultyInfoSummary] = None

    class Config:
        from_attributes = True




