import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

import type { EditPostFormValues, EditPostModalProps } from "../../types/posts.types";
import { useUpdatePostMutation } from "../../services/postsApi";
import ImagePicker from "../ui/ImagePicker";
import Modal from "../ui/Modal";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function EditPostModal({ classId, post, onClose }: EditPostModalProps) {
	const id = useId();
	const [image, setImage] = useState<File | null>(null);
	const [removeImage, setRemoveImage] = useState(false);
	const [updatePost, { isLoading, isError }] = useUpdatePostMutation();
	const requestRef = useRef<ReturnType<typeof updatePost> | null>(null);
	const {
		register,
		handleSubmit,
		setError,
		clearErrors,
		formState: { errors, isSubmitting },
	} = useForm<EditPostFormValues>({
		defaultValues: {
			title: post.title?.trim() ?? "",
			content: post.content?.trim() ?? "",
		},
	});

	const handleCancel = () => {
		requestRef.current?.abort();
		onClose();
	};

	const submitChanges = handleSubmit(async (values) => {
		if (isLoading) return;

		if (image && !ALLOWED_IMAGE_TYPES.includes(image.type)) {
			setError("root.server", { message: "יש לבחור תמונה מסוג JPG, PNG או WebP." });
			return;
		}
		if (image && image.size > MAX_IMAGE_SIZE) {
			setError("root.server", { message: "גודל התמונה לא יכול לעלות על 5MB." });
			return;
		}

		const formData = new FormData();
		formData.append("type", post.type);
		formData.append("title", values.title.trim());
		formData.append("content", values.content.trim());
		if (image) {
			formData.append("image", image);
		} else if (removeImage) {
			formData.append("removeImage", "true");
		}

		const request = updatePost({ classId, postId: post.id, formData });
		requestRef.current = request;
		try {
			await request.unwrap();
			onClose();
		} catch {
			setError("root.server", { message: "לא הצלחנו לשמור את השינויים. נסי שוב." });
		} finally {
			requestRef.current = null;
		}
	});
	const isSaving = isLoading || isSubmitting;

	return (
		// Escape and the close button cancel (and abort a pending save); a click outside does not, so edits are not lost.
		<Modal labelledBy={`${id}-title`} onClose={handleCancel} closeOnBackdrop={false}>
				<header className="mb-5 flex items-start justify-between gap-4">
					<div>
						<p className="eyebrow mb-1 text-lilac">מלטשות את הזיכרון</p>
						<h2 className="font-display text-2xl font-normal text-ink" id={`${id}-title`}>עריכת פרסום</h2>
					</div>
					<button type="button" onClick={handleCancel} aria-label="סגירת החלונית" className="icon-btn">
						<X size={18} aria-hidden="true" />
					</button>
				</header>

				<form onSubmit={submitChanges} noValidate className="space-y-4 sm:space-y-5">
					<div>
						<label className="field-label" htmlFor={`${id}-heading`}>כותרת הפרסום</label>
						<input
							id={`${id}-heading`}
							maxLength={150}
							disabled={isSaving}
							className="input"
							aria-invalid={Boolean(errors.title)}
							{...register("title", {
								validate: {
									required: (value) => value.trim().length > 0 || "יש להזין כותרת.",
									maxLengthTrimmed: (value) => value.trim().length <= 150 || "הכותרת לא יכולה לעלות על 150 תווים.",
								},
								onChange: () => clearErrors("root.server"),
							})}
						/>
						{errors.title?.message && <p className="field-error" role="alert">{errors.title.message}</p>}
					</div>

					<div>
						<label className="field-label" htmlFor={`${id}-content`}>
							{post.type === "quote" ? "תוכן המשפט" : "תיאור התמונה"}
						</label>
						<textarea
							id={`${id}-content`}
							maxLength={2000}
							disabled={isSaving}
							className={`input min-h-28 resize-y ${post.type === "quote" ? "font-display text-base leading-7" : ""}`}
							aria-invalid={Boolean(errors.content)}
							{...register("content", {
								validate: {
									requiredForQuote: (value) => post.type !== "quote" || value.trim().length > 0 || "יש להזין את תוכן המשפט.",
									maxLengthTrimmed: (value) => value.trim().length <= 2000 || "התוכן לא יכול לעלות על 2000 תווים.",
								},
								onChange: () => clearErrors("root.server"),
							})}
						/>
						{errors.content?.message && <p className="field-error" role="alert">{errors.content.message}</p>}
					</div>

					{post.type === "image" && (
						<div>
							<span className="field-label">תמונה <span className="font-normal text-ink-soft">(אפשר להחליף)</span></span>
							<ImagePicker
								id={`${id}-image`}
								file={image}
								existingUrl={removeImage ? null : post.imageUrl}
								disabled={isSaving}
								onChange={(event) => {
									setImage(event.currentTarget.files?.[0] ?? null);
									setRemoveImage(false);
									clearErrors("root.server");
								}}
							/>
							{post.imageUrl && !image && (
								<label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-paper px-3 py-2 text-sm text-ink">
									<input
										type="checkbox"
										className="h-4 w-4 accent-coral"
										checked={removeImage}
										disabled={isSaving}
										onChange={(event) => setRemoveImage(event.currentTarget.checked)}
									/>
									הסרת התמונה הקיימת
								</label>
							)}
						</div>
					)}

					{errors.root?.server?.message && <p className="alert-error" role="alert">{errors.root.server.message}</p>}
					{isError && !errors.root?.server && (
						<p className="alert-error" role="alert">לא הצלחנו לשמור את השינויים. נסי שוב.</p>
					)}

					<div className="flex justify-end gap-2.5 border-t border-line pt-5">
						<button className="btn btn-secondary" type="button" onClick={handleCancel}>
							{isSaving ? "ביטול פעולה" : "ביטול"}
						</button>
						<button className="btn btn-brand" type="submit" disabled={isSaving}>
							{isSaving ? "שומרת..." : "שמירת שינויים"}
						</button>
					</div>
				</form>
		</Modal>
	);
}

export default EditPostModal;
