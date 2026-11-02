import { School } from "lucide-react";

import type { AdminClassesTableProps } from "../../types/admin.types";
import { EmptyState } from "../ui/States";
import AdminClassRow from "./AdminClassRow";

/** רשימת הכיתות — כל שורה מובילה לעמוד הכיתה. */
function ClassesTable({ classes, onSelectClass }: AdminClassesTableProps) {
	if (classes.length === 0) {
		return (
			<div className="border-t border-ink">
				<EmptyState compact icon={<School size={36} strokeWidth={1.3} />} title="לא נמצאו כיתות" text="נסי לשנות את החיפוש." />
			</div>
		);
	}

	return (
		<ul aria-label="כיתות" className="border-t border-ink">
			{classes.map((classItem) => (
				<AdminClassRow key={classItem.id} classItem={classItem} onSelect={onSelectClass} />
			))}
		</ul>
	);
}

export default ClassesTable;
