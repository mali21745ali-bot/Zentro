/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, testConnection } from '../lib/firebase.ts';
import { UserProfile, CreditTransaction, AppNotification, TransactionType } from '../types.ts';

// User email specified by system runtime & prompt for bootstrapped super administrator
export const BOOTSTRAP_ADMIN_EMAIL = 'mali21745ali@gmail.com';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  notifications: AppNotification[];
  unreadNotificationCount: number;
  addDemoCredits: (amount: number, type: TransactionType, description: string, referenceId?: string) => Promise<boolean>;
  updateUserDisplayName: (name: string, photoURL?: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  sendResetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Check connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Fetch or initialize profile
  const fetchProfile = async (fbUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      // Check admin status: either matching bootstrap email or present in admins collection
      let userIsAdmin = fbUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
      if (!userIsAdmin) {
        try {
          const adminRef = doc(db, 'admins', fbUser.uid);
          const adminSnap = await getDoc(adminRef);
          if (adminSnap.exists()) {
            userIsAdmin = true;
          }
        } catch {
          // If security rules or network deny, keep false
        }
      }
      setIsAdmin(userIsAdmin);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        // Keep role in sync if admin
        if (userIsAdmin && data.role !== 'admin') {
          await updateDoc(userRef, { role: 'admin' });
          data.role = 'admin';
        }
        setUserProfile(data);
      } else {
        // Initial setup for new user
        const newProfile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Zentro Explorer',
          photoURL: fbUser.photoURL || undefined,
          demoCredits: 100, // Welcome bonus practice demo credits
          totalEarned: 100,
          totalSpent: 0,
          tasksCompleted: 0,
          gamesPlayed: 0,
          role: userIsAdmin ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
          disabled: false,
        };

        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);

        // Record welcome transaction
        await addDoc(collection(db, 'transactions'), {
          userId: fbUser.uid,
          type: 'task_reward',
          amount: 100,
          description: 'Welcome Bonus: Platform Starter Demo Credits',
          timestamp: new Date().toISOString(),
        });

        // Add welcome notification
        await addDoc(collection(db, 'notifications'), {
          userId: fbUser.uid,
          title: 'Welcome to Zentro!',
          message: '100 Demo Credits added to your practice wallet. Try tasks and games to earn more.',
          type: 'wallet',
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to fetch/create user profile:', err);
      // Fallback local representation to avoid blocking the user
      const fallbackProfile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'Zentro Explorer',
        photoURL: fbUser.photoURL || undefined,
        demoCredits: 100,
        totalEarned: 100,
        totalSpent: 0,
        tasksCompleted: 0,
        gamesPlayed: 0,
        role: fbUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
      };
      setUserProfile(fallbackProfile);
      setIsAdmin(fbUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase());
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to user notifications in realtime
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const list: AppNotification[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<AppNotification, 'id'>) });
          });
          // Sort descending by timestamp
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setNotifications(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'notifications');
        }
      );

      return () => unsub();
    } catch (err) {
      console.warn('Realtime notifications listener error:', err);
    }
  }, [currentUser]);

  // Add demo credits to wallet safely
  const addDemoCredits = async (
    amount: number,
    type: TransactionType,
    description: string,
    referenceId?: string
  ): Promise<boolean> => {
    if (!currentUser || !userProfile) return false;

    try {
      const newBalance = Math.max(0, userProfile.demoCredits + amount);
      const newTotalEarned = amount > 0 ? userProfile.totalEarned + amount : userProfile.totalEarned;
      const newTotalSpent = amount < 0 ? userProfile.totalSpent + Math.abs(amount) : userProfile.totalSpent;

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        demoCredits: newBalance,
        totalEarned: newTotalEarned,
        totalSpent: newTotalSpent,
        updatedAt: new Date().toISOString(),
      });

      // Add transaction audit record
      const transactionData: Omit<CreditTransaction, 'id'> = {
        userId: currentUser.uid,
        type,
        amount,
        description,
        referenceId: referenceId || undefined,
        timestamp: new Date().toISOString(),
      };
      await addDoc(collection(db, 'transactions'), transactionData);

      // Create notification for credit update
      await addDoc(collection(db, 'notifications'), {
        userId: currentUser.uid,
        title: amount >= 0 ? `+${amount} Demo Credits Earned` : `${amount} Demo Credits Adjusted`,
        message: description,
        type: type === 'task_reward' ? 'task' : type === 'quiz_reward' ? 'quiz' : type === 'game_reward' ? 'game' : 'wallet',
        read: false,
        createdAt: new Date().toISOString(),
      });

      // Update local state
      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              demoCredits: newBalance,
              totalEarned: newTotalEarned,
              totalSpent: newTotalSpent,
            }
          : null
      );
      return true;
    } catch (err) {
      console.error('Failed to add demo credits:', err);
      return false;
    }
  };

  const updateUserDisplayName = async (name: string, photoURL?: string) => {
    if (!currentUser || !userProfile) return;
    try {
      await updateProfile(currentUser, {
        displayName: name,
        photoURL: photoURL || currentUser.photoURL,
      });

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: name,
        photoURL: photoURL || userProfile.photoURL,
        updatedAt: new Date().toISOString(),
      });

      setUserProfile((prev) =>
        prev ? { ...prev, displayName: name, photoURL: photoURL || prev.photoURL } : null
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      const notifRef = doc(db, 'notifications', id);
      await updateDoc(notifRef, { read: true });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(
        unread.map((n) => updateDoc(doc(db, 'notifications', n.id), { read: true }))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn('Failed to mark all notifications read:', err);
    }
  };

  const clearNotifications = async () => {
    // Optimistic clear in state
    setNotifications([]);
  };

  const sendResetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resendVerificationEmail = async () => {
    if (currentUser) {
      await sendEmailVerification(currentUser);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setIsAdmin(false);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser);
    }
  };

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        notifications,
        unreadNotificationCount,
        addDemoCredits,
        updateUserDisplayName,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        sendResetPassword,
        resendVerificationEmail,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
