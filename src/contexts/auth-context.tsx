"use client";

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, updateProfile, User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase';
import type { Author } from '@/lib/data';

interface AuthContextType {
  user: Author | null;
  firebaseUser: FirebaseUser | null;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: { name?: string; avatar?: string }) => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);

// A mapping from Firebase User to our app's Author type
const formatUser = (user: FirebaseUser): Author => {
    return {
        id: user.uid,
        name: user.displayName || "No Name",
        email: user.email || "no-email@example.com",
        avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`
    };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Author | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        setUser(formatUser(fbUser));
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    setFirebaseUser(result.user);
    setUser(formatUser(result.user));
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setFirebaseUser(null);
    setUser(null);
  }, []);

  const updateUserProfile = useCallback(async (updates: { name?: string; avatar?: string }) => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    
    await updateProfile(auth.currentUser, {
        displayName: updates.name,
        photoURL: updates.avatar,
    });
    
    // Force a refresh of the user object to get the latest profile
    await auth.currentUser.reload();
    const updatedFbUser = auth.currentUser;
    if (updatedFbUser) {
      setFirebaseUser(updatedFbUser);
      setUser(formatUser(updatedFbUser));
    }
  }, []);

  const isAdmin = user?.email === 'yashrajverma916@gmail.com';

  const value = { user, firebaseUser, isAdmin, signIn, signOut, updateUserProfile, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
