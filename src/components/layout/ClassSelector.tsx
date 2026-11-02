import type { ClassSelectorProps } from "../../types/class.types";

/** מעבר בין כיתות — מוצג רק כשיש יותר מכיתה אחת. */
const ClassSelector = ({ classes, selectedClassId, onClassChange }: ClassSelectorProps) => {
    if (classes.length < 2) return null;

    return (
        <label className="block">
            <span className="sr-only">הכיתה הפעילה</span>
            <select
                value={selectedClassId ?? ""}
                onChange={(event) => onClassChange(Number(event.target.value))}
                aria-label="בחירת כיתה פעילה"
                className="select h-[38px] w-full cursor-pointer rounded-sm border border-line bg-paper pr-3 text-sm font-semibold text-ink outline-none focus:border-ink lg:max-w-[200px]"
            >
                {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                        {classItem.name}
                    </option>
                ))}
            </select>
        </label>
    );
};

export default ClassSelector;
