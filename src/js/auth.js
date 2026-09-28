/* Golden Path Tutors - Authentication & Student Access System */

const USERS_STORAGE_KEY = 'gpt_registered_students_v1';
const SESSION_STORAGE_KEY = 'gpt_active_student_session_v1';

// Seed initial sample student if none exists
export function initAuthStore() {
  if (!localStorage.getItem(USERS_STORAGE_KEY)) {
    const defaultStudents = [
      {
        fullName: 'Alexander Wright',
        username: 'alexw',
        email: 'alex.wright@example.com',
        password: 'password123',
        gradeLevel: 'Secondary School (Grade 10)',
        learningMode: 'Online & Home Hybrid',
        subjects: ['Mathematics', 'Physics'],
        registeredAt: new Date().toISOString()
      },
      {
        fullName: 'Sophia Martinez',
        username: 'sophiam',
        email: 'sophia.m@example.com',
        password: 'password123',
        gradeLevel: 'Primary School (Grade 5)',
        learningMode: 'Home Private Tutoring',
        subjects: ['English Language', 'Sciences'],
        registeredAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultStudents));
  }
}

// Get all registered students
export function getRegisteredUsers() {
  initAuthStore();
  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

// Register a new student
export function registerStudent(studentData) {
  const users = getRegisteredUsers();
  
  // Check if username or email already exists
  const existingUser = users.find(
    u => u.email.toLowerCase() === studentData.email.toLowerCase() ||
         u.username.toLowerCase() === studentData.username.toLowerCase()
  );

  if (existingUser) {
    if (existingUser.email.toLowerCase() === studentData.email.toLowerCase()) {
      return { success: false, message: 'A student account with this email address already exists.' };
    }
    return { success: false, message: 'This username is already taken. Please choose another.' };
  }

  const newUser = {
    fullName: studentData.fullName.trim(),
    username: studentData.username.trim().toLowerCase(),
    email: studentData.email.trim().toLowerCase(),
    password: studentData.password,
    gradeLevel: studentData.gradeLevel || 'Secondary School',
    learningMode: studentData.learningMode || 'Online Virtual Tutoring',
    subjects: studentData.subjects || ['General Studies'],
    registeredAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // Automatically log in the registered user and set session
  loginUser(newUser.email, newUser.password);

  return { success: true, user: newUser, message: 'Registration successful! Access granted to your Student Portal.' };
}

// Log in student using email OR username
export function loginUser(emailOrUsername, password) {
  const users = getRegisteredUsers();
  const query = emailOrUsername.trim().toLowerCase();

  const found = users.find(
    u => (u.email.toLowerCase() === query || u.username.toLowerCase() === query) && u.password === password
  );

  if (!found) {
    return { success: false, message: 'Invalid email/username or password. Please check your credentials or register.' };
  }

  // Set session
  const sessionData = {
    fullName: found.fullName,
    username: found.username,
    email: found.email,
    gradeLevel: found.gradeLevel,
    learningMode: found.learningMode,
    subjects: found.subjects,
    loginTime: new Date().toISOString()
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  return { success: true, user: sessionData };
}

// Check logged in user session
export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Logout
export function logoutUser() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  window.location.href = 'login.html';
}

// Access Guard for Dashboard
export function requireAuth() {
  const current = getCurrentSession();
  if (!current) {
    // Save intended destination
    sessionStorage.setItem('gpt_redirect_reason', 'Please register or login with your email/username to access the Online Student Portal.');
    window.location.href = 'login.html';
    return null;
  }
  return current;
}
