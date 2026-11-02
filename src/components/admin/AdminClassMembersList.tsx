import { useState } from "react";
import { UserMinus } from "lucide-react";

import type { AdminClassMember, AdminClassMembersListProps } from "../../types/admin.types";
import { isAdminClassMember } from "../../types/admin.types";
import { useRemoveAdminClassMemberMutation, useUpdateAdminClassMemberRoleMutation } from "../../services/adminApi";
import { readApiError } from "../../services/apiError";

import ConfirmDialog from "../common/ConfirmDialog";
import Avatar from "../ui/Avatar";

function actionError(error: unknown): string {
    const info = readApiError(error);
    if (info.status === 409) return "לא ניתן לשנות או להסיר את המנהלת האחרונה בכיתה.";
    if (info.status === 404) return "החברה כבר אינה בכיתה.";
    if (info.status === 403) return "אין לך הרשאה לבצע פעולה זו.";
    return "הפעולה לא הצליחה. נסי שוב.";
}

function MemberRow({ classId, member, isLastManager }: { classId: number; member: AdminClassMember; isLastManager: boolean }) {
    const [updateRole, { isLoading: isUpdating, error: roleError, reset: resetRole }] = useUpdateAdminClassMemberRoleMutation();
    const [removeMember, { isLoading: isRemoving, error: removeError, reset: resetRemove }] = useRemoveAdminClassMemberMutation();
    const [isConfirming, setIsConfirming] = useState(false);
    const name = member.name.trim() || "שם לא זמין";
    const isBusy = isUpdating || isRemoving;

    const handleRole = async (role: string) => {
        if (role !== "Member" && role !== "ClassManager") return;
        resetRemove();
        try {
            await updateRole({ classId, userId: member.id, role }).unwrap();
        } catch {
            // השגיאה מוצגת בשורה.
        }
    };

    const handleRemove = async () => {
        try {
            await removeMember({ classId, userId: member.id }).unwrap();
            setIsConfirming(false);
        } catch {
            // השגיאה מוצגת בחלונית האישור.
        }
    };

    return (
        <li className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line px-1 py-4">
            <div className="flex min-w-0 flex-[1_1_240px] items-center gap-3.5">
                <Avatar name={name} size="md" />
                <div className="min-w-0">
                    <p className="truncate font-bold">{name}</p>
                    <p className="truncate text-[15px] text-ink-soft" dir="ltr">{member.email?.trim() || "כתובת מייל לא זמינה"}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <label className="sr-only" htmlFor={`admin-member-role-${member.id}`}>תפקיד של {name}</label>
                <select
                    id={`admin-member-role-${member.id}`}
                    value={member.role}
                    disabled={isBusy || isLastManager}
                    title={isLastManager ? "המנהלת האחרונה בכיתה — יש למנות מנהלת נוספת קודם" : undefined}
                    className="input select w-36 py-2 text-[15px] font-semibold"
                    onChange={(event) => void handleRole(event.currentTarget.value)}
                >
                    <option value="Member">חברת כיתה</option>
                    <option value="ClassManager">מנהלת כיתה</option>
                </select>
                <button
                    type="button"
                    className="icon-btn hover:bg-coral-mist hover:text-coral"
                    disabled={isBusy || isLastManager}
                    onClick={() => {
                        resetRole();
                        resetRemove();
                        setIsConfirming(true);
                    }}
                    aria-label={`הסרת ${name} מהכיתה`}
                    title={isLastManager ? "לא ניתן להסיר את המנהלת האחרונה" : "הסרה מהכיתה"}
                >
                    <UserMinus size={18} aria-hidden="true" />
                </button>
            </div>
            {isLastManager && <p className="w-full text-[13px] text-sun">המנהלת האחרונה בכיתה — כדי לשנות, יש למנות קודם מנהלת נוספת.</p>}
            {isUpdating && <p className="w-full text-[13px] text-ink-soft" role="status">מעדכנת תפקיד...</p>}
            {roleError && <p className="w-full text-[13px] text-coral" role="alert">{actionError(roleError)}</p>}

            {isConfirming && (
                <ConfirmDialog
                    title="הסרה מהכיתה"
                    message={`להסיר את ${name} מהכיתה? הפרסומים שלה יישארו בארכיון הכיתה.`}
                    confirmLabel="הסרה"
                    loadingLabel="מסירה..."
                    isLoading={isRemoving}
                    errorMessage={removeError ? actionError(removeError) : undefined}
                    onConfirm={() => void handleRemove()}
                    onCancel={() => {
                        resetRemove();
                        setIsConfirming(false);
                    }}
                />
            )}
        </li>
    );
}

/** חברות הכיתה במסך הניהול, עם שינוי תפקיד והסרה. */
function AdminClassMembersList({ classId, members, managerCount }: AdminClassMembersListProps) {
    const validMembers = Array.isArray(members) ? members.filter(isAdminClassMember) : [];

    if (validMembers.length === 0) {
        return <p className="py-8 text-center font-light text-ink-soft">אין חברות להצגה בעמוד זה.</p>;
    }

    // כשמספר המנהלות אינו ידוע, נוהגים בזהירות ונועלים את המנהלות.
    const lastManagerLock = typeof managerCount !== "number" || managerCount <= 1;

    return (
        <ul aria-label="חברות הכיתה" className="border-t border-ink">
            {validMembers.map((member) => (
                <MemberRow
                    key={member.id}
                    classId={classId}
                    member={member}
                    isLastManager={member.role === "ClassManager" && lastManagerLock}
                />
            ))}
        </ul>
    );
}

export default AdminClassMembersList;
