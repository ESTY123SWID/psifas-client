import { Users } from "lucide-react";

import type { AdminUsersTableProps } from "../../types/admin.types";
import { EmptyState } from "../ui/States";
import AdminUserRow from "./AdminUserRow";

/** רשימת המשתמשות — שורות לחיצות שפותחות את חלונית הפרטים. */
function UsersTable({ users, onSelectUser }: AdminUsersTableProps) {
	if (users.length === 0) {
		return (
			<div className="border-t border-ink">
				<EmptyState compact icon={<Users size={36} strokeWidth={1.3} />} title="לא נמצאו משתמשות" text="נסי לשנות את החיפוש או את הסינון." />
			</div>
		);
	}

	return (
		<ul aria-label="משתמשות" className="border-t border-ink">
			{users.map((user) => (
				<AdminUserRow key={user.id} user={user} onSelect={onSelectUser} />
			))}
		</ul>
	);
}

export default UsersTable;
