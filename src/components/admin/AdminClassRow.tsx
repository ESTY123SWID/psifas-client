import { ChevronLeft, School } from "lucide-react";

import type { AdminClassRowProps } from "../../types/admin.types";
import { formatCount, formatDate } from "../ui/format";

function AdminClassRow({ classItem, onSelect }: AdminClassRowProps) {
    const name = typeof classItem.name === "string" ? classItem.name.trim() || "כיתה ללא שם" : "כיתה ללא שם";
    const date = formatDate(classItem.createdAt, { day: "numeric", month: "short", year: "numeric" });
    const manager = typeof classItem.managerName === "string" && classItem.managerName.trim() ? classItem.managerName.trim() : null;

    return (
        <li>
            <button
                type="button"
                onClick={() => onSelect(classItem.id)}
                className="group flex w-full flex-wrap items-center gap-x-8 gap-y-3 border-b border-line px-3 py-5 text-right transition-[padding,background-color] duration-200 hover:bg-sand-l/50 hover:ps-5"
                aria-label={`פרטי הכיתה ${name}`}
            >
                <span className="flex min-w-0 flex-[1_1_260px] items-center gap-3.5">
                    <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-line bg-surface text-blue" aria-hidden="true">
                        <School size={19} strokeWidth={1.5} />
                    </span>
                    <span className="min-w-0">
                        <span className="block truncate text-lg leading-snug font-bold transition group-hover:text-blue">{name}</span>
                        <span className="block truncate text-[15px] text-ink-soft">
                            {manager ? `מנהלת: ${manager}` : "אין מנהלת רשומה"}
                            {date ? ` · נפתחה ב־${date}` : ""}
                        </span>
                    </span>
                </span>
                <span className="flex flex-wrap items-center gap-2 text-[15px] text-ink-2">
                    <span>{formatCount(classItem.memberCount)} חברות</span>
                    <span className="text-line-strong" aria-hidden="true">·</span>
                    <span>{formatCount(classItem.postCount)} פרסומים</span>
                </span>
                <span className="flex items-center gap-3">
                    {classItem.inviteCode && (
                        <span className="badge font-mono tracking-[0.12em]" dir="ltr">{classItem.inviteCode}</span>
                    )}
                    <ChevronLeft size={18} className="text-ink-soft transition group-hover:-translate-x-1 group-hover:text-blue" aria-hidden="true" />
                </span>
            </button>
        </li>
    );
}

export default AdminClassRow;
