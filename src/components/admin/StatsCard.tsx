import type { ReactNode } from "react";
import { Link } from "react-router";

interface StatsCardProps {
	icon: ReactNode;
	label: string;
	value?: number | null;
	note?: ReactNode;
	to?: string;
}

/** כרטיס נתון: קו עליון עבה, מספר גדול ושורת הסבר — כמו ב"יחד". */
function StatsCard({ icon, label, value, note, to }: StatsCardProps) {
	const hasValidValue = typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
	const content = (
		<>
			<span className="text-blue" aria-hidden="true">{icon}</span>
			<span className="font-display text-[2.75rem] leading-[1.05] font-medium tabular-nums text-ink">
				{hasValidValue ? value.toLocaleString("he-IL") : "–"}
			</span>
			<span className="font-bold">{label}</span>
			{note && <span className="text-sm text-ink-soft">{note}</span>}
		</>
	);
	const className = "flex flex-col gap-1.5 border border-line border-t-[3px] border-t-ink bg-surface px-6 py-6 transition";

	return to ? (
		<Link to={to} className={`${className} hover:border-t-blue hover:bg-sand-l/40`}>{content}</Link>
	) : (
		<div className={className}>{content}</div>
	);
}

export default StatsCard;
