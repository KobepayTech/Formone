import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService, tokenStore, type AuthUser, type UserRole } from '@/lib/api';

const USER_KEY = 'erp_user';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loginParent: (email: string, password: string) => Promise<AuthUser>;
  registerParent: (payload: Record<string, unknown>) => Promise<AuthUser>;
  loginVendor: (vendorId: string, pin: string) => Promise<AuthUser>;
  loginSchool: (schoolCode: string, boardType: string, adminId: string, password: string) => Promise<AuthUser>;
  loginAdmin: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  if (!tokenStore.access) return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  // Keep the user in sync if tokens are cleared in another tab.
  useEffect(() => {
    const onStorage = () => setUser(readStoredUser());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const persist = (nextUser: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const value = useMemo<AuthContextValue>(() => {
    const buildUser = (id: string, email: string, role: UserRole): AuthUser => ({ id, email, role });

    return {
      user,
      isAuthenticated: !!user,
      loginParent: async (email, password) => {
        const res = await authService.login(email, password, 'parent');
        tokenStore.set(res.tokens);
        const u = res.user;
        persist(u);
        return u;
      },
      registerParent: async (payload) => {
        const res = await authService.register(payload);
        tokenStore.set(res.tokens);
        const u = res.user;
        persist(u);
        return u;
      },
      loginAdmin: async (email, password) => {
        const res = await authService.login(email, password, 'platform_admin');
        tokenStore.set(res.tokens);
        const u = res.user;
        persist(u);
        return u;
      },
      loginVendor: async (vendorId, pin) => {
        const res = await authService.vendorLogin(vendorId, pin);
        tokenStore.set(res.tokens);
        const u = buildUser(res.vendor.id, res.vendor.vendorId, 'vendor');
        persist(u);
        return u;
      },
      loginSchool: async (schoolCode, boardType, adminId, password) => {
        const res = await authService.schoolLogin(schoolCode, boardType, adminId, password);
        tokenStore.set(res.tokens);
        const u = buildUser(res.admin.id, res.school.code, 'school_admin');
        persist(u);
        return u;
      },
      logout: async () => {
        await authService.logout();
        localStorage.removeItem(USER_KEY);
        setUser(null);
      },
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
