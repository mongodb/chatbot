import { createContext } from "react";

export type LinkData = {
  tck?: string;
};

export const LinkDataContext = createContext<LinkData>({});

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
