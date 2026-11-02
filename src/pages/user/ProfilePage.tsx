import { useEffect, useId, useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { CheckCircle2, Eye, EyeOff, KeyRound, Mail, School, ShieldCheck, UserRound } from "lucide-react";

import type { RootState } from "../../app/store";
import type { ChangePasswordFormValues, ProfileFormValues } from "../../types/profile.types";
import { isUser } from "../../types/auth.types";
import { setUser } from "../../features/auth/authSlice";
import { useChangePasswordMutation, useUpdateMyProfileMutation } from "../../services/authApi";
import { useGetMyClassesQuery } from "../../services/classesApi";
import { readApiError } from "../../services/apiError";

import Avatar from "../../components/ui/Avatar";
import PageHeader from "../../components/ui/PageHeader";
import { LoadingState } from "../../components/ui/States";

// אותו כלל כמו בטופס ההרשמה ובשרת.
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SuccessMessage({ children }: { children: string }) {
    return (
        <p className="alert-success flex items-center gap-2" role="status">
            <CheckCircle2 size={17} className="shrink-0" aria-hidden="true" />
            {children}
        </p>
    );
}

function ProfileDetailsForm() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const [updateMyProfile, { isLoading }] = useUpdateMyProfileMutation();
    const [successMessage, setSuccessMessage] = useState("");
    const {
        register,
        handleSubmit,
        reset,
        setError,
        clearErrors,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<ProfileFormValues>({
        defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
    });

    useEffect(() => {
        if (user) reset({ name: user.name, email: user.email });
    }, [reset, user]);

    const onChange = () => {
        setSuccessMessage("");
        clearErrors("root.server");
    };

    const submit = handleSubmit(async (values) => {
        setSuccessMessage("");
        try {
            const response = await updateMyProfile({ name: values.name.trim(), email: values.email.trim() }).unwrap();
            if (!isUser(response?.user)) {
                setError("root.server", { message: "השרת החזיר פרטי משתמשת לא תקינים." });
                return;
            }
            dispatch(setUser(response.user));
            reset({ name: response.user.name, email: response.user.email });
            setSuccessMessage("הפרטים נשמרו בהצלחה.");
        } catch (error) {
            const info = readApiError(error);
            if (info.status === 409) {
                setError("email", { message: "כתובת המייל כבר משויכת לחשבון אחר." });
            } else if (info.status === 400) {
                if (info.fieldErrors.name) setError("name", { message: info.fieldErrors.name });
                if (info.fieldErrors.email) setError("email", { message: info.fieldErrors.email });
                if (!info.fieldErrors.name && !info.fieldErrors.email) {
                    setError("root.server", { message: "השם או כתובת המייל אינם תקינים." });
                }
            } else if (info.status === "FETCH_ERROR") {
                setError("root.server", { message: "אין חיבור לשרת. בדקי את החיבור ונסי שוב." });
            } else {
                setError("root.server", { message: "לא הצלחנו לשמור את הפרטים. נסי שוב." });
            }
        }
    });

    const isSaving = isLoading || isSubmitting;

    return (
        <section className="card card-accent card-pad" aria-labelledby="profile-details-title">
            <div className="mb-6 flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mist text-blue-deep" aria-hidden="true">
                    <UserRound size={19} />
                </span>
                <div>
                    <h2 id="profile-details-title" className="section-title">פרטים אישיים</h2>
                    <p className="mt-1 text-sm text-ink-soft">השם יופיע ליד הפרסומים שלך ובחברות הכיתה.</p>
                </div>
            </div>

            <form onSubmit={submit} noValidate className="space-y-5">
                <div>
                    <label className="field-label" htmlFor="profile-name">שם מלא</label>
                    <input
                        id="profile-name"
                        className="input"
                        autoComplete="name"
                        disabled={isSaving}
                        aria-invalid={Boolean(errors.name)}
                        {...register("name", {
                            onChange,
                            validate: {
                                required: (value) => value.trim().length > 0 || "יש להזין שם.",
                                min: (value) => value.trim().length >= 2 || "השם חייב להכיל לפחות שני תווים.",
                                max: (value) => value.trim().length <= 100 || "השם לא יכול לעלות על 100 תווים.",
                            },
                        })}
                    />
                    {errors.name?.message && <p className="field-error" role="alert">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="field-label" htmlFor="profile-email">כתובת אימייל</label>
                    <div className="relative">
                        <Mail size={16} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
                        <input
                            id="profile-email"
                            type="email"
                            dir="ltr"
                            className="input pr-10 text-right"
                            autoComplete="email"
                            disabled={isSaving}
                            aria-invalid={Boolean(errors.email)}
                            {...register("email", {
                                onChange,
                                validate: {
                                    required: (value) => value.trim().length > 0 || "יש להזין כתובת אימייל.",
                                    format: (value) => EMAIL_FORMAT.test(value.trim()) || "כתובת האימייל אינה תקינה.",
                                },
                            })}
                        />
                    </div>
                    {errors.email?.message && <p className="field-error" role="alert">{errors.email.message}</p>}
                    <p className="field-hint">משמשת להתחברות למערכת.</p>
                </div>

                {errors.root?.server?.message && <p className="alert-error" role="alert">{errors.root.server.message}</p>}
                {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

                <div className="flex flex-wrap items-center gap-2 border-t border-line pt-5">
                    <button type="submit" className="btn btn-primary" disabled={isSaving || !isDirty}>
                        {isSaving ? "שומרת..." : "שמירת פרטים"}
                    </button>
                    {isDirty && !isSaving && (
                        <button type="button" className="btn btn-ghost" onClick={() => user && reset({ name: user.name, email: user.email })}>
                            ביטול שינויים
                        </button>
                    )}
                </div>
            </form>
        </section>
    );
}

function PasswordInput({
    id,
    label,
    autoComplete,
    error,
    hint,
    disabled,
    registration,
}: {
    id: string;
    label: string;
    autoComplete: string;
    error?: string;
    hint?: string;
    disabled: boolean;
    registration: UseFormRegisterReturn;
}) {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div>
            <label className="field-label" htmlFor={id}>{label}</label>
            <div className="relative">
                <input
                    id={id}
                    type={isVisible ? "text" : "password"}
                    dir="ltr"
                    className="input pl-11 text-right"
                    autoComplete={autoComplete}
                    disabled={disabled}
                    aria-invalid={Boolean(error)}
                    {...registration}
                />
                <button
                    type="button"
                    className="icon-btn absolute top-1/2 left-1 h-8 w-8 -translate-y-1/2"
                    onClick={() => setIsVisible((visible) => !visible)}
                    aria-label={isVisible ? "הסתרת הסיסמה" : "הצגת הסיסמה"}
                    aria-pressed={isVisible}
                >
                    {isVisible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
            </div>
            {error && <p className="field-error" role="alert">{error}</p>}
            {!error && hint && <p className="field-hint">{hint}</p>}
        </div>
    );
}

function ChangePasswordForm() {
    const id = useId();
    const [changePassword, { isLoading }] = useChangePasswordMutation();
    const [successMessage, setSuccessMessage] = useState("");
    const {
        register,
        handleSubmit,
        reset,
        setError,
        clearErrors,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<ChangePasswordFormValues>({
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    });

    const onChange = () => {
        setSuccessMessage("");
        clearErrors("root.server");
    };

    const submit = handleSubmit(async (values) => {
        setSuccessMessage("");
        try {
            await changePassword(values).unwrap();
            reset();
            setSuccessMessage("הסיסמה עודכנה. מכשירים אחרים שהיו מחוברים לחשבון נותקו.");
        } catch (error) {
            const info = readApiError(error);
            if (info.code === "INVALID_CURRENT_PASSWORD") {
                setError("currentPassword", { message: "הסיסמה הנוכחית שגויה." }, { shouldFocus: true });
            } else if (info.status === 400 && Object.keys(info.fieldErrors).length > 0) {
                for (const field of ["currentPassword", "newPassword", "confirmPassword"] as const) {
                    if (info.fieldErrors[field]) setError(field, { message: info.fieldErrors[field] });
                }
            } else if (info.status === 429) {
                setError("root.server", { message: "יותר מדי ניסיונות. נסי שוב בעוד כמה דקות." });
            } else if (info.status === "FETCH_ERROR") {
                setError("root.server", { message: "אין חיבור לשרת. בדקי את החיבור ונסי שוב." });
            } else {
                setError("root.server", { message: "לא הצלחנו לעדכן את הסיסמה. נסי שוב." });
            }
        }
    });

    const isSaving = isLoading || isSubmitting;

    return (
        <section className="card card-accent card-pad" aria-labelledby={`${id}-title`}>
            <div className="mb-6 flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lilac-mist text-lilac" aria-hidden="true">
                    <KeyRound size={19} />
                </span>
                <div>
                    <h2 id={`${id}-title`} className="section-title">שינוי סיסמה</h2>
                    <p className="mt-1 text-sm text-ink-soft">לאחר השינוי, כל המכשירים האחרים יתנתקו מהחשבון.</p>
                </div>
            </div>

            <form onSubmit={submit} noValidate className="space-y-5">
                <PasswordInput
                    id={`${id}-current`}
                    label="סיסמה נוכחית"
                    autoComplete="current-password"
                    disabled={isSaving}
                    error={errors.currentPassword?.message}
                    registration={register("currentPassword", {
                        onChange,
                        validate: (value) => value.length > 0 || "יש להזין את הסיסמה הנוכחית.",
                    })}
                />
                <PasswordInput
                    id={`${id}-new`}
                    label="סיסמה חדשה"
                    autoComplete="new-password"
                    disabled={isSaving}
                    error={errors.newPassword?.message}
                    hint="לפחות 8 תווים, אות גדולה, אות קטנה, מספר ותו מיוחד."
                    registration={register("newPassword", {
                        onChange,
                        validate: {
                            required: (value) => value.length > 0 || "יש להזין סיסמה חדשה.",
                            strength: (value) =>
                                STRONG_PASSWORD.test(value) ||
                                "הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה, מספר ותו מיוחד.",
                            max: (value) => value.length <= 128 || "הסיסמה ארוכה מדי.",
                            different: (value) =>
                                value !== getValues("currentPassword") || "הסיסמה החדשה חייבת להיות שונה מהנוכחית.",
                        },
                    })}
                />
                <PasswordInput
                    id={`${id}-confirm`}
                    label="אימות סיסמה חדשה"
                    autoComplete="new-password"
                    disabled={isSaving}
                    error={errors.confirmPassword?.message}
                    registration={register("confirmPassword", {
                        onChange,
                        validate: {
                            required: (value) => value.length > 0 || "יש להקליד שוב את הסיסמה החדשה.",
                            matches: (value) => value === getValues("newPassword") || "הסיסמאות אינן תואמות.",
                        },
                    })}
                />

                {errors.root?.server?.message && <p className="alert-error" role="alert">{errors.root.server.message}</p>}
                {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

                <div className="border-t border-line pt-5">
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                        {isSaving ? "מעדכנת סיסמה..." : "עדכון סיסמה"}
                    </button>
                </div>
            </form>
        </section>
    );
}

function ProfilePage() {
    const user = useSelector((state: RootState) => state.auth.user);
    const isSystemAdmin = user?.role === "SystemAdmin";
    const { data: classes, isLoading: isClassesLoading, isError: isClassesError } = useGetMyClassesQuery();

    if (!user) return null;

    return (
        <main className="page">
            <PageHeader title="הפרופיל שלי" description="הפרטים שלך, והסיסמה לכניסה." />

            <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-12">
                <div className="space-y-7 lg:order-1">
                    <ProfileDetailsForm />
                    <ChangePasswordForm />
                </div>

                <aside className="border border-line bg-sand-l/60 p-7 lg:sticky lg:top-28 lg:order-2">
                    <div>
                        <Avatar name={user.name} size="xl" />
                        <h2 className="mt-5 font-display text-[1.6rem] leading-tight font-normal">{user.name}</h2>
                        <p className="mt-1 truncate text-[15px] text-ink-soft" dir="ltr">{user.email}</p>
                        <span className={`badge mt-4 ${isSystemAdmin ? "border-lilac/30 bg-lilac-mist text-lilac" : "border-mist-strong bg-mist text-blue"}`}>
                            {isSystemAdmin && <ShieldCheck size={13} aria-hidden="true" />}
                            {isSystemAdmin ? "מנהלת מערכת" : "משתמשת"}
                        </span>

                        <div className="mt-7 border-t border-line pt-6">
                            <h3 className="section-label">הכיתות שלי</h3>
                            {isClassesLoading ? (
                                <LoadingState label="טוענת כיתות..." compact />
                            ) : isClassesError ? (
                                <p className="mt-2 text-sm text-coral">לא הצלחנו לטעון את הכיתות.</p>
                            ) : !classes?.length ? (
                                <p className="mt-2 text-sm text-ink-soft">
                                    עדיין אין כיתות. <Link className="link" to="/my-classes">להצטרפות או ליצירת כיתה</Link>
                                </p>
                            ) : (
                                <ul className="mt-3 space-y-2">
                                    {classes.map((classItem) => (
                                        <li key={classItem.id}>
                                            <Link
                                                to={`/class/${classItem.id}/members`}
                                                className="flex items-center justify-between gap-3 border-b border-line py-3 text-[15px] transition hover:text-blue"
                                            >
                                                <span className="flex min-w-0 items-center gap-2 font-semibold text-ink">
                                                    <School size={15} className="shrink-0 text-teal" aria-hidden="true" />
                                                    <span className="truncate">{classItem.name}</span>
                                                </span>
                                                <span className="shrink-0 text-xs text-ink-soft">
                                                    {classItem.role === "ClassManager" ? "מנהלת" : "חברה"}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}

export default ProfilePage;
