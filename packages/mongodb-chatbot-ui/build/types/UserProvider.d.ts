import { ReactNode } from "react";
import { User } from "./useUser";
export declare const UserContext: import("react").Context<User | undefined>;
type UserProviderProps = {
    children: ReactNode;
    user?: User;
};
export declare function UserProvider({ children, user }: UserProviderProps): import("react/jsx-runtime").JSX.Element;
export {};
