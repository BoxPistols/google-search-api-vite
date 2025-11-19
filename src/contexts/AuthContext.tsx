// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, firebaseEnabled } from '../services/firebase';
import { AuthUser, UserType, OWNER_EMAIL } from '../types/user';
import { setCurrentUserType } from '../utils/userSettings';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getUserType: () => UserType;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ユーザータイプを判定
  const determineUserType = (firebaseUser: User | null): UserType => {
    if (!firebaseUser) return 'guest';
    if (firebaseUser.email === OWNER_EMAIL) return 'owner';
    return 'user';
  };

  // Googleログイン
  const signInWithGoogle = async () => {
    if (!firebaseEnabled || !auth || !googleProvider) {
      alert(
        'Firebase認証が設定されていません。\n' +
          'FIREBASE_SETUP.mdを参照して、Firebase設定を完了してください。'
      );
      throw new Error('Firebase not configured');
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  // ログアウト
  const signOut = async () => {
    if (!firebaseEnabled || !auth) {
      throw new Error('Firebase not configured');
    }

    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  };

  // 現在のユーザータイプを取得
  const getUserType = (): UserType => {
    return user?.userType || 'guest';
  };

  // 認証状態の監視
  useEffect(() => {
    // Firebaseが設定されていない場合はゲストユーザーとして扱う
    if (!firebaseEnabled || !auth) {
      setUser(null);
      setCurrentUserType('guest');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      if (firebaseUser) {
        const userType = determineUserType(firebaseUser);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          userType,
        });
        // グローバルなユーザータイプを更新
        setCurrentUserType(userType);
      } else {
        setUser(null);
        // 未ログイン状態ではguestに設定
        setCurrentUserType('guest');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    getUserType,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
