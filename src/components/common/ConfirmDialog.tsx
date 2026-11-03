import { useId, useRef } from "react";
import { AlertTriangle } from "lucide-react";

import type { ConfirmDialogProps } from "../../types/posts.types";
import Modal from "../ui/Modal";

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
	const cancelRef = useRef<HTMLButtonElement>(null);

	return (
		<Modal
			role="alertdialog"
			size="sm"
			layer="top"
			labelledBy={`${id}-title`}
			describedBy={`${id}-message`}
			onClose={onCancel}
			dismissible={!isLoading}
			initialFocusRef={cancelRef}
		>
			<div className="flex items-start gap-4">
				<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coral-mist text-coral" aria-hidden="true">
					<AlertTriangle size={20} />
				</span>
				<div className="min-w-0">
					<h2 className="font-display text-[1.6rem] leading-tight font-normal" id={`${id}-title`}>{title}</h2>
					<p className="mt-2 leading-7 font-light text-ink-2" id={`${id}-message`}>{message}</p>
				</div>
			</div>

			{errorMessage && <p className="alert-error mt-5" role="alert">{errorMessage}</p>}

			<div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
				<button ref={cancelRef} type="button" className="btn btn-secondary" onClick={onCancel}>
					{isLoading ? "ביטול פעולה" : "ביטול"}
				</button>
				<button className="btn btn-danger" type="button" onClick={onConfirm} disabled={isLoading}>
					{isLoading ? loadingLabel : confirmLabel}
				</button>
			</div>
		</Modal>
	);
}

export default ConfirmDialog;
