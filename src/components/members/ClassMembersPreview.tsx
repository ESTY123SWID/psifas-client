import { Link } from "react-router";
import { Mail } from "lucide-react";

import type { ClassMembersPreviewProps } from "../../types/classMember.types";
import { isClassMember } from "../../types/classMember.types";
import { useGetClassMembersPreviewQuery } from "../../services/classMembersApi";

import Avatar from "../ui/Avatar";
import { ErrorState, Skeleton } from "../ui/States";

/** חברות הכיתה הפעילה, בפאנל הצד של דף הבית. */
function ClassMembersPreview({ classId, className }: ClassMembersPreviewProps) {
    const { currentData: data, isLoading, isFetching, isError, refetch } = useGetClassMembersPreviewQuery(classId, {
        skip: !Number.isInteger(classId) || classId <= 0,
    });

    const hasValidMembers = Array.isArray(data?.members) && data.members.every(isClassMember);
    const members = hasValidMembers ? data.members : [];
    const totalCount = data?.totalCount;
    const hasValidMemberCount = typeof totalCount === "number" && Number.isSafeInteger(totalCount) && totalCount >= 0;

    return (
        <aside aria-labelledby="class-panel-title" className="border border-line bg-sand-l/60 p-7">
            <div className="mb-6 flex items-start justify-between gap-3 border-b border-line pb-6">
                <div className="min-w-0">
                    <p className="section-label">הכיתה</p>
                    <h2 id="class-panel-title" className="mt-1 font-display text-[1.6rem] leading-tight font-normal">
                        {className.trim() || "הכיתה שלי"}
                    </h2>
                </div>
                <Link to={`/class/${classId}/members`} className="shrink-0 text-[13px] text-ink-2 underline underline-offset-4 hover:text-blue">
                    לפרטי הכיתה
                </Link>
            </div>

            {isLoading || (isFetching && !data) ? (
                <Skeleton lines={4} />
            ) : isError ? (
                <ErrorState message="לא הצלחנו לטעון את חברות הכיתה." onRetry={() => refetch()} />
            ) : data && !hasValidMembers ? (
                <p className="alert-error" role="alert">השרת החזיר רשימת חברות לא תקינה.</p>
            ) : !members.length ? (
                <p className="font-light text-ink-soft">עדיין אין חברות להצגה בכיתה.</p>
            ) : (
                <>
                    <ul>
                        {members.slice(0, 5).map((member, index) => {
                            const name = member.name?.trim() || "ללא שם";
                            const email = member.email?.trim();
                            return (
                                <li key={member.id} className={`flex items-start gap-3.5 py-4 ${index > 0 ? "border-t border-line" : "pt-0"}`}>
                                    <Avatar name={name} size="md" />
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">{name}</p>
                                        <p className="text-[13px] text-ink-soft">{member.role === "ClassManager" ? "מנהלת הכיתה" : "חברת כיתה"}</p>
                                        {email && (
                                            <a
                                                href={`mailto:${email}`}
                                                className="mt-2 inline-flex items-center gap-1.5 border border-line-strong bg-surface px-3 py-0.5 text-[13px] text-ink-2 transition hover:border-ink hover:text-ink"
                                                aria-label={`שליחת מייל אל ${name}`}
                                            >
                                                <Mail size={13} aria-hidden="true" />
                                                שליחת מייל
                                            </a>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    {hasValidMemberCount && totalCount > 5 && (
                        <Link to={`/class/${classId}/members`} className="mt-4 block border-t border-line pt-4 text-sm text-ink-2 underline underline-offset-4 hover:text-blue">
                            לכל {totalCount} חברות הכיתה
                        </Link>
                    )}
                </>
            )}
        </aside>
    );
}

export default ClassMembersPreview;
