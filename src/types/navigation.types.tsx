export type NavMode = "admin" | "personal";

export interface HeaderNavProps {
    isSystemAdmin: boolean;
    mode: NavMode;
}

export interface MainLayoutProps {
    mode: NavMode;
}

export interface NavItem {
    to: string;
    label: string;
}