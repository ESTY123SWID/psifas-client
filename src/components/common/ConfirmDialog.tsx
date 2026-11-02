import { useEffect, useId } from "react";
import { AlertTriangle } from "lucide-react";

import type { ConfirmDialogProps } from "../../types/posts.types";

function ConfirmDialog({
	title,
	message,
	confirmLabel,
	isLoading,
	loadingLabel = "מוחקת...",
	errorMessage,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	const id = useId();

	useEffect(() => {
		const handleKey = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !isLoading) onCancel();
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [isLoading, onCancel]);

	return (
		<div className="modal-backdrop z-[100]" role="presentation">
			<section
				className="modal-panel sm:max-w-md"
				role="alertdialog"
				aria-modal="true"
				aria-labelledby={`${id}-title`}
				aria-describedby={`${id}-message`}
			>
				<div className="flex items-start gap-4">
					<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-coral-mist text-coral" aria-hidden="true">
						<AlertTriangle size={20} />
					</span>
					<div>
						<h2 className="section-title" id={`${id}-title`}>{title}</h2>
						<p className="mt-2 text-sm leading-6 text-ink-soft" id={`${id}-message`}>{message}</p>
					</div>
				</div>

				{errorMessage && <p className="alert-error mt-5" role="alert">{errorMessage}</p>}

				<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<button type="button" className="btn btn-secondary" onClick={onCancel} autoFocus>
						{isLoading ? "ביטול פעולה" : "ביטול"}
					</button>
					<button className="btn btn-danger" type="button" onClick={onConfirm} disabled={isLoading}>
						{isLoading ? loadingLabel : confirmLabel}
					</button>
				</div>
			</section>
		</div>
	);
}

export default ConfirmDialog;
