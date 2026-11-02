import { useRef, useState } from "react";
import { LogOut, Trash2 } from "lucide-react";

import type { ClassMembershipActionsProps } from "../../types/class.types";
import { useDeleteClassMutation } from "../../services/classesApi";
import { useLeaveClassMutation } from "../../services/classMembersApi";

import ConfirmDialog from "../common/ConfirmDialog";

function ClassMembershipActions({ classId, className, role, managerCount, onMembershipEnded }: ClassMembershipActionsProps) {
    const [dialog, setDialog] = useState<"leave" | "delete" | null>(null);
    const [leaveClass, { isLoading: isLeaving, error: leaveError, reset: resetLeave }] = useLeaveClassMutation();
    const [deleteClass, { isLoading: isDeleting, error: deleteError, reset: resetDelete }] = useDeleteClassMutation();
    const leaveRequest = useRef<ReturnType<typeof leaveClass> | null>(null);
    const deleteRequest = useRef<ReturnType<typeof deleteClass> | null>(null);
    const isManager = role === "ClassManager";
    const isLastManager = isManager && (managerCount === undefined || managerCount <= 1);
    const isKnownLastManager = isManager && managerCount === 1;
    const isLoading = isLeaving || isDeleting;

    const handleConfirm = async () => {
        if (isLoading || !dialog) return;

        if (dialog === "leave") {
            if (isLastManager) return;
            const request = leaveClass({ classId });
            leaveRequest.current = request;
            try {
                await request.unwrap();
                setDialog(null);
                onMembershipEnded();
            } catch {
                // השגיאה מוצגת בחלונית האישור.
            } finally {
                leaveRequest.current = null;
            }
            return;
        }

        const request = deleteClass({ classId });
        deleteRequest.current = request;
        try {
            await request.unwrap();
            setDialog(null);
            onMembershipEnded();
        } catch {
            // השגיאה מוצגת בחלונית האישור.
        } finally {
            deleteRequest.current = null;
        }
    };

    const handleCancel = () => {
        leaveRequest.current?.abort();
        deleteRequest.current?.abort();
        resetLeave();
        resetDelete();
        setDialog(null);
    };

    const openDialog = (nextDialog: "leave" | "delete") => {
        resetLeave();
        resetDelete();
        setDialog(nextDialog);
    };

    return (
        <section className="card card-pad border-coral/15">
            <p className="eyebrow mb-1 text-coral">אזור רגיש</p>
            <h2 className="section-title">יציאה מהכיתה</h2>

            {isManager && isLastManager && (
                <p className="alert-warning mt-4">
                    {isKnownLastManager
                        ? "לפני יציאה מהכיתה יש להעביר את תפקיד המנהלת לחברה אחרת."
                        : "לא ניתן לאמת את מספר המנהלות כרגע, ולכן עזיבת המנהלת חסומה."}
                </p>
            )}

            <div className="mt-4 flex flex-col gap-2">
                <button
                    className="btn btn-secondary w-full"
                    type="button"
                    disabled={(isManager && isLastManager) || isLoading}
                    onClick={() => openDialog("leave")}
                >
                    <LogOut size={16} aria-hidden="true" />
                    עזיבת הכיתה
                </button>
                {isManager && (
                    <button className="btn btn-danger-soft w-full" type="button" disabled={isLoading} onClick={() => openDialog("delete")}>
                        <Trash2 size={16} aria-hidden="true" />
                        מחיקת הכיתה
                    </button>
                )}
            </div>

            {dialog && (
                <ConfirmDialog
                    title={dialog === "leave" ? "עזיבת כיתה" : "מחיקת כיתה"}
                    message={dialog === "leave"
                        ? `לעזוב את הכיתה ${className}?`
                        : `למחוק את הכיתה ${className} לצמיתות? פעולה זו תמחק גם את תוכן הכיתה.`}
                    confirmLabel={dialog === "leave" ? "עזיבת הכיתה" : "מחיקת הכיתה"}
                    loadingLabel={dialog === "leave" ? "יוצאת מהכיתה..." : "מוחקת כיתה..."}
                    isLoading={isLoading}
                    errorMessage={
                        dialog === "leave" && leaveError
                            ? "לא הצלחנו לעזוב את הכיתה. ייתכן שיש להעביר תחילה את הניהול."
                            : dialog === "delete" && deleteError
                                ? "לא הצלחנו למחוק את הכיתה. בדקי הרשאות ונסי שוב."
                                : undefined
                    }
                    onConfirm={() => void handleConfirm()}
                    onCancel={handleCancel}
                />
            )}
        </section>
    );
}

export default ClassMembershipActions;
