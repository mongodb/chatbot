import { createContext, useContext } from "react";

export type LinkData = {
  tck?: string;
};

const LinkDataContext = createContext<LinkData>({});

export type LinkDataProviderProps = LinkData & {
  children: React.ReactNode;
};

export function LinkDataProvider({
  children,
  ...linkData
}: LinkDataProviderProps) {
  return (
    <LinkDataContext.Provider value={linkData}>
      {children}
    </LinkDataContext.Provider>
  );
}

export function useLinkData() {
  const contextLinkData = useContext(LinkDataContext);
  return contextLinkData;
}
