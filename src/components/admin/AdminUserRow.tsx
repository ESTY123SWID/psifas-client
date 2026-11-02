import { ChevronLeft } from "lucide-react";

import type { AdminUserRowProps } from "../../types/admin.types";
import Avatar from "../ui/Avatar";
import { formatCount, formatDate } from "../ui/format";

function AdminUserRow({ user, onSelect }: AdminUserRowProps) {
    const name = typeof user.name === "string" ? user.name.trim() || "שם לא זמין" : "שם לא זמין";
    const email = typeof user.email === "string" ? user.email.trim() || "כתובת מייל לא זמינה" : "כתובת מייל לא זמינה";
    const date = formatDate(user.registeredAt, { day: "numeric", month: "short", year: "numeric" });
    const classCount = formatCount(user.classCount);

    return (
        <li>
            <button
                type="button"
                onClick={() => onSelect(user.id)}
                className="group flex w-full flex-wrap items-center gap-x-8 gap-y-3 border-b border-line px-3 py-5 text-right transition-[padding,background-color] duration-200 hover:bg-sand-l/50 hover:ps-5"
                aria-label={`פרטי ${name}`}
            >
                <span className="flex min-w-0 flex-[1_1_260px] items-center gap-3.5">
                    <Avatar name={name} size="md" />
                    <span className="min-w-0">
                        <span className="block truncate text-lg leading-snug font-bold transition group-hover:text-blue">{name}</span>
                        <span className="block truncate text-[15px] text-ink-soft" dir="ltr">{email}</span>
                    </span>
                </span>
                <span className="flex flex-wrap items-center gap-2 text-[15px] text-ink-2">
                    <span>{classCount === "לא זמין" ? "כיתות: לא זמין" : user.classCount === 1 ? "כיתה אחת" : `${classCount} כיתות`}</span>
                    <span className="text-line-strong" aria-hidden="true">·</span>
                    <span>{date ? `נרשמה ב־${date}` : "תאריך הרשמה לא זמין"}</span>
                </span>
                <span className="flex items-center gap-3">
                    {user.role === "SystemAdmin" ? (
                        <span className="badge border-lilac/30 bg-lilac-mist text-lilac">מנהלת מערכת</span>
                    ) : (
                        <span className="badge">משתמשת</span>
                    )}
                    <ChevronLeft size={18} className="text-ink-soft transition group-hover:-translate-x-1 group-hover:text-blue" aria-hidden="true" />
                </span>
            </button>
        </li>
    );
}

export default AdminUserRow;
