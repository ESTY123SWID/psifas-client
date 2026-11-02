import type { NavItem } from "../types/navigation.types";

/** "{classId}" מוחלף בכיתה הפעילה. */
export const personalLinks: NavItem[] = [
    { to: "/home", label: "בית" },
    { to: "/class/{classId}/posts", label: "פרסומים" },
    { to: "/gallery", label: "גלריה" },
    { to: "/my-classes", label: "הכיתות שלי" },
];

export const adminLinks: NavItem[] = [
    { to: "/admin", label: "סקירה" },
    { to: "/admin/users", label: "משתמשות" },
    { to: "/admin/classes", label: "כיתות" },
    { to: "/home", label: "האזור האישי" },
];
