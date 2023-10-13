import { useContext } from "react";
import { LinkDataContext } from "./LinkDataProvider";

export function useLinkData() {
  const contextLinkData = useContext(LinkDataContext);
  return contextLinkData;
}
