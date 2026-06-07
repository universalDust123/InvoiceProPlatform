"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { authApi } from "./api";
import {
  getStoredUser,
  getStoredToken,
  storeAuth,
  clearAuth,
  User,
} from "./auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    tenantId?: string
  ) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string,
    tenantId?: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  // IMPORTANT
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Restore auth from localStorage
  useEffect(() => {
    try {
      const storedUser = getStoredUser();
      const token = getStoredToken();

      if (storedUser && token) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Failed to restore auth:", error);
      clearAuth();
    } finally {
      // IMPORTANT
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string, tenantId?: string) => {
      setLoading(true);

      try {
        const response = await authApi.login({
          email,
          password,
          tenantId,
        });

        const {
          accessToken: token,
          user: userData,
        } = response.data;

        storeAuth(token, userData);

        setUser(userData);

        toast.success("Login successful!");

        router.push("/dashboard");
      } catch (error: any) {
        const message =
          error.response?.data?.message || "Login failed";

        toast.error(message);

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const register = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
      tenantId?: string
    ) => {
      setLoading(true);

      try {
        const response = await authApi.register({
          fullName,
          email,
          password,
          tenantId,
        });

        const {
          accessToken: token,
          user: userData,
        } = response.data;

        storeAuth(token, userData);

        setUser(userData);

        toast.success("Registration successful!");

        router.push("/dashboard");
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          "Registration failed";

        toast.error(message);

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    clearAuth();

    setUser(null);

    router.push("/auth/login");

    toast.success("Logged out successfully");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuthContext must be used within AuthProvider"
    );
  }

  return context;
}