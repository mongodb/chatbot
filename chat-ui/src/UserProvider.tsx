import { createContext, ReactNode } from "react";
import { User } from "./useUser";

export const UserContext = createContext<User | undefined>(undefined);

type UserProviderProps = {
  children: ReactNode;
  user?: User;
};

export function UserProvider({ children, user }: UserProviderProps) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
