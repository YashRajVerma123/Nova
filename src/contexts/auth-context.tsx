
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { db as serverDb } from '@/lib/firebase-server';
import type { Author } from '@/lib/data';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getClientFirebaseConfig } from '@/app/actions/config-actions';
import { initializeClientApp } from '@/lib/firebase-client';

interface AuthContextType {
  user: Author | null;
  firebaseUser: FirebaseUser | null;
  auth: Auth | null;
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
  const [auth, setAuth] = useState<Auth | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserFromFirestore = async (fbUser: FirebaseUser) => {
    const userRef = doc(serverDb, 'users', fbUser.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
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
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const clientConfig = await getClientFirebaseConfig();
        if (clientConfig && clientConfig.projectId) {
          const { auth: authInstance } = initializeClientApp(clientConfig);
          setAuth(authInstance);

          const unsubscribe = onAuthStateChanged(authInstance, async (fbUser) => {
            if (fbUser) {
              setFirebaseUser(fbUser);
              const firestoreData = await fetchUserFromFirestore(fbUser);
              setUser(formatUser(fbUser, firestoreData));
            } else {
              setFirebaseUser(null);
              setUser(null);
            }
            // Set loading to false only after the first auth state has been determined.
            setLoading(false);
          });
          
          return unsubscribe;
        } else {
          // If no config, stop loading but don't set up auth
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setLoading(false);
      }
    };
    
    const unsubscribePromise = initializeAuth();

    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, []);

  const signIn = useCallback(async () => {
    if (!auth) {
      console.error("Client auth not initialized");
      throw new Error("Authentication service is not available.");
    }
    const provider = new GoogleAuthProvider();
    try {
        await setPersistence(auth, browserLocalPersistence);
        await signInWithPopup(auth, provider);
    } catch (error) {
        if ((error as any).code !== 'auth/popup-closed-by-user' && (error as any).code !== 'auth/cancelled-popup-request') {
            console.error('Sign in failed:', error);
            throw error;
        }
    }
  }, [auth]);

  const signOut = useCallback(async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setFirebaseUser(null);
    setUser(null);
  }, [auth]);

  const updateUserProfile = useCallback(async (updates: { 
      name?: string; 
      avatar?: string;
      bio?: string;
      instagramUrl?: string;
      signature?: string;
      showEmail?: boolean;
  }) => {
    if (!auth?.currentUser) throw new Error("Not authenticated");
    
    const updateData: { [key: string]: any } = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.avatar) updateData.avatar = updates.avatar;
    if (updates.bio) updateData.bio = updates.bio;
    if (updates.instagramUrl) updateData.instagramUrl = updates.instagramUrl;
    if (updates.signature) updateData.signature = updates.signature;
    if (updates.showEmail !== undefined) updateData.showEmail = updates.showEmail;

    if (Object.keys(updateData).length > 0) {
        const userRef = doc(serverDb, 'users', auth.currentUser.uid);
        await setDoc(userRef, updateData, { merge: true });
    }

    const firestoreData = await fetchUserFromFirestore(auth.currentUser);
    setUser(formatUser(auth.currentUser, firestoreData));
  }, [auth]);

  const isAdmin = user?.email === 'yashrajverma916@gmail.com';

  const value = { user, firebaseUser, auth, isAdmin, signIn, signOut, updateUserProfile, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
