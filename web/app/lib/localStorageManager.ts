import { useEffect, useState } from "react";

export const USER_SESSION_KEY = "userSession";

export type UserSession = {
  name: string;
  email: string;
  activeOrganizationId?: string;
  role?: string;
  organizationName?: string;
};

export function useUserSession() {
  const [state, setState] = useState<string | null>(null);

  useEffect(() => {
    setState(localStorage.getItem(USER_SESSION_KEY));
  }, [USER_SESSION_KEY]);

  return [state ? (JSON.parse(state) as UserSession) : null];
}

export const setUserSession = (userSession: UserSession) => {
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userSession));
};

export const removeUserSession = () => {
  localStorage.removeItem(USER_SESSION_KEY);
};
