import type { ClassListProps } from "../../types/class.types";
import ClassListItem from "./ClassListItem";

function ClassList({ classes, selectedClassId, onSelectActive }: ClassListProps) {
	if (classes.length === 0) return null;

	return (
		<ul aria-label="הכיתות שלי" className="border-t border-ink">
			{classes.map((classItem) => (
				<ClassListItem key={classItem.id} classItem={classItem} selectedClassId={selectedClassId} onSelectActive={onSelectActive} />
			))}
		</ul>
	);
}

export default ClassList;
