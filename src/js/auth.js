/* Golden Path Tutors - Authentication & Student Access System */

const USERS_STORAGE_KEY = 'gpt_registered_students_v1';
const SESSION_STORAGE_KEY = 'gpt_active_student_session_v1';
const VALID_ACCESS_CODES_KEY = 'gpt_admin_access_codes_v1';

// Seed initial access codes and sample students if none exist
export function initAuthStore() {
  if (!localStorage.getItem(VALID_ACCESS_CODES_KEY)) {
    // Valid Admin Registration Codes (Pre-generated for Admin distribution)
    const initialCodes = ['GPT-2026-NIG', 'GPT-GOLD-884', 'GPT-STUDENT-99', 'GPT-VIP-777'];
    localStorage.setItem(VALID_ACCESS_CODES_KEY, JSON.stringify(initialCodes));
  }

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
        accessCodeUsed: 'GPT-2026-NIG',
        isBlocked: false,
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
        accessCodeUsed: 'GPT-GOLD-884',
        isBlocked: false,
        registeredAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultStudents));
  }
}

// Get valid admin access codes
export function getValidAccessCodes() {
  initAuthStore();
  try {
    return JSON.parse(localStorage.getItem(VALID_ACCESS_CODES_KEY)) || [];
  } catch (e) {
    return ['GPT-2026-NIG', 'GPT-GOLD-884'];
  }
}

// Add a new Admin Access Code
export function addAdminAccessCode(newCode) {
  const codes = getValidAccessCodes();
  const formatted = newCode.trim().toUpperCase();
  if (!codes.includes(formatted)) {
    codes.push(formatted);
    localStorage.setItem(VALID_ACCESS_CODES_KEY, JSON.stringify(codes));
    return { success: true, message: `Access Code "${formatted}" generated successfully.` };
  }
  return { success: false, message: 'This Access Code already exists.' };
}

// Validate Access Code
export function verifyAccessCode(code) {
  const codes = getValidAccessCodes();
  const formatted = (code || '').trim().toUpperCase();
  return codes.includes(formatted);
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

// Toggle Block/Unblock Live Class Access for a Student
export function toggleBlockStudentStatus(usernameOrEmail) {
  const users = getRegisteredUsers();
  const query = usernameOrEmail.trim().toLowerCase();
  const studentIndex = users.findIndex(u => u.username.toLowerCase() === query || u.email.toLowerCase() === query);

  if (studentIndex === -1) {
    return { success: false, message: 'Student account not found.' };
  }

  users[studentIndex].isBlocked = !users[studentIndex].isBlocked;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // If currently active session matches blocked user, update session
  const currentSession = getCurrentSession();
  if (currentSession && (currentSession.username.toLowerCase() === query || currentSession.email.toLowerCase() === query)) {
    currentSession.isBlocked = users[studentIndex].isBlocked;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentSession));
  }

  const statusText = users[studentIndex].isBlocked ? 'BLOCKED from live classes' : 'UNBLOCKED / Access restored';
  return { success: true, isBlocked: users[studentIndex].isBlocked, message: `Student ${users[studentIndex].fullName} is now ${statusText}.` };
}

// Register a new student (Requires valid Admin Access Code)
export function registerStudent(studentData) {
  const users = getRegisteredUsers();
  
  // 1. Verify Unique Admin Access Code
  const accessCode = (studentData.accessCode || '').trim().toUpperCase();
  if (!verifyAccessCode(accessCode)) {
    return { 
      success: false, 
      message: 'Invalid Admin Access Code. Please request a unique registration code from your Golden Path Academic Administrator.' 
    };
  }

  // 2. Check if username or email already exists
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
    accessCodeUsed: accessCode,
    isBlocked: false,
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
    accessCodeUsed: found.accessCodeUsed,
    isBlocked: !!found.isBlocked,
    loginTime: new Date().toISOString()
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  return { success: true, user: sessionData };
}

// Check logged in user session (refreshed against users DB for block status)
export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);

    // Sync live block status from users DB
    const users = getRegisteredUsers();
    const dbUser = users.find(u => u.username.toLowerCase() === session.username.toLowerCase() || u.email.toLowerCase() === session.email.toLowerCase());
    if (dbUser) {
      session.isBlocked = !!dbUser.isBlocked;
    }
    return session;
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
    sessionStorage.setItem('gpt_redirect_reason', 'Please register or login with your email/username to access the Online Student Portal.');
    window.location.href = 'login.html';
    return null;
  }
  return current;
}
