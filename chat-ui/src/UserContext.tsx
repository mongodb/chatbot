import { useContext, createContext, ReactNode } from "react";
import { User } from "./types";

const UserContext = createContext<User | undefined>(undefined);

type UserProviderProps = {
  children: ReactNode;
  user?: User;
};

export function UserProvider({ children, user }: UserProviderProps) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
