import { Link } from "react-router";
import { School } from "lucide-react";

import type { AdminRecentClass, AdminRecentClassesProps } from "../../types/admin.types";
import { formatDate } from "../ui/format";

function isAdminRecentClass(value: unknown): value is AdminRecentClass {
    if (typeof value !== "object" || value === null) return false;
    const classItem = value as Record<string, unknown>;
    return Number.isSafeInteger(classItem.id) &&
        typeof classItem.name === "string" &&
        (classItem.createdAt === undefined || classItem.createdAt === null || typeof classItem.createdAt === "string");
}

function AdminRecentClasses({ classes }: AdminRecentClassesProps) {
    const validClasses = Array.isArray(classes) ? classes.filter(isAdminRecentClass) : [];

    return (
        <section className="card card-pad" aria-labelledby="recent-classes-title">
            <h2 id="recent-classes-title" className="section-label mb-6">כיתות חדשות</h2>
            {validClasses.length === 0 ? (
                <p className="font-light text-ink-soft">עוד לא נפתחו כיתות.</p>
            ) : (
                <ul>
                    {validClasses.map((classItem, index) => {
                        const date = formatDate(classItem.createdAt);
                        return (
                            <li key={classItem.id} className={index > 0 ? "border-t border-line" : ""}>
                                <Link
                                    to={`/admin/classes/${classItem.id}`}
                                    className={`group flex items-center gap-3.5 py-3.5 ${index === 0 ? "pt-0" : ""}`}
                                >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-blue" aria-hidden="true">
                                        <School size={15} strokeWidth={1.6} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-bold transition group-hover:text-blue">{classItem.name.trim() || "כיתה ללא שם"}</span>
                                        <span className="block truncate text-[15px] text-ink-soft">{date ? `נפתחה ב־${date}` : "תאריך יצירה לא זמין"}</span>
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
            <Link to="/admin/classes" className="mt-5 inline-block font-semibold text-blue hover:underline">לכל הכיתות ←</Link>
        </section>
    );
}

export default AdminRecentClasses;
