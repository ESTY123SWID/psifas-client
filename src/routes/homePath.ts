import type { User } from "../types/auth.types";

/** לאן מגיעים אחרי התחברות: מנהלת מערכת לאזור הניהול, כל השאר לדף הבית האישי. */
export function homePathFor(user: User | null | undefined): string {
    return user?.role === "SystemAdmin" ? "/admin" : "/home";
}
