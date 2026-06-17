// Client-side mock authentication system

const ADMIN_CREDENTIALS = {
  email: "mehdi@exemple.fr",
  password: "poiuytreza4U!",
};

const SESSION_KEY = "trinquat_admin_session";

export interface AdminSession {
  id: string;
  email: string;
  role: string;
  loggedInAt: string;
}

export const loginAdmin = async (email: string, password: string): Promise<AdminSession | null> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const session: AdminSession = {
      id: "admin-1",
      email: email,
      role: "admin",
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  return null;
};

export const getAdminSession = (): AdminSession | null => {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const logoutAdmin = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const isAdminAuthenticated = (): boolean => {
  return getAdminSession() !== null;
};
