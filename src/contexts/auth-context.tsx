
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, updateProfile, User as FirebaseUser } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import type { Author } from '@/lib/data';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  }) => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);

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
    };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Author | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserFromFirestore = async (fbUser: FirebaseUser) => {
    const userRef = doc(db, 'users', fbUser.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
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

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;

    // Check if user exists in firestore, if not create them
    const userRef = doc(db, 'users', fbUser.uid);
    const userDoc = await getDoc(userRef);
    let firestoreData;
    if (!userDoc.exists()) {
        firestoreData = {
            name: fbUser.displayName,
            email: fbUser.email,
            avatar: fbUser.photoURL,
        };
        await setDoc(userRef, firestoreData);
    } else {
        firestoreData = userDoc.data();
    }

    setFirebaseUser(fbUser);
    setUser(formatUser(fbUser, firestoreData));
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setFirebaseUser(null);
    setUser(null);
  }, []);

  const updateUserProfile = useCallback(async (updates: { 
      name?: string; 
      avatar?: string;
      bio?: string;
      instagramUrl?: string;
      signature?: string;
  }) => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    
    await updateProfile(auth.currentUser, {
        displayName: updates.name,
    });
    
    const userRef = doc(db, 'users', auth.currentUser.uid);
    
    // We construct a new object with only the fields that are being updated
    // to avoid accidentally wiping fields.
    const updateData: { [key: string]: any } = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.avatar) updateData.avatar = updates.avatar;
    if (updates.bio) updateData.bio = updates.bio;
    if (updates.instagramUrl) updateData.instagramUrl = updates.instagramUrl;
    if (updates.signature) updateData.signature = updates.signature;
    
    await setDoc(userRef, updateData, { merge: true });

    // Force a refresh of the user object to get the latest profile
    await auth.currentUser.reload();
    const updatedFbUser = auth.currentUser;
    if (updatedFbUser) {
        const firestoreData = await fetchUserFromFirestore(updatedFbUser);
        setFirebaseUser(updatedFbUser);
        setUser(formatUser(updatedFbUser, firestoreData));
    }
  }, []);

  const isAdmin = user?.email === 'yashrajverma916@gmail.com';

  const value = { user, firebaseUser, isAdmin, signIn, signOut, updateUserProfile, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
