import { createContext, useContext, useMemo, useState } from "react";

export type HotkeyContextData = {
  hotkey: string | null;
  setHotkey: (hotkey: HotkeyContextData["hotkey"]) => void;
};

const defaultHotkeyContextData: HotkeyContextData = {
  hotkey: null,
  setHotkey: () => {
    // Do nothing by default
  },
};

const HotkeyContext = createContext<HotkeyContextData>(
  defaultHotkeyContextData
);

export function HotkeyContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hotkey, setHotkey] = useState<string | null>(null);
  const hotkeyContextData = useMemo(() => ({ hotkey, setHotkey }), [hotkey]);
  return (
    <HotkeyContext.Provider value={hotkeyContextData}>
      {children}
    </HotkeyContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useHotkeyContext() {
  return useContext(HotkeyContext);
}
