export interface User {
    id: number;
    name: string;
    email: string;
    role: "User" | "SystemAdmin";
}


export interface AuthState {
    user: User | null;
    sessionStatus: "checking" | "authenticated" | "unauthenticated" | "error";
    sessionError: string | null;
}

export interface AuthSessionResponse {
    user: User;
}

export interface AuthFormValues {
    name?: string;
    email: string;
    password: string;
}

export function isUser(value: unknown): value is User {
    if (typeof value !== "object" || value === null) return false;

    const user = value as Record<string, unknown>;
    return Number.isSafeInteger(user.id) &&
        Number(user.id) > 0 &&
        typeof user.name === "string" &&
        typeof user.email === "string" &&
        (user.role === "User" || user.role === "SystemAdmin");
}