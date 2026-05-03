"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { subscribeToAuth } from "@/lib/auth";
import { syncUserOnLogin } from "@/lib/userSync";

interface AuthCtx {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const prevUid = useRef<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToAuth((u) => {
      setUser(u);
      setLoading(false);

      // Sync on login (not on every re-render, only when uid changes)
      if (u && u.uid !== prevUid.current) {
        prevUid.current = u.uid;
        syncUserOnLogin(
          u.uid,
          u.displayName ?? u.email ?? "Fan",
          u.email,
          u.photoURL,
        ).catch(console.warn);
      } else if (!u) {
        prevUid.current = null;
      }
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
