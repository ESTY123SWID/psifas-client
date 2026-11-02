import { type ReactNode, useEffect, useRef, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";

import type { RootState } from "../../app/store";
import type { AdminClassDetails } from "../../types/admin.types";
import { isAdminClass, isAdminClassMember } from "../../types/admin.types";
import {
    useDeleteAdminClassMutation,
    useGetAdminClassDetailsQuery,
    useGetAdminClassMembersQuery,
    useRenameAdminClassMutation,
} from "../../services/adminApi";
import { readApiError } from "../../services/apiError";

import AdminClassMembersList from "../../components/admin/AdminClassMembersList";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Pagination from "../../components/ui/Pagination";
import { ErrorState, LoadingState, Skeleton } from "../../components/ui/States";
import { formatCount, formatDate } from "../../components/ui/format";

const PAGE_SIZE = 20;

function getClassErrorMessage(error: unknown): string {
    const { status } = readApiError(error);
    if (status === 401) return "פג תוקף החיבור. התחברי מחדש.";
    if (status === 403) return "אין לך הרשאה לצפות בפרטי הכיתה.";
    if (status === 404) return "הכיתה לא נמצאה.";
    return "לא הצלחנו לטעון את פרטי הכיתה. נסי שוב.";
}

function getDeleteErrorMessage(error: unknown): string {
    const { status } = readApiError(error);
    if (status === 403) return "אין לך הרשאה למחוק את הכיתה.";
    if (status === 404) return "הכיתה כבר אינה קיימת.";
    return "לא הצלחנו למחוק את הכיתה. נסי שוב.";
}

function RenameClass({ classDetails, onDone }: { classDetails: AdminClassDetails; onDone: () => void }) {
    const [renameClass, { isLoading, error }] = useRenameAdminClassMutation();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<{ name: string }>({ defaultValues: { name: classDetails.name } });

    const submit = handleSubmit(async ({ name }) => {
        try {
            await renameClass({ classId: classDetails.id, name: name.trim() }).unwrap();
            onDone();
        } catch {
            // השגיאה מוצגת מתחת לשדה.
        }
    });

    return (
        <form onSubmit={submit} noValidate className="mt-2 max-w-xl">
            <label className="sr-only" htmlFor="admin-class-name">שם הכיתה</label>
            <input
                id="admin-class-name"
                autoFocus
                disabled={isLoading}
                aria-invalid={Boolean(errors.name)}
                className="input font-display text-[2rem] font-normal"
                {...register("name", {
                    validate: {
                        required: (value) => value.trim().length > 0 || "יש להזין שם לכיתה.",
                        max: (value) => value.trim().length <= 100 || "שם הכיתה לא יכול לעלות על 100 תווים.",
                    },
                })}
            />
            {errors.name?.message && <p className="field-error" role="alert">{errors.name.message}</p>}
            {error && <p className="field-error" role="alert">{readApiError(error).message ?? "לא הצלחנו לשנות את השם."}</p>}
            <div className="mt-4 flex gap-3">
                <button type="submit" className="btn btn-brand btn-sm" disabled={isLoading}>{isLoading ? "שומרת..." : "שמירת השם"}</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={onDone} disabled={isLoading}>ביטול</button>
            </div>
        </form>
    );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="border-line px-5 py-5 sm:border-s first:sm:border-s-0">
            <dt className="text-[13px] tracking-[0.12em] text-ink-soft">{label}</dt>
            <dd className="mt-1 truncate font-display text-2xl font-normal">{children}</dd>
        </div>
    );
}

function AdminClassDetailsPage() {
    const { classId: classIdParam } = useParams();
    const classId = Number(classIdParam);
    const hasValidClassId = Number.isSafeInteger(classId) && classId > 0;
    const isSystemAdmin = useSelector((state: RootState) => state.auth.user?.role === "SystemAdmin");
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deleteClass, { isLoading: isDeleting, error: deleteError, reset: resetDelete }] = useDeleteAdminClassMutation();
    const deleteRequest = useRef<ReturnType<typeof deleteClass> | null>(null);

    useEffect(() => {
        setPage(1);
        setIsEditingName(false);
        setIsConfirmOpen(false);
    }, [classId]);

    const canLoad = isSystemAdmin && hasValidClassId;
    const {
        currentData: classDetails,
        isLoading: isDetailsLoading,
        isFetching: isDetailsFetching,
        isError: isDetailsError,
        error: detailsError,
        refetch: refetchDetails,
    } = useGetAdminClassDetailsQuery(canLoad ? classId : skipToken);
    const {
        currentData: membersResponse,
        isLoading: isMembersLoading,
        isFetching: isMembersFetching,
        isError: isMembersError,
        error: membersError,
        refetch: refetchMembers,
    } = useGetAdminClassMembersQuery(canLoad ? { classId, page, pageSize: PAGE_SIZE } : skipToken);

    const totalPages = Number.isSafeInteger(membersResponse?.totalPages) ? Math.max(membersResponse?.totalPages ?? 0, 0) : 0;
    const members = Array.isArray(membersResponse?.items) ? membersResponse.items.filter(isAdminClassMember) : [];

    useEffect(() => {
        if (membersResponse && page > Math.max(totalPages, 1)) setPage(Math.max(totalPages, 1));
    }, [membersResponse, page, totalPages]);

    const handleDelete = async () => {
        if (!hasValidClassId || isDeleting) return;
        const request = deleteClass({ classId });
        deleteRequest.current = request;
        try {
            await request.unwrap();
            setIsConfirmOpen(false);
            navigate("/admin/classes", { replace: true });
        } catch {
            // הודעת השגיאה מוצגת בחלונית האישור.
        } finally {
            deleteRequest.current = null;
        }
    };

    const backLink = (
        <Link to="/admin/classes" className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-2 transition hover:text-ink">
            <ArrowRight size={16} aria-hidden="true" />
            לכל הכיתות
        </Link>
    );

    if (!isSystemAdmin) {
        return <main className="page"><ErrorState message="אין לך הרשאה לצפות בפרטי הכיתה." /></main>;
    }
    if (!hasValidClassId) {
        return <main className="page">{backLink}<ErrorState message="מזהה הכיתה אינו תקין." /></main>;
    }
    if (isDetailsLoading || (isDetailsFetching && !classDetails)) {
        return <main className="page">{backLink}<LoadingState label="טוענת פרטי כיתה..." /></main>;
    }
    if (isDetailsError || !classDetails || !isAdminClass(classDetails) || classDetails.id !== classId) {
        return (
            <main className="page">
                {backLink}
                <ErrorState
                    message={isDetailsError ? getClassErrorMessage(detailsError) : "השרת לא החזיר פרטי כיתה תקינים."}
                    onRetry={isDetailsError ? () => refetchDetails() : undefined}
                />
            </main>
        );
    }

    const createdAt = formatDate(classDetails.createdAt);
    const managers = Array.isArray(classDetails.managers) ? classDetails.managers.filter(isAdminClassMember) : [];

    return (
        <main className="page">
            {backLink}

            <header className="mb-10">
                <p className="mb-3.5 text-[13px] font-semibold tracking-[0.14em] text-blue">ניהול מערכת · כיתה</p>
                {isEditingName ? (
                    <RenameClass classDetails={classDetails} onDone={() => setIsEditingName(false)} />
                ) : (
                    <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
                        <h1 className="page-title">{classDetails.name?.trim() || "כיתה ללא שם"}</h1>
                        <button type="button" className="btn btn-ghost btn-sm mb-1.5" onClick={() => setIsEditingName(true)}>
                            <Pencil size={15} aria-hidden="true" />
                            שינוי שם
                        </button>
                    </div>
                )}
                <p className="page-sub mt-2">
                    {managers.length > 0
                        ? `בניהול ${managers.map((manager) => manager.name).join(", ")}`
                        : "לכיתה אין כרגע מנהלת רשומה."}
                </p>
            </header>

            <dl className="mb-12 grid border border-line border-t-[3px] border-t-ink bg-surface sm:grid-cols-2 lg:grid-cols-5">
                <Fact label="חברות">{formatCount(classDetails.memberCount)}</Fact>
                <Fact label="מנהלות">{formatCount(classDetails.managerCount)}</Fact>
                <Fact label="פרסומים">{formatCount(classDetails.postCount)}</Fact>
                <Fact label="נפתחה">{createdAt ?? "לא זמין"}</Fact>
                <Fact label="קוד הצטרפות">
                    <span className="font-mono text-xl tracking-[0.16em]" dir="ltr">{classDetails.inviteCode || "–"}</span>
                </Fact>
            </dl>

            <section aria-labelledby="admin-members-title" className="mb-14">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <h2 id="admin-members-title" className="section-title">חברות הכיתה</h2>
                    <p className="text-sm text-ink-soft">אפשר לשנות תפקיד או להסיר חברה. המנהלת האחרונה מוגנת.</p>
                </div>
                {isMembersLoading ? (
                    <Skeleton lines={5} />
                ) : isMembersError ? (
                    <ErrorState message={getClassErrorMessage(membersError)} onRetry={() => refetchMembers()} />
                ) : !membersResponse ? (
                    <LoadingState label="טוענת חברות..." compact />
                ) : (
                    <div className={`transition-opacity ${isMembersFetching ? "opacity-60" : ""}`} aria-busy={isMembersFetching}>
                        <AdminClassMembersList classId={classId} members={members} managerCount={classDetails.managerCount} />
                        <Pagination page={page} totalPages={totalPages} isLoading={isMembersFetching} onPageChange={setPage} label="ניווט בין עמודי חברות" />
                    </div>
                )}
            </section>

            <section aria-labelledby="danger-title" className="border border-coral/25 bg-coral-mist/40 p-6 sm:p-8">
                <h2 id="danger-title" className="section-label text-coral">אזור רגיש</h2>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-5">
                    <p className="max-w-xl font-light text-ink-2">
                        מחיקת הכיתה מוחקת לצמיתות את כל התוכן שלה: חברות, פרסומים, תמונות, תגובות וקוד ההצטרפות.
                    </p>
                    <button
                        type="button"
                        className="btn btn-danger-soft"
                        onClick={() => {
                            resetDelete();
                            setIsConfirmOpen(true);
                        }}
                        disabled={isDeleting}
                    >
                        <Trash2 size={17} aria-hidden="true" />
                        מחיקת הכיתה
                    </button>
                </div>
            </section>

            {isConfirmOpen && (
                <ConfirmDialog
                    title="מחיקת כיתה"
                    message={`למחוק את "${classDetails.name}" לצמיתות? כל התוכן של הכיתה יימחק ולא ניתן יהיה לשחזר אותו.`}
                    confirmLabel="מחיקה לצמיתות"
                    loadingLabel="מוחקת כיתה..."
                    isLoading={isDeleting}
                    errorMessage={deleteError ? getDeleteErrorMessage(deleteError) : undefined}
                    onConfirm={() => void handleDelete()}
                    onCancel={() => {
                        deleteRequest.current?.abort();
                        resetDelete();
                        setIsConfirmOpen(false);
                    }}
                />
            )}
        </main>
    );
}

export default AdminClassDetailsPage;
