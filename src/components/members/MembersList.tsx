import type { MembersListProps } from "../../types/classMember.types";
import MemberRow from "./MemberRow";

function MembersList({
	classId,
	members,
	currentUserId,
	canManageMembers,
	managerCount,
	onCurrentUserRemoved,
}: MembersListProps) {
	if (members.length === 0) {
		return <p className="rounded-xl bg-paper px-4 py-6 text-center text-sm text-ink-soft">עדיין אין חברות להצגה בכיתה.</p>;
	}

	return (
		<ul aria-label="חברות הכיתה" className="divide-y divide-line/70">
			{members.map((member) => (
				<MemberRow
					key={`${classId}:${member.id}`}
					classId={classId}
					member={member}
					currentUserId={currentUserId}
					canManageMembers={canManageMembers}
					managerCount={managerCount}
					onCurrentUserRemoved={onCurrentUserRemoved}
				/>
			))}
		</ul>
	);
}

export default MembersList;
