import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { getAuthErrorMessage } from "./authErrors";
import { AuthContext } from "./AuthContext";
import type { AuthContextValue } from "./AuthContext";

const USER_NAME_KEY = "consattentia-user-name";
const WELCOME_COMPLETED_KEY = "consattentia-welcome-completed";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(auth !== null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;

    return onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
        setAuthError(null);
      },
      (error) => {
        setAuthError(getAuthErrorMessage(error));
        setLoading(false);
      },
    );
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Configure as variáveis do Firebase para continuar.");
    const credential = await signInWithEmailAndPassword(auth, email, password);
    if (credential.user.displayName) {
      localStorage.setItem(USER_NAME_KEY, credential.user.displayName);
    }
    localStorage.setItem(WELCOME_COMPLETED_KEY, "true");
    setAuthError(null);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    if (!auth) throw new Error("Configure as variáveis do Firebase para continuar.");
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    localStorage.setItem(USER_NAME_KEY, name);
    setAuthError(null);
  }, []);

  const logout = useCallback(async () => {
    if (auth) await signOut(auth);
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem(WELCOME_COMPLETED_KEY);
    setAuthError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, authError, login, register, logout }),
    [user, loading, authError, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
