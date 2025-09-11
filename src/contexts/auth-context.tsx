
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, updateProfile, User as FirebaseUser, setPersistence, browserLocalPersistence, Auth } from 'firebase/auth';
import { db } from '@/lib/firebase';
import type { Author } from '@/lib/data';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getClientFirebaseConfig } from '@/app/actions/config-actions';
import { FirebaseOptions, initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

interface AuthContextType {
  user: Author | null;
  firebaseUser: FirebaseUser | null;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: { 
      name?: string; 
      avatar?: string;
      bio?: string;
      instagramUrl?: string;
      signature?: string;
      showEmail?: boolean;
  }) => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A mapping from Firebase User + Firestore data to our app's Author type
const formatUser = (user: FirebaseUser, firestoreData?: any): Author => {
    return {
        id: user.uid,
        name: firestoreData?.name || user.displayName || "No Name",
        email: user.email || "no-email@example.com",
        avatar: firestoreData?.avatar || user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
        bio: firestoreData?.bio,
        instagramUrl: firestoreData?.instagramUrl,
        signature: firestoreData?.signature,
        showEmail: firestoreData?.showEmail || false,
        followers: firestoreData?.followers || 0,
        following: firestoreData?.following || 0,
    };
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Author | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientAuth, setClientAuth] = useState<Auth | null>(null);

  useEffect(() => {
    const initializeClientAuth = async () => {
      const clientConfig = await getClientFirebaseConfig();
      // Ensure config has projectId before initializing
      if (clientConfig && clientConfig.projectId) {
        const clientApp = !getApps().length ? initializeApp(clientConfig) : getApp();
        const authInstance = getAuth(clientApp);
        setClientAuth(authInstance);

        const unsubscribe = onAuthStateChanged(authInstance, async (fbUser) => {
          if (fbUser) {
            setFirebaseUser(fbUser);
            const firestoreData = await fetchUserFromFirestore(fbUser);
            setUser(formatUser(fbUser, firestoreData));
          } else {
            setFirebaseUser(null);
            setUser(null);
          }
          setLoading(false);
        });
        
        return unsubscribe;
      } else {
        // If no config, stop loading but don't set up auth
        setLoading(false);
      }
    };
    
    const unsubscribePromise = initializeClientAuth();

    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, []);
  
  const fetchUserFromFirestore = async (fbUser: FirebaseUser) => {
    const userRef = doc(db, 'users', fbUser.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
    // If no document, create one
    const newUser = {
        name: fbUser.displayName,
        email: fbUser.email,
        avatar: fbUser.photoURL,
        showEmail: false,
        followers: 0,
        following: 0,
    };
    await setDoc(userRef, newUser, { merge: true });
    return newUser;
  }

  const signIn = useCallback(async () => {
    if (!clientAuth) {
      console.error("Client auth not initialized");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
        await setPersistence(clientAuth, browserLocalPersistence);
        await signInWithPopup(clientAuth, provider);
        // The onAuthStateChanged listener will handle the user state update.
    } catch (error) {
        // Silently handle popup closed by user, re-throw other errors
        if ((error as any).code !== 'auth/popup-closed-by-user' && (error as any).code !== 'auth/cancelled-popup-request') {
            console.error('Sign in failed:', error);
            throw error;
        }
    }
  }, [clientAuth]);

  const signOut = useCallback(async () => {
    if (!clientAuth) return;
    await firebaseSignOut(clientAuth);
    setFirebaseUser(null);
    setUser(null);
  }, [clientAuth]);

  const updateUserProfile = useCallback(async (updates: { 
      name?: string; 
      avatar?: string;
      bio?: string;
      instagramUrl?: string;
      signature?: string;
      showEmail?: boolean;
  }) => {
    if (!clientAuth?.currentUser) throw new Error("Not authenticated");
    
    // We construct a new object with only the fields that are being updated
    // to avoid accidentally wiping fields.
    const updateData: { [key: string]: any } = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.avatar) updateData.avatar = updates.avatar;
    if (updates.bio) updateData.bio = updates.bio;
    if (updates.instagramUrl) updateData.instagramUrl = updates.instagramUrl;
    if (updates.signature) updateData.signature = updates.signature;
    if (updates.showEmail !== undefined) updateData.showEmail = updates.showEmail;

    if (Object.keys(updateData).length > 0) {
        const userRef = doc(db, 'users', clientAuth.currentUser.uid);
        await setDoc(userRef, updateData, { merge: true });
    }

    // Force a refresh of the user object to get the latest profile
    const firestoreData = await fetchUserFromFirestore(clientAuth.currentUser);
    setUser(formatUser(clientAuth.currentUser, firestoreData));
  }, [clientAuth]);

  const isAdmin = user?.email === 'yashrajverma916@gmail.com';

  const value = { user, firebaseUser, isAdmin, signIn, signOut, updateUserProfile, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
