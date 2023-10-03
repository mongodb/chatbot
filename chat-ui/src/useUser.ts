import { useContext } from "react";
import { UserContext } from "./UserProvider";

export type User = {
  name: string;
};

export function useUser() {
  return useContext(UserContext);
}
