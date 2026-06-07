export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  tenantId: string;
}

export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    const user = localStorage.getItem("user");

    // Handle invalid values
    if (
      !user ||
      user === "undefined" ||
      user === "null"
    ) {
      return null;
    }

    return JSON.parse(user);
  } catch (error) {
    console.error("Failed to parse stored user:", error);

    localStorage.removeItem("user");

    return null;
  }
};

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const isAuthenticated = (): boolean => {
  return !!getStoredToken();
};

export const storeAuth = (token: string, user: User) => {
  // console.log("STORING TOKEN:", token);
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
