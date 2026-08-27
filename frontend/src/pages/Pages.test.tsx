import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import Events from './Events';
import Placements from './Placements';
import Quizzes from './Quizzes';

// Dynamic mock variables (prefixed with 'mock' so they can be accessed inside hoisted vi.mock)
const mockUser = {
  username: 'alex_johnson',
  role: 'student',
  year: '3rd Year',
  semester: '3-1',
};
let mockViewMode = 'student';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    viewMode: mockViewMode,
  }),
}));

describe('Events Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockViewMode = 'student';
  });

  afterEach(() => {
    cleanup();
  });

  it('renders INITIAL_EVENTS with entry fees', () => {
    render(<Events />);
    expect(screen.getAllByText('CodeRed National AI Hackathon 2026').length).toBeGreaterThan(0);
    expect(screen.getByText('Fee: $10')).toBeDefined();
    expect(screen.getByText('Fee: $5')).toBeDefined();
    expect(screen.getByText('Fee: Free')).toBeDefined();
  });

  it('opens registration modal when clicking Register, fills details, and submits', () => {
    render(<Events />);
    
    const registerButtons = screen.getAllByText('Get Ticket / Register');
    fireEvent.click(registerButtons[0]);

    expect(screen.getByText('Event Registration')).toBeDefined();
    expect(screen.getByText('Entry Fee Required')).toBeDefined();

    const nameInput = screen.getByPlaceholderText('Enter your name');
    const branchInput = screen.getByPlaceholderText('e.g. Computer Science');
    const mobileInput = screen.getByPlaceholderText('e.g. +1 234-567-8900');

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(branchInput, { target: { value: 'CSE' } });
    fireEvent.change(mobileInput, { target: { value: '123-456-7890' } });

    const submitButton = screen.getByRole('button', { name: /^(Pay & Register|Register)$/ });
    fireEvent.submit(submitButton.closest('form')!);

    expect(screen.queryByText('Event Registration')).toBeNull();
    
    const registeredButtons = screen.getAllByText('Registered');
    expect(registeredButtons.length).toBeGreaterThan(0);
  });
});

describe('Placements Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockViewMode = 'student';
  });

  afterEach(() => {
    cleanup();
  });

  it('renders list of job openings', () => {
    render(<Placements />);
    expect(screen.getByText('Google DeepMind Technologies')).toBeDefined();
    expect(screen.getByText('OpenAI Corporation')).toBeDefined();
    expect(screen.getByText('Stripe Payments Inc.')).toBeDefined();
  });

  it('opens application modal when clicking Apply Now, fills details, and submits', () => {
    render(<Placements />);

    const applyButtons = screen.getAllByText('Apply Now');
    fireEvent.click(applyButtons[0]);

    expect(screen.getByText('Job Application')).toBeDefined();

    const nameInput = screen.getByPlaceholderText('Enter your full name');
    const emailInput = screen.getByPlaceholderText('e.g. email@example.com');
    const phoneInput = screen.getByPlaceholderText('e.g. +1 (555) 000-0000');

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '123-456-7890' } });

    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    const file = new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText('Selected: resume.pdf')).toBeDefined();

    const submitButton = screen.getByRole('button', { name: 'Submit Application' });
    fireEvent.submit(submitButton.closest('form')!);

    expect(screen.queryByText('Job Application')).toBeNull();

    const exactAppliedButtons = screen.getAllByText(/^Applied$/);
    expect(exactAppliedButtons.length).toBe(2);
  });
});

describe('Quizzes Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockViewMode = 'student';
  });

  afterEach(() => {
    cleanup();
  });

  it('filters quizzes to only show the student\'s respective year and semester', () => {
    render(<Quizzes />);
    
    // Default student (Alex) is 3rd Year, 3-1.
    // They should see "Data Structures & Algorithmic Complexity" (3rd Year, 3-1)
    expect(screen.getByText('Data Structures & Algorithmic Complexity')).toBeDefined();
    
    // They should NOT see Laplace Transform (2nd Year) or Quantum Mechanics (1st Year)
    expect(screen.queryByText('Laplace Transform & Integration Foundations')).toBeNull();
    expect(screen.queryByText('Quantum Mechanics & Optics Quiz')).toBeNull();
  });

  it('shows all quizzes for faculty, allows uploading a quiz, and reflects for the student', () => {
    // 1. Render as faculty to upload the quiz
    mockViewMode = 'faculty';
    const { rerender } = render(<Quizzes />);

    // Faculty should see all quizzes
    expect(screen.getByText('Data Structures & Algorithmic Complexity')).toBeDefined();
    expect(screen.getByText('Laplace Transform & Integration Foundations')).toBeDefined();
    expect(screen.getByText('Quantum Mechanics & Optics Quiz')).toBeDefined();

    // Click "Create Quiz" button
    const createButton = screen.getByRole('button', { name: /Create Quiz/ });
    fireEvent.click(createButton);

    // Verify modal is open
    expect(screen.getByText('Create Subject Quiz')).toBeDefined();

    // Fill new quiz fields
    const titleInput = screen.getByPlaceholderText('e.g. Relational Databases Midterm Review');
    fireEvent.change(titleInput, { target: { value: 'Database Management Basics' } });

    // Select Target Year, Target Semester, and Target Department
    const yearSelect = screen.getByLabelText('Target Academic Year');
    const semSelect = screen.getByLabelText('Target Semester');
    const deptSelect = screen.getByLabelText('Target Department');
    fireEvent.change(yearSelect, { target: { value: '3rd Year' } });
    fireEvent.change(semSelect, { target: { value: '3-1' } });
    fireEvent.change(deptSelect, { target: { value: 'Computer Science and Engineering (CSE)' } });

    // Fill Q1 and Q2 details
    const q1TextInput = screen.getByPlaceholderText('e.g. Which language runs in a web browser?');
    const q2TextInput = screen.getByPlaceholderText('e.g. Is CSS a programming language?');
    fireEvent.change(q1TextInput, { target: { value: 'What does SQL stand for?' } });
    fireEvent.change(q2TextInput, { target: { value: 'What is a primary key?' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: 'Create Quiz Challenge' });
    fireEvent.submit(submitBtn.closest('form')!);

    // Modal should close
    expect(screen.queryByText('Create Subject Quiz')).toBeNull();

    // Faculty should now see the new quiz in the list
    expect(screen.getByText('Database Management Basics')).toBeDefined();

    // Clean up DOM and rerender as Student to verify filtering reflects the new quiz
    cleanup();
    mockViewMode = 'student';
    render(<Quizzes />);

    // Student should see "Data Structures" AND the new "Database Management Basics" (both are 3rd Year, 3-1)
    expect(screen.getByText('Data Structures & Algorithmic Complexity')).toBeDefined();
    expect(screen.getByText('Database Management Basics')).toBeDefined();

    // Student should still NOT see other years' quizzes
    expect(screen.queryByText('Laplace Transform & Integration Foundations')).toBeNull();
  });
});
