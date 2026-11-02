import { Link } from "react-router";

import type { AdminRecentUser, AdminRecentUsersProps } from "../../types/admin.types";
import Avatar from "../ui/Avatar";
import { formatDate } from "../ui/format";

function isAdminRecentUser(value: unknown): value is AdminRecentUser {
    if (typeof value !== "object" || value === null) return false;
    const user = value as Record<string, unknown>;
    return Number.isSafeInteger(user.id) &&
        typeof user.name === "string" &&
        typeof user.email === "string" &&
        (user.registeredAt === undefined || user.registeredAt === null || typeof user.registeredAt === "string") &&
        (user.role === "User" || user.role === "SystemAdmin");
}

function AdminRecentUsers({ users }: AdminRecentUsersProps) {
    const validUsers = Array.isArray(users) ? users.filter(isAdminRecentUser) : [];

    return (
        <section className="card card-pad" aria-labelledby="recent-users-title">
            <h2 id="recent-users-title" className="section-label mb-6">נרשמו לאחרונה</h2>
            {validUsers.length === 0 ? (
                <p className="font-light text-ink-soft">עוד אין משתמשות במערכת.</p>
            ) : (
                <ul>
                    {validUsers.map((user, index) => {
                        const date = formatDate(user.registeredAt);
                        return (
                            <li key={user.id} className={`flex items-center gap-3.5 py-3.5 ${index > 0 ? "border-t border-line" : "pt-0"}`}>
                                <Avatar name={user.name} size="sm" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-bold">{user.name.trim() || "שם לא זמין"}</p>
                                    <p className="truncate text-[15px] text-ink-soft">{date ? `נרשמה ב־${date}` : "תאריך הרשמה לא זמין"}</p>
                                </div>
                                {user.role === "SystemAdmin" && <span className="badge border-lilac/30 bg-lilac-mist text-lilac">מנהלת מערכת</span>}
                            </li>
                        );
                    })}
                </ul>
            )}
            <Link to="/admin/users" className="mt-5 inline-block font-semibold text-blue hover:underline">לכל המשתמשות ←</Link>
        </section>
    );
}

export default AdminRecentUsers;
