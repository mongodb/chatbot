export type LinkData = {
    tck?: string;
};
export declare const LinkDataContext: import("react").Context<LinkData>;
export type LinkDataProviderProps = LinkData & {
    children: React.ReactNode;
};
export declare function LinkDataProvider({ children, ...linkData }: LinkDataProviderProps): import("react/jsx-runtime").JSX.Element;
