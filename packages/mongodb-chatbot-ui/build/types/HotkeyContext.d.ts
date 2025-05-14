export type HotkeyContextData = {
    hotkey: string | null;
    setHotkey: (hotkey: HotkeyContextData["hotkey"]) => void;
};
export declare function HotkeyContextProvider({ children, }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useHotkeyContext(): HotkeyContextData;
