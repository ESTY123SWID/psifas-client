import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

import { useLoginMutation, useRegisterMutation } from "../../services/authApi";
import { setUser } from "../../features/auth/authSlice";
import type { AuthFormValues, AuthSessionResponse, User } from "../../types/auth.types";
import { isUser } from "../../types/auth.types";
import { homePathFor } from "../../routes/homePath";
import Brand from "../../components/ui/Brand";

interface LoginRegisterPageProps {
    mode: "login" | "register";
}

const LoginRegisterPage = ({ mode }: LoginRegisterPageProps) => {
    const isRegister = mode === "register";
    const [serverError, setServerError] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [login, { isLoading: isLoginLoading }] = useLoginMutation();
    const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
    const isLoading = isLoginLoading || isRegisterLoading;
    const {
        register: registerField,
        handleSubmit,
        formState: { errors },
    } = useForm<AuthFormValues>({
        defaultValues: { name: "", email: "", password: "" },
        shouldUnregister: true,
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const getLoginDestination = (loggedInUser: User): string => {
        const routeState = location.state as { from?: unknown } | null;
        const requestedPath = routeState?.from;
        if (
            typeof requestedPath !== "string" ||
            !requestedPath.startsWith("/") ||
            requestedPath.startsWith("//") ||
            requestedPath === "/login" ||
            requestedPath === "/register" ||
            requestedPath === "/"
        ) {
            return homePathFor(loggedInUser);
        }
        const requestedAdminPath = requestedPath === "/admin" || requestedPath.startsWith("/admin/");
        if (requestedAdminPath && loggedInUser.role !== "SystemAdmin") {
            return homePathFor(loggedInUser);
        }
        return requestedPath;
    };

    const handleAuthSubmit = handleSubmit(async (values) => {
        setServerError("");
        try {
            let result: AuthSessionResponse;
            if (isRegister) {
                result = await register({
                    name: values.name?.trim() ?? "",
                    email: values.email.trim(),
                    password: values.password,
                }).unwrap();
            } else {
                result = await login({
                    email: values.email.trim(),
                    password: values.password,
                }).unwrap();
            }

            if (!isUser(result?.user)) {
                setServerError("השרת לא החזיר פרטי משתמשת תקינים.");
                return;
            }
            dispatch(setUser(result.user));
            navigate(getLoginDestination(result.user), { replace: true });
        } catch (error: unknown) {
            if (typeof error === "object" && error !== null && "status" in error) {
                const apiError = error as { status: number | string };
                if (apiError.status === 401) {
                    setServerError("האימייל או הסיסמה שגויים.");
                } else if (apiError.status === 409) {
                    setServerError("כתובת האימייל כבר רשומה במערכת.");
                } else if (apiError.status === 429) {
                    setServerError("יותר מדי ניסיונות. נסי שוב בעוד כמה דקות.");
                } else if (apiError.status === "FETCH_ERROR") {
                    setServerError("לא ניתן להתחבר לשרת. נסי שוב מאוחר יותר.");
                } else {
                    setServerError("אירעה שגיאה בביצוע הפעולה.");
                }
            } else {
                setServerError("אירעה שגיאה בלתי צפויה.");
            }
        }
    });

    const tabClass = (active: boolean) =>
        `-mb-px border-b-2 py-2.5 text-[17px] font-semibold transition ${active ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"}`;

    return (
        <main
            dir="rtl"
            className="flex min-h-screen items-start justify-center bg-paper bg-[radial-gradient(circle_at_15%_10%,rgb(176_135_79/0.12),transparent_40%),radial-gradient(circle_at_90%_90%,rgb(45_92_88/0.08),transparent_45%)] px-4 py-10 sm:py-12"
        >
            <section className="card card-accent w-full max-w-[460px] animate-page-in px-6 py-9 shadow-lift sm:px-12 sm:py-11">
                <Link to="/" className="mb-7 inline-flex items-center gap-1.5 text-sm text-ink-2 transition hover:text-ink">
                    <ArrowRight size={16} aria-hidden="true" />
                    חזרה לדף הפתיחה
                </Link>

                <div className="mb-7">
                    <Brand size="md" />
                </div>

                <h1 className="font-display text-[2.6rem] leading-tight font-normal text-ink">
                    {isRegister ? "נעים להכיר" : "ברוכות השבות"}
                </h1>
                <p className="mt-1.5 text-[17px] font-light text-ink-soft">
                    {isRegister ? "פותחות חשבון ומצטרפות לארכיון הכיתתי." : "נכנסות, ורואות מה חדש בכיתה."}
                </p>

                <nav className="mt-8 flex gap-6 border-b border-line" aria-label="התחברות או הרשמה">
                    <Link to="/login" replace state={location.state} className={tabClass(!isRegister)} aria-current={!isRegister ? "page" : undefined}>
                        התחברות
                    </Link>
                    <Link to="/register" replace state={location.state} className={tabClass(isRegister)} aria-current={isRegister ? "page" : undefined}>
                        הרשמה
                    </Link>
                </nav>

                <form key={mode} onSubmit={handleAuthSubmit} noValidate className="mt-8 space-y-7">
                    {isRegister && (
                        <div>
                            <label className="field-label" htmlFor="name">שם מלא</label>
                            <input
                                type="text"
                                id="name"
                                autoComplete="name"
                                disabled={isLoading}
                                aria-invalid={Boolean(errors.name)}
                                className="input"
                                {...registerField("name", {
                                    onChange: () => setServerError(""),
                                    validate: {
                                        required: (value) => (value ?? "").trim().length > 0 || "נשמח לדעת איך קוראים לך.",
                                        minLengthAfterTrim: (value) => (value ?? "").trim().length >= 2 || "השם חייב להכיל לפחות 2 תווים",
                                    },
                                })}
                            />
                            {errors.name?.message && <p className="field-error">{errors.name.message}</p>}
                        </div>
                    )}

                    <div>
                        <label className="field-label" htmlFor="email">אימייל</label>
                        <input
                            type="email"
                            id="email"
                            dir="ltr"
                            autoComplete="email"
                            disabled={isLoading}
                            aria-invalid={Boolean(errors.email)}
                            className="input text-right"
                            {...registerField("email", {
                                onChange: () => setServerError(""),
                                validate: {
                                    required: (value) => value.trim().length > 0 || "צריך כתובת אימייל.",
                                    format: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || "כתובת האימייל אינה תקינה.",
                                },
                            })}
                        />
                        {errors.email?.message && <p className="field-error">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="field-label" htmlFor="password">סיסמה</label>
                        <div className="relative">
                            <input
                                type={isPasswordVisible ? "text" : "password"}
                                id="password"
                                dir="ltr"
                                autoComplete={isRegister ? "new-password" : "current-password"}
                                disabled={isLoading}
                                aria-invalid={Boolean(errors.password)}
                                className="input pl-10 text-right"
                                {...registerField("password", {
                                    onChange: () => setServerError(""),
                                    validate: {
                                        required: (value) => value.trim().length > 0 || "צריך סיסמה.",
                                        registrationStrength: (value) =>
                                            !isRegister ||
                                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value) ||
                                            "הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה, מספר ותו מיוחד.",
                                    },
                                })}
                            />
                            <button
                                type="button"
                                className="icon-btn absolute top-1/2 left-0 h-8 w-8 -translate-y-1/2"
                                onClick={() => setIsPasswordVisible((visible) => !visible)}
                                aria-label={isPasswordVisible ? "הסתרת הסיסמה" : "הצגת הסיסמה"}
                                aria-pressed={isPasswordVisible}
                            >
                                {isPasswordVisible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                            </button>
                        </div>
                        {errors.password?.message && <p className="field-error">{errors.password.message}</p>}
                        {isRegister && !errors.password && (
                            <p className="field-hint">לפחות 8 תווים, אות גדולה, אות קטנה, מספר ותו מיוחד.</p>
                        )}
                    </div>

                    {serverError && <p className="alert-error" role="alert">{serverError}</p>}

                    <button type="submit" disabled={isLoading} className="btn w-full">
                        {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-e-transparent" aria-hidden="true" />}
                        {isLoading ? (isRegister ? "יוצרת חשבון..." : "נכנסת...") : isRegister ? "יצירת חשבון" : "כניסה"}
                    </button>
                </form>

                <p className="mt-8 border-t border-line pt-6 text-center text-[15px] text-ink-soft">
                    {isRegister ? "כבר רשומה? " : "עוד אין לך חשבון? "}
                    <Link to={isRegister ? "/login" : "/register"} replace state={location.state} className="link">
                        {isRegister ? "להתחברות" : "להרשמה"}
                    </Link>
                </p>
            </section>
        </main>
    );
};

export default LoginRegisterPage;
