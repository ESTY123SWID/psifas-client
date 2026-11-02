import { useRef, useState } from "react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { Crown, UserMinus } from "lucide-react";

import type { ClassMemberRowProps } from "../../types/classMember.types";
import { useRemoveClassMemberMutation, useUpdateClassMemberRoleMutation } from "../../services/classMembersApi";

import ConfirmDialog from "../common/ConfirmDialog";
import Avatar from "../ui/Avatar";
import { formatDate } from "../ui/format";

function getMemberActionError(error: FetchBaseQueryError | SerializedError | undefined): string {
    if (error && "status" in error) {
        if (error.status === 403) return "אין לך הרשאה לבצע פעולה זו.";
        if (error.status === 409) return "לא ניתן להסיר או לשנות את המנהלת האחרונה בכיתה.";
    }
    return "לא הצלחנו לעדכן את החברה. נסי שוב.";
}

function MemberRow({
    classId,
    member,
    currentUserId,
    canManageMembers,
    managerCount,
    onCurrentUserRemoved,
}: ClassMemberRowProps) {
    const [isConfirmingRemoval, setIsConfirmingRemoval] = useState(false);
    const [rowError, setRowError] = useState("");
    const [updateRole, { isLoading: isUpdatingRole, error: roleError }] = useUpdateClassMemberRoleMutation();
    const [removeMember, { isLoading: isRemoving, error: removalError, reset }] = useRemoveClassMemberMutation();
    const removalRequest = useRef<ReturnType<typeof removeMember> | null>(null);
    const isCurrentUser = currentUserId !== null && member.id === currentUserId;
    const isManager = member.role === "ClassManager";
    const isLastManager = isManager && (managerCount === undefined || managerCount <= 1);
    const isKnownLastManager = isManager && managerCount === 1;
    const name = member.name?.trim() || "שם לא זמין";
    const email = member.email?.trim() || "";
    const joinedAt = formatDate(member.joinedAt, { day: "numeric", month: "short", year: "numeric" });

    const handleRoleChange = async (role: string) => {
        if (!canManageMembers || isUpdatingRole || isRemoving) return;
        if (role !== "Member" && role !== "ClassManager") return;
        if (isLastManager && role !== member.role) {
            setRowError("יש להעביר את הניהול לפני שינוי תפקיד המנהלת האחרונה.");
            return;
        }
        setRowError("");
        try {
            await updateRole({ classId, memberId: member.id, role }).unwrap();
        } catch {
            setRowError("לא הצלחנו לעדכן את התפקיד. נסי שוב.");
        }
    };

    const handleRemoval = async () => {
        if (!canManageMembers || isRemoving || isLastManager) return;
        const request = removeMember({ classId, memberId: member.id });
        removalRequest.current = request;
        try {
            await request.unwrap();
            setIsConfirmingRemoval(false);
            if (isCurrentUser) onCurrentUserRemoved();
        } catch {
            setRowError("");
        } finally {
            removalRequest.current = null;
        }
    };

    const handleCancelRemoval = () => {
        removalRequest.current?.abort();
        reset();
        setIsConfirmingRemoval(false);
    };

    const actionError = rowError ||
        (roleError ? getMemberActionError(roleError) : "") ||
        (removalError ? getMemberActionError(removalError) : "");

    return (
        <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar name={name} size="md" />
                <div className="min-w-0">
                    <h3 className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink">
                        <span className="truncate">{name}</span>
                        {isCurrentUser && <span className="badge bg-paper px-2 py-0.5 text-[0.68rem] text-ink-soft">את</span>}
                        {isManager && (
                            <span className="badge bg-lilac-mist px-2 py-0.5 text-[0.68rem] text-lilac">
                                <Crown size={11} aria-hidden="true" />
                                מנהלת כיתה
                            </span>
                        )}
                    </h3>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-soft">
                        {email ? (
                            <a className="truncate hover:text-blue hover:underline" href={`mailto:${email}`} dir="ltr">{email}</a>
                        ) : (
                            <span>כתובת מייל לא זמינה</span>
                        )}
                        {joinedAt ? (
                            <time dateTime={member.joinedAt ?? undefined}>· הצטרפה ב־{joinedAt}</time>
                        ) : member.joinedAt ? (
                            <span>· תאריך הצטרפות לא זמין</span>
                        ) : null}
                    </p>
                </div>
            </div>

            {canManageMembers && (
                <div className="flex items-center gap-2 sm:shrink-0">
                    <label className="sr-only" htmlFor={`member-role-${member.id}`}>תפקיד של {name}</label>
                    <select
                        id={`member-role-${member.id}`}
                        className="input select w-auto py-1.5 text-xs font-semibold"
                        value={member.role}
                        disabled={isUpdatingRole || isRemoving || isLastManager}
                        onChange={(event) => void handleRoleChange(event.currentTarget.value)}
                    >
                        <option value="Member">חברה</option>
                        <option value="ClassManager">מנהלת כיתה</option>
                    </select>
                    <button
                        className="icon-btn hover:bg-coral-mist hover:text-coral"
                        type="button"
                        disabled={isRemoving || isUpdatingRole || isLastManager}
                        onClick={() => {
                            reset();
                            setRowError("");
                            setIsConfirmingRemoval(true);
                        }}
                        aria-label={`הסרת ${name} מהכיתה`}
                        title="הסרה מהכיתה"
                    >
                        <UserMinus size={17} aria-hidden="true" />
                    </button>
                </div>
            )}

            {canManageMembers && isLastManager && (
                <p className="w-full text-xs leading-5 text-sun">
                    {isKnownLastManager ? "המנהלת האחרונה — יש להעביר את הניהול לפני שינוי או הסרה." : "לא ניתן לבצע פעולה במנהלות עד שמספר המנהלות ידוע."}
                </p>
            )}
            {isUpdatingRole && <p className="w-full text-xs text-ink-soft" role="status">מעדכנת תפקיד...</p>}
            {actionError && <p className="w-full text-xs font-medium text-coral" role="alert">{actionError}</p>}

            {isConfirmingRemoval && (
                <ConfirmDialog
                    title="הסרת חברה מהכיתה"
                    message={`להסיר את ${name} מהכיתה?`}
                    confirmLabel="הסרה"
                    loadingLabel="מסירה..."
                    isLoading={isRemoving}
                    errorMessage={removalError ? getMemberActionError(removalError) : undefined}
                    onConfirm={() => void handleRemoval()}
                    onCancel={handleCancelRemoval}
                />
            )}
        </li>
    );
}

export default MemberRow;
