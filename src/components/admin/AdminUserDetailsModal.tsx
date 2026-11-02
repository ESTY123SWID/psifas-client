import { useEffect, useRef, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSelector } from "react-redux";
import { CheckCircle2, X } from "lucide-react";

import type { RootState } from "../../app/store";
import type { AdminUserDetailsModalProps, AdminUserRole } from "../../types/admin.types";
import { isAdminUser } from "../../types/admin.types";
import { useDeleteAdminUserMutation, useGetAdminUserDetailsQuery, useUpdateAdminUserRoleMutation } from "../../services/adminApi";
import { readApiError } from "../../services/apiError";

import ConfirmDialog from "../common/ConfirmDialog";
import Avatar from "../ui/Avatar";
import { formatCount, formatDate } from "../ui/format";
import { ErrorState, Skeleton } from "../ui/States";

function getUserActionError(error: unknown): string {
    const { status, code } = readApiError(error);
    if (status === 401) return "פג תוקף החיבור. התחברי מחדש.";
    if (status === 403) return "אין לך הרשאה לבצע פעולה זו.";
    if (status === 404) return "המשתמשת לא נמצאה.";
    if (code === "LAST_SYSTEM_ADMIN") return "לא ניתן להסיר את מנהלת המערכת האחרונה.";
    if (code === "LAST_MANAGER") return "המשתמשת היא המנהלת האחרונה בכיתה. יש להעביר קודם את הניהול.";
    if (status === 409) return "לא ניתן לבצע את הפעולה: יש לבדוק מנהלות אחרונות.";
    return "לא הצלחנו להשלים את הפעולה. נסי שוב.";
}

function AdminUserDetailsModal({ userId, onClose, onDeleted }: AdminUserDetailsModalProps) {
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const isSystemAdmin = currentUser?.role === "SystemAdmin";
    const validUserId = Number.isSafeInteger(userId) && userId > 0;
    const { currentData: user, isLoading, isError, error: detailsError, refetch } = useGetAdminUserDetailsQuery(
        isSystemAdmin && validUserId ? userId : skipToken
    );
    const [updateRole, { isLoading: isUpdatingRole, error: roleError, isSuccess: roleSaved, reset: resetRole }] = useUpdateAdminUserRoleMutation();
    const [deleteUser, { isLoading: isDeleting, error: deleteError, reset: resetDelete }] = useDeleteAdminUserMutation();
    const [selectedRole, setSelectedRole] = useState<AdminUserRole | "">("");
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const deleteRequest = useRef<ReturnType<typeof deleteUser> | null>(null);

    useEffect(() => {
        setSelectedRole(user?.role ?? "");
        setIsConfirmOpen(false);
        resetDelete();
    }, [resetDelete, user?.id, user?.role]);

    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isConfirmOpen && !isDeleting) onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isConfirmOpen, isDeleting, onClose]);

    const isSelf = currentUser?.id === userId;
    const adminCount = user?.systemAdminCount;
    const hasValidAdminCount = typeof adminCount === "number" && Number.isSafeInteger(adminCount) && adminCount >= 0;
    const isLastSystemAdmin = user?.role === "SystemAdmin" && (!hasValidAdminCount || adminCount <= 1);
    const managedClassCount = user?.managedClassCount;
    const hasValidManagedClassCount = typeof managedClassCount === "number" && Number.isSafeInteger(managedClassCount) && managedClassCount >= 0;
    const lastManagerClassCount = user?.lastManagerClassCount;
    const hasValidLastManagerClassCount = typeof lastManagerClassCount === "number" && Number.isSafeInteger(lastManagerClassCount) && lastManagerClassCount >= 0;
    const isLastManagerInClass = hasValidLastManagerClassCount && lastManagerClassCount > 0;
    const managerEligibilityUnknown = hasValidManagedClassCount && managedClassCount > 0 && !hasValidLastManagerClassCount;
    const canDelete = user?.canDelete === true && !isSelf && !isLastSystemAdmin && !isLastManagerInClass && !managerEligibilityUnknown;
    const canChangeRole = user?.canChangeRole === true && !isSelf;
    const roleUnchanged = !selectedRole || selectedRole === user?.role;

    const handleRoleSave = async () => {
        if (!user || !canChangeRole || roleUnchanged || isUpdatingRole) return;
        if (user.role === "SystemAdmin" && selectedRole === "User" && isLastSystemAdmin) return;
        try {
            await updateRole({ userId, role: selectedRole as AdminUserRole }).unwrap();
        } catch {
            // הודעת השגיאה מוצגת בחלונית.
        }
    };

    const handleDelete = async () => {
        if (!canDelete || isDeleting) return;
        const request = deleteUser({ userId });
        deleteRequest.current = request;
        try {
            await request.unwrap();
            setIsConfirmOpen(false);
            onDeleted(userId);
        } catch {
            // הודעת השגיאה מוצגת באישור.
        } finally {
            deleteRequest.current = null;
        }
    };

    const handleClose = () => {
        deleteRequest.current?.abort();
        resetDelete();
        setIsConfirmOpen(false);
        onClose();
    };

    if (!isSystemAdmin) return null;

    const registeredAt = formatDate(user?.registeredAt);
    const hasValidUser = user !== undefined && isAdminUser(user);
    const deleteBlockReason = isSelf
        ? "לא ניתן למחוק את החשבון שלך מתוך מסך הניהול."
        : isLastSystemAdmin
            ? "זו מנהלת המערכת האחרונה, ולכן לא ניתן למחוק אותה."
            : isLastManagerInClass
                ? "המשתמשת היא המנהלת האחרונה בכיתה אחת או יותר. יש להעביר קודם את הניהול."
                : managerEligibilityUnknown
                    ? "לא ניתן לאמת את תפקידי הניהול בכיתות, ולכן המחיקה חסומה."
                    : user && user.canDelete !== true
                        ? "השרת לא אישר מחיקה של חשבון זה."
                        : null;

    return (
        <div
            className="modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isConfirmOpen && !isDeleting) handleClose();
            }}
        >
            <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="admin-user-title">
                <header className="mb-7 flex items-start justify-between gap-4">
                    <div>
                        <p className="eyebrow">ניהול מערכת</p>
                        <h2 className="mt-2 font-display text-[2rem] leading-tight font-normal" id="admin-user-title">פרטי משתמשת</h2>
                    </div>
                    <button className="icon-btn" type="button" onClick={handleClose} aria-label="סגירת פרטי משתמשת">
                        <X size={20} aria-hidden="true" />
                    </button>
                </header>

                {isLoading ? (
                    <Skeleton lines={5} />
                ) : isError ? (
                    <ErrorState message={getUserActionError(detailsError)} onRetry={() => refetch()} />
                ) : !user || !hasValidUser ? (
                    <p className="alert-error" role="alert">השרת החזיר פרטי משתמשת לא תקינים.</p>
                ) : (
                    <>
                        <div className="mb-6 flex items-center gap-4">
                            <Avatar name={user.name} size="lg" />
                            <div className="min-w-0">
                                <p className="truncate text-xl font-bold">{user.name?.trim() || "שם לא זמין"}</p>
                                <p className="truncate text-ink-soft" dir="ltr">{user.email?.trim() || "כתובת מייל לא זמינה"}</p>
                            </div>
                        </div>

                        <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-3 border-t border-b border-line py-5 text-[15px]">
                            <dt className="text-ink-soft">תפקיד</dt>
                            <dd>
                                {user.role === "SystemAdmin" ? (
                                    <span className="badge border-lilac/30 bg-lilac-mist text-lilac">מנהלת מערכת</span>
                                ) : (
                                    <span className="badge">משתמשת</span>
                                )}
                            </dd>
                            <dt className="text-ink-soft">כיתות</dt>
                            <dd className="tabular-nums">{formatCount(user.classCount)}</dd>
                            <dt className="text-ink-soft">מנהלת כיתות</dt>
                            <dd className="tabular-nums">{formatCount(user.managedClassCount)}</dd>
                            <dt className="text-ink-soft">נרשמה</dt>
                            <dd>{registeredAt ?? "לא זמין"}</dd>
                            <dt className="text-ink-soft">מזהה</dt>
                            <dd className="tabular-nums">{user.id}</dd>
                        </dl>

                        {canChangeRole ? (
                            <section className="mt-6" aria-labelledby="admin-user-role-title">
                                <h3 id="admin-user-role-title" className="section-label mb-3">תפקיד במערכת</h3>
                                <div className="flex flex-wrap items-end gap-4">
                                    <div className="min-w-48 flex-1">
                                        <label className="sr-only" htmlFor="admin-user-role">תפקיד במערכת</label>
                                        <select
                                            id="admin-user-role"
                                            value={selectedRole}
                                            disabled={isUpdatingRole}
                                            className="input select font-semibold"
                                            onChange={(event) => {
                                                resetRole();
                                                setSelectedRole(event.currentTarget.value as AdminUserRole);
                                            }}
                                        >
                                            <option value="User">משתמשת</option>
                                            <option value="SystemAdmin">מנהלת מערכת</option>
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => void handleRoleSave()}
                                        disabled={isUpdatingRole || roleUnchanged || (isLastSystemAdmin && selectedRole === "User")}
                                        className="btn btn-brand btn-sm"
                                    >
                                        {isUpdatingRole ? "מעדכנת..." : "שמירת תפקיד"}
                                    </button>
                                </div>
                                {isLastSystemAdmin && <p className="field-hint">לא ניתן להסיר את הרשאת מנהלת המערכת האחרונה.</p>}
                                {roleError && <p className="field-error" role="alert">{getUserActionError(roleError)}</p>}
                                {roleSaved && (
                                    <p className="mt-3 flex items-center gap-1.5 text-sm text-teal" role="status">
                                        <CheckCircle2 size={15} aria-hidden="true" />
                                        התפקיד עודכן.
                                    </p>
                                )}
                            </section>
                        ) : (
                            isSelf && <p className="alert-note mt-6">זה החשבון שלך — אי אפשר לשנות כאן את התפקיד שלך.</p>
                        )}

                        <footer className="mt-8 border-t border-line pt-6">
                            <h3 className="section-label mb-3 text-coral">מחיקת חשבון</h3>
                            {deleteBlockReason ? (
                                <p className="text-[15px] font-light text-ink-2">{deleteBlockReason}</p>
                            ) : (
                                <p className="text-[15px] font-light text-ink-2">החשבון יימחק. הפרסומים יישמרו בארכיון הכיתות ללא פרטים מזהים.</p>
                            )}
                            <button
                                type="button"
                                disabled={!canDelete || isDeleting}
                                onClick={() => {
                                    resetDelete();
                                    setIsConfirmOpen(true);
                                }}
                                className="btn btn-danger-soft btn-sm mt-4"
                            >
                                מחיקת משתמשת
                            </button>
                        </footer>
                    </>
                )}
            </section>

            {isConfirmOpen && user && (
                <ConfirmDialog
                    title="מחיקת משתמשת"
                    message={`למחוק את החשבון של ${user.name}? הפרסומים יישמרו ללא פרטים מזהים. לא ניתן לבטל פעולה זו.`}
                    confirmLabel="מחיקת משתמשת"
                    loadingLabel="מוחקת משתמשת..."
                    isLoading={isDeleting}
                    errorMessage={deleteError ? getUserActionError(deleteError) : undefined}
                    onConfirm={() => void handleDelete()}
                    onCancel={() => {
                        deleteRequest.current?.abort();
                        resetDelete();
                        setIsConfirmOpen(false);
                    }}
                />
            )}
        </div>
    );
}

export default AdminUserDetailsModal;
