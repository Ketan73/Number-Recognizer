import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const getStorageErrorMessage = (error) => {
  const errorCode = error.code || '';
  
  const errorMessages = {
    'permission-denied': 'You do not have permission to perform this action.',
    'unavailable': 'Service is temporarily unavailable. Please try again.',
    'not-found': 'The requested data was not found.',
    'already-exists': 'This entry already exists.',
    'resource-exhausted': 'Too many requests. Please try again later.',
    'failed-precondition': 'Operation failed. Please try again.',
    'aborted': 'Operation was cancelled. Please try again.',
    'deadline-exceeded': 'Request timed out. Please try again.',
    'unauthenticated': 'Please sign in to continue.',
  };

  return errorMessages[errorCode] || error.message || 'An unexpected error occurred. Please try again.';
};

const compressImage = (base64String, maxWidth = 400, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.onerror = () => reject(new Error('Failed to process image'));
    img.src = base64String;
  });
};

export const saveRecognition = async (userId, imageBase64, recognizedNumber) => {
  if (!userId) {
    throw new Error('Please sign in to save recognitions.');
  }

  if (!imageBase64) {
    throw new Error('No image to save.');
  }

  if (!recognizedNumber) {
    throw new Error('No recognized number to save.');
  }

  try {
    const compressedImage = await compressImage(imageBase64);
    
    const timestamp = Date.now();
    
    const docRef = await addDoc(collection(db, 'recognitions'), {
      userId,
      imageUrl: compressedImage,
      recognizedNumber,
      createdAt: serverTimestamp(),
      timestamp
    });
    
    return {
      id: docRef.id,
      imageUrl: compressedImage,
      recognizedNumber,
      timestamp
    };
  } catch (error) {
    console.error('Save recognition error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw new Error(getStorageErrorMessage(error));
  }
};

export const getHistory = async (userId) => {
  if (!userId) {
    throw new Error('Please sign in to view history.');
  }

  try {
    const q = query(
      collection(db, 'recognitions'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const history = [];
    
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return history;
  } catch (error) {
    console.error('Get history error:', error.code, error.message);
    
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      throw new Error('History feature is being set up. Please try again in a few minutes.');
    }
    
    throw new Error(getStorageErrorMessage(error));
  }
};
