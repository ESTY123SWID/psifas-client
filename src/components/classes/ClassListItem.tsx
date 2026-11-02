import { Link } from "react-router";
import { Check, School } from "lucide-react";

import type { ClassListItemProps } from "../../types/class.types";
import { formatDate } from "../ui/format";

function ClassListItem({ classItem, selectedClassId, onSelectActive }: ClassListItemProps) {
	const isActive = selectedClassId === classItem.id;
	const isManager = classItem.role === "ClassManager";
	const createdAt = formatDate(classItem.createdAt, { month: "long", year: "numeric" });

	return (
		<li className={`flex flex-wrap items-center gap-5 border-b border-line px-3 py-7 sm:px-7 ${isActive ? "bg-mist" : "bg-surface"}`}>
			<span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-blue" aria-hidden="true">
				<School size={21} strokeWidth={1.5} />
			</span>
			<div className="min-w-0 flex-1">
				<h2 className="truncate font-display text-[1.6rem] leading-tight font-normal">{classItem.name}</h2>
				<p className="mt-1 text-[15px] text-ink-soft">
					{isManager ? "מנהלת הכיתה" : "חברת כיתה"}
					{createdAt ? ` · נפתחה ב${createdAt}` : ""}
				</p>
			</div>
			<div className="flex items-center gap-5">
				{isActive ? (
					<span className="badge border-mist-strong bg-surface text-blue" aria-label="הכיתה הפעילה">
						<Check size={14} aria-hidden="true" />
						הכיתה הפעילה
					</span>
				) : (
					<button type="button" onClick={() => onSelectActive(classItem.id)} className="btn btn-secondary btn-sm">
						בחירה כפעילה
					</button>
				)}
				<Link to={`/class/${classItem.id}/members`} className="text-[15px] text-ink-2 underline underline-offset-4 hover:text-blue">
					לפרטים
				</Link>
			</div>
		</li>
	);
}

export default ClassListItem;
