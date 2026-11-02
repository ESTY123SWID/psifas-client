import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2, Copy } from "lucide-react";

import type { CreateClassFormProps, CreateClassFormValues } from "../../types/class.types";
import { useCreateClassMutation } from "../../services/classesApi";

function CreateClassForm({ onCreated }: CreateClassFormProps) {
	const id = useId();
	const [formError, setFormError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [inviteCode, setInviteCode] = useState<string | null>(null);
	const [copyMessage, setCopyMessage] = useState("");
	const submissionInProgress = useRef(false);
	const {
		register,
		handleSubmit,
		reset: resetForm,
		formState: { errors, isSubmitting },
	} = useForm<CreateClassFormValues>({ defaultValues: { name: "" } });
	const [createClass, { isLoading, isError, reset: resetMutation }] = useCreateClassMutation();

	const submitClass = handleSubmit(async (values) => {
		const className = values.name.trim();
		if (isLoading || isSubmitting || submissionInProgress.current) return;

		submissionInProgress.current = true;
		setFormError("");
		setSuccessMessage("");
		setInviteCode(null);
		setCopyMessage("");
		resetMutation();

		try {
			const response = await createClass({ name: className }).unwrap();
			if (!Number.isInteger(response?.id) || response.id <= 0) {
				setFormError("השרת החזיר פרטי כיתה לא תקינים.");
				return;
			}
			resetForm({ name: "" });
			setSuccessMessage("הכיתה נוצרה והוגדרה כפעילה.");
			setInviteCode(typeof response.inviteCode === "string" && response.inviteCode.trim() ? response.inviteCode.trim() : null);
			onCreated(response.id);
		} catch (error) {
			setFormError(
				error && typeof error === "object" && "status" in error && error.status === 409
					? "כיתה בשם הזה כבר קיימת."
					: "לא הצלחנו ליצור את הכיתה. נסי שוב."
			);
		} finally {
			submissionInProgress.current = false;
		}
	});
	const isSaving = isLoading || isSubmitting;

	const handleCopyInviteCode = async () => {
		if (!inviteCode) return;
		try {
			await navigator.clipboard.writeText(inviteCode);
			setCopyMessage("קוד ההצטרפות הועתק.");
		} catch {
			setCopyMessage("לא ניתן להעתיק כרגע. אפשר להעתיק את הקוד ידנית.");
		}
	};

	return (
		<section className="card card-pad">
			<h2 className="section-label mb-5">כיתה חדשה</h2>
			<p className="mb-6 font-light text-ink-2">פותחות כיתה, ומקבלות קוד הצטרפות לשלוח לכולן.</p>

			<form onSubmit={submitClass} noValidate className="space-y-6">
				<div>
					<label className="field-label" htmlFor={`${id}-name`}>שם הכיתה</label>
					<input
						id={`${id}-name`}
						disabled={isSaving}
						aria-invalid={Boolean(errors.name || formError)}
						placeholder="למשל: י״ב 3 · מחזור תשפ״ו"
						className="input"
						{...register("name", {
							validate: {
								required: (value) => value.trim().length > 0 || "יש להזין שם לכיתה.",
								maxLength: (value) => value.trim().length <= 100 || "שם הכיתה לא יכול לעלות על 100 תווים.",
							},
							onChange: () => {
								setFormError("");
								setSuccessMessage("");
								setCopyMessage("");
								resetMutation();
							},
						})}
					/>
					{errors.name?.message && <p className="field-error" role="alert">{errors.name.message}</p>}
				</div>

				{formError && <p className="alert-error" role="alert">{formError}</p>}
				{successMessage && (
					<p className="alert-success flex items-center gap-2" role="status">
						<CheckCircle2 size={16} aria-hidden="true" />
						{successMessage}
					</p>
				)}
				{isError && !formError && <p className="alert-error" role="alert">לא הצלחנו ליצור את הכיתה. נסי שוב.</p>}

				<button className="btn btn-brand" type="submit" disabled={isSaving}>
					{isSaving ? "יוצרת כיתה..." : "יצירת כיתה"}
				</button>
			</form>

			{inviteCode && (
				<div className="mt-7 border-t border-line pt-6">
					<p className="text-xs font-semibold text-ink-soft">קוד ההצטרפות לכיתה החדשה:</p>
					<div className="mt-2 flex items-center gap-2">
						<output dir="ltr" className="flex-1 border border-line bg-paper px-3 py-2 text-center font-mono text-lg font-bold tracking-[0.25em] text-blue">
							{inviteCode}
						</output>
						<button type="button" onClick={handleCopyInviteCode} className="btn btn-secondary btn-sm">
							<Copy size={15} aria-hidden="true" />
							העתקה
						</button>
					</div>
					{copyMessage && <p className="mt-2 text-xs text-teal" role="status">{copyMessage}</p>}
				</div>
			)}
		</section>
	);
}

export default CreateClassForm;
