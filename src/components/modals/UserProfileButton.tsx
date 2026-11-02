import { Link } from "react-router";
import { LogOut } from "lucide-react";

import type { UserProfileButtonProps } from "../../types/profile.types";
import Avatar from "../ui/Avatar";

/** המשתמשת המחוברת ב־Header: מעבר לפרופיל ויציאה. */
function UserProfileButton({ userName, role, subtitle, onLogout, isLoggingOut = false, logoutError }: UserProfileButtonProps) {
    return (
        <div className="relative flex items-center gap-3">
            <Link to="/profile" className="group flex min-w-0 items-center gap-3 no-underline" aria-label="הפרופיל שלי">
                <Avatar name={userName} size="sm" />
                <span className="min-w-0 leading-[1.3]">
                    <span className="block truncate text-[15px] font-semibold text-ink transition group-hover:text-blue">{userName}</span>
                    <span className="block max-w-[220px] truncate text-[12.5px] text-ink-soft">
                        {role}{subtitle ? ` · ${subtitle}` : ""}
                    </span>
                </span>
            </Link>
            <button
                type="button"
                className="ms-auto inline-flex items-center gap-1.5 px-1 py-1.5 text-sm text-ink-2 transition hover:text-coral disabled:opacity-50 lg:ms-1.5"
                onClick={onLogout}
                disabled={isLoggingOut}
                aria-label="התנתקות"
            >
                <LogOut size={17} aria-hidden="true" />
                <span>{isLoggingOut ? "יוצאת..." : "יציאה"}</span>
            </button>
            {logoutError && (
                <p role="alert" className="alert-error absolute top-full left-0 z-10 mt-2 w-64 text-xs">{logoutError}</p>
            )}
        </div>
    );
}

export default UserProfileButton;
