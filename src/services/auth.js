import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

const getAuthErrorMessage = (error) => {
  const errorCode = error.code || '';
  
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password sign up is not enabled. Please contact support.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/invalid-login-credentials': 'Invalid email or password. Please try again.',
    
    'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
    'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups for this site.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
    
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/timeout': 'Request timed out. Please try again.',
    
    'auth/missing-email': 'Please enter your email address.',
    'auth/user-not-found': 'No account found with this email address.',
    
    'auth/internal-error': 'An unexpected error occurred. Please try again.',
    'auth/requires-recent-login': 'Please sign in again to continue.',
  };

  return errorMessages[errorCode] || error.message || 'An unexpected error occurred. Please try again.';
};

export const signUp = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(result.user);
    return result.user;
  } catch (error) {
    console.error('Sign up error:', error.code, error.message);
    throw new Error(getAuthErrorMessage(error));
  }
};

export const signIn = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Sign in error:', error.code, error.message);
    throw new Error(getAuthErrorMessage(error));
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign in error:', error.code, error.message);
    throw new Error(getAuthErrorMessage(error));
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error.code, error.message);
    throw new Error('Failed to sign out. Please try again.');
  }
};

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback, (error) => {
    console.error('Auth state change error:', error.code, error.message);
  });
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error('Password reset error:', error.code, error.message);
    throw new Error(getAuthErrorMessage(error));
  }
};

export const resendVerificationEmail = async () => {
  try {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      return true;
    }
    throw new Error('No user logged in');
  } catch (error) {
    console.error('Verification email error:', error.code, error.message);
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please wait a few minutes before trying again.');
    }
    throw new Error(getAuthErrorMessage(error));
  }
};

export const updateUserProfile = async (displayName) => {
  try {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });
      return auth.currentUser;
    }
    throw new Error('No user logged in');
  } catch (error) {
    console.error('Update profile error:', error.code, error.message);
    throw new Error(getAuthErrorMessage(error));
  }
};
