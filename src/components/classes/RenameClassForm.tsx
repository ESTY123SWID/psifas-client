import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";

import type { RenameClassFormProps, RenameClassFormValues } from "../../types/class.types";
import { useUpdateClassMutation } from "../../services/classesApi";

function RenameClassForm({ classId, currentName }: RenameClassFormProps) {
    const [successMessage, setSuccessMessage] = useState("");
    const [updateClass, { isLoading, isError, reset: resetMutation }] = useUpdateClassMutation();
    const {
        register,
        handleSubmit,
        reset,
        setError,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<RenameClassFormValues>({ defaultValues: { name: currentName } });

    useEffect(() => {
        reset({ name: currentName });
        setSuccessMessage("");
    }, [classId, currentName, reset]);

    const submitRename = handleSubmit(async (values) => {
        const newName = values.name.trim();
        if (isLoading || isSubmitting) return;
        setSuccessMessage("");
        resetMutation();
        try {
            const result = await updateClass({ classId, name: newName }).unwrap();
            if (typeof result?.name !== "string" || !result.name.trim()) {
                setError("root.server", { message: "השרת לא החזיר את שם הכיתה המעודכן." });
                return;
            }
            reset({ name: result.name });
            setSuccessMessage("שם הכיתה עודכן.");
        } catch {
            setError("root.server", { message: "לא הצלחנו לשנות את שם הכיתה. נסי שוב." });
        }
    });
    const isSaving = isLoading || isSubmitting;

    return (
        <section className="card card-pad">
            <p className="eyebrow mb-1">פרטי הכיתה</p>
            <h2 className="section-title">שינוי שם הכיתה</h2>
            <form onSubmit={submitRename} noValidate className="mt-4 space-y-3">
                <div>
                    <label className="field-label" htmlFor={`class-name-${classId}`}>שם הכיתה</label>
                    <input
                        id={`class-name-${classId}`}
                        className="input"
                        disabled={isSaving}
                        aria-invalid={Boolean(errors.name || errors.root?.server)}
                        {...register("name", {
                            validate: {
                                required: (value) => value.trim().length > 0 || "יש להזין שם כיתה.",
                                maxLength: (value) => value.trim().length <= 100 || "שם הכיתה לא יכול לעלות על 100 תווים.",
                                changed: (value) => value.trim() !== currentName.trim() || "שם הכיתה לא השתנה.",
                            },
                            onChange: () => {
                                setSuccessMessage("");
                                clearErrors("root.server");
                            },
                        })}
                    />
                    {errors.name?.message && <p className="field-error" role="alert">{errors.name.message}</p>}
                </div>
                {errors.root?.server?.message && <p className="alert-error" role="alert">{errors.root.server.message}</p>}
                {isError && !errors.root?.server && <p className="alert-error" role="alert">לא הצלחנו לשנות את שם הכיתה. נסי שוב.</p>}
                {successMessage && (
                    <p className="alert-success flex items-center gap-2" role="status">
                        <CheckCircle2 size={16} aria-hidden="true" />
                        {successMessage}
                    </p>
                )}
                <button type="submit" className="btn btn-primary w-full" disabled={isSaving}>
                    {isSaving ? "שומרת..." : "שמירת שם הכיתה"}
                </button>
            </form>
        </section>
    );
}

export default RenameClassForm;
