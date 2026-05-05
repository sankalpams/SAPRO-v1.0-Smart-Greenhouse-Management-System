import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

// Demo mode authentication
const isDemoMode = !auth || !db;

// Sign in with email and password
export const signIn = async (email, password) => {
  if (isDemoMode) {
    // Demo mode authentication
    if (email === 'admin@demo.com' && password === 'admin123') {
      const userData = {
        userId: 'demo-admin-uid',
        name: 'Demo Admin',
        email: 'admin@demo.com',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('demoUser', JSON.stringify(userData));
      // Dispatch custom event to notify App.js of localStorage change
      window.dispatchEvent(new Event('localStorageChange'));
      return { 
        success: true, 
        user: { 
          uid: 'demo-admin-uid',
          email: 'admin@demo.com',
          displayName: 'Demo Admin'
        } 
      };
    }
    if (email === 'staff@demo.com' && password === 'staff123') {
      const userData = {
        userId: 'demo-staff-uid',
        name: 'Demo Staff',
        email: 'staff@demo.com',
        role: 'staff',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('demoUser', JSON.stringify(userData));
      // Dispatch custom event to notify App.js of localStorage change
      window.dispatchEvent(new Event('localStorageChange'));
      return { 
        success: true, 
        user: { 
          uid: 'demo-staff-uid',
          email: 'staff@demo.com',
          displayName: 'Demo Staff'
        } 
      };
    }
    return { success: false, error: 'Invalid credentials. Use admin@demo.com/admin123 or staff@demo.com/staff123' };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Create new user account
export const signUp = async (email, password, name, role = 'staff') => {
  if (isDemoMode) {
    // Demo mode - simulate successful signup
    const userId = `demo-${Date.now()}`;
    const userData = {
      userId: userId,
      name: name,
      email: email,
      role: role,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('demoUser', JSON.stringify(userData));
    // Dispatch custom event to notify App.js of localStorage change
    window.dispatchEvent(new Event('localStorageChange'));
    return { 
      success: true, 
      user: { 
        uid: userId,
        email: email,
        displayName: name
      } 
    };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    
    // Save user data to Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      userId: userCredential.user.uid,
      name: name,
      email: email,
      role: role,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign out
export const logout = async () => {
  if (isDemoMode) {
    localStorage.removeItem('demoUser');
    // Dispatch custom event to notify App.js of localStorage change
    window.dispatchEvent(new Event('localStorageChange'));
    return { success: true };
  }

  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Reset password
export const resetPassword = async (email) => {
  if (isDemoMode) {
    return { success: true };
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user data from Firestore
export const getUserData = async (userId) => {
  if (isDemoMode) {
    // Demo mode - return mock user data
    if (userId === 'demo-admin-uid') {
      return { 
        success: true, 
        data: {
          userId: 'demo-admin-uid',
          name: 'Demo Admin',
          email: 'admin@demo.com',
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      };
    }
    if (userId === 'demo-staff-uid') {
      return { 
        success: true, 
        data: {
          userId: 'demo-staff-uid',
          name: 'Demo Staff',
          email: 'staff@demo.com',
          role: 'staff',
          createdAt: new Date().toISOString()
        }
      };
    }
    return { success: false, error: 'User data not found' };
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: 'User data not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};
