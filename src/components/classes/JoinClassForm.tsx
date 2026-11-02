import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import type { JoinClassFormProps, JoinClassFormValues } from "../../types/class.types";
import { useJoinClassMutation } from "../../services/classesApi";

function getJoinErrorMessage(error: FetchBaseQueryError | SerializedError | undefined): string {
	if (error && "status" in error) {
		if (error.status === 409) return "את כבר חברה בכיתה הזו.";
		if (error.status === 410) return "קוד ההצטרפות פג תוקף.";
		if (error.status === 400 || error.status === 404) return "קוד ההצטרפות שגוי או לא תקף.";

		if (typeof error.data === "object" && error.data !== null && "code" in error.data) {
			if (error.data.code === "ALREADY_MEMBER") return "את כבר חברה בכיתה הזו.";
			if (error.data.code === "INVITE_EXPIRED") return "קוד ההצטרפות פג תוקף.";
			if (error.data.code === "INVITE_INVALID") return "קוד ההצטרפות שגוי או לא תקף.";
		}
	}
	return "לא הצלחנו להצטרף לכיתה. בדקי את הקוד ונסי שוב.";
}

function JoinClassForm({ onJoined }: JoinClassFormProps) {
	const id = useId();
	const [formError, setFormError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const submissionInProgress = useRef(false);
	const {
		register,
		handleSubmit,
		reset: resetForm,
		formState: { errors, isSubmitting },
	} = useForm<JoinClassFormValues>({ defaultValues: { inviteCode: "" } });
	const [joinClass, { isLoading, isError, error, reset }] = useJoinClassMutation();

	const submitJoin = handleSubmit(async (values) => {
		const normalizedCode = values.inviteCode.trim();
		if (isLoading || isSubmitting || submissionInProgress.current) return;

		submissionInProgress.current = true;
		setFormError("");
		setSuccessMessage("");
		reset();

		try {
			const response = await joinClass({ inviteCode: normalizedCode }).unwrap();
			if (!Number.isInteger(response?.classId) || response.classId <= 0) {
				setFormError("השרת החזיר פרטי כיתה לא תקינים.");
				return;
			}
			resetForm({ inviteCode: "" });
			setSuccessMessage("הצטרפת לכיתה והיא הוגדרה כפעילה.");
			onJoined(response.classId);
		} catch (requestError) {
			setFormError(getJoinErrorMessage(requestError as FetchBaseQueryError | SerializedError));
		} finally {
			submissionInProgress.current = false;
		}
	});
	const isSaving = isLoading || isSubmitting;

	return (
		<section className="card card-pad" aria-labelledby={`${id}-title`}>
			<h2 id={`${id}-title`} className="section-label mb-5">הצטרפות לכיתה</h2>
			<p className="mb-6 font-light text-ink-2">קיבלת קוד ממנהלת הכיתה? מדביקות אותו כאן.</p>
			<form onSubmit={submitJoin} noValidate className="space-y-6">
				<div>
					<label className="field-label" htmlFor={`${id}-invite-code`}>קוד הצטרפות</label>
					<input
						id={`${id}-invite-code`}
						autoComplete="off"
						dir="ltr"
						placeholder="ABCD2345"
						disabled={isSaving}
						aria-invalid={Boolean(formError || isError || errors.inviteCode)}
						className="input text-right tracking-[0.2em] uppercase"
						{...register("inviteCode", {
							validate: (value) => value.trim().length > 0 || "יש להזין קוד הצטרפות.",
							onChange: () => {
								setFormError("");
								setSuccessMessage("");
								reset();
							},
						})}
					/>
					{errors.inviteCode?.message && <p className="field-error" role="alert">{errors.inviteCode.message}</p>}
				</div>

				{formError && <p className="alert-error" role="alert">{formError}</p>}
				{successMessage && <p className="alert-success" role="status">{successMessage}</p>}
				{isError && !formError && <p className="alert-error" role="alert">{getJoinErrorMessage(error)}</p>}

				<button className="btn" type="submit" disabled={isSaving}>
					{isSaving ? "מצטרפת..." : "הצטרפות"}
				</button>
			</form>
		</section>
	);
}

export default JoinClassForm;
