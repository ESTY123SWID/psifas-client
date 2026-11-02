import type { User } from "./auth.types";

export interface ProfileFormValues {
    name: string;
    email: string;
}

export interface UpdateMyProfileRequest extends ProfileFormValues {}

export interface ChangePasswordFormValues {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordRequest extends ChangePasswordFormValues {}

export interface UpdateMyProfileResponse {
    user: User;
}

export interface UserProfileButtonProps {
    userName: string;
    userEmail: string;
    role: string;
    subtitle?: string;
    onLogout: () => void;
    isLoggingOut?: boolean;
    logoutError?: string | null;
}