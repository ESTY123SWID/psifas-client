import { NavLink, useLocation } from "react-router";
import { useSelector } from "react-redux";

import type { RootState } from "../../app/store";
import type { HeaderNavProps } from "../../types/navigation.types.tsx";
import { adminLinks, personalLinks } from "../../config/navigation.config";

function HeaderNav({ isSystemAdmin, mode }: HeaderNavProps) {
    const location = useLocation();
    const selectedClassId = useSelector((state: RootState) => state.class.selectedClassId);
    const isAdminMode = isSystemAdmin && mode === "admin";

    const links = isAdminMode
        ? adminLinks
        : [
            ...personalLinks.flatMap((link) => {
                if (!link.to.includes("{classId}")) return [link];
                return selectedClassId === null ? [] : [{ ...link, to: link.to.replace("{classId}", String(selectedClassId)) }];
            }),
            ...(isSystemAdmin ? [{ to: "/admin", label: "ניהול מערכת" }] : []),
        ];

    const isActive = (to: string, routerActive: boolean) => {
        if (to.endsWith("/posts")) return /^\/class\/\d+\/posts/.test(location.pathname);
        if (to === "/my-classes") return routerActive || /^\/class\/\d+\/members/.test(location.pathname);
        return routerActive;
    };

    return (
        <nav aria-label="ניווט ראשי" className="flex flex-col gap-1 lg:flex-row lg:gap-7">
            {links.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === "/admin" || link.to === "/home"}
                    className={({ isActive: routerActive }) => {
                        const active = isActive(link.to, routerActive);
                        return `border-b py-3 font-semibold whitespace-nowrap transition-colors lg:py-1.5 ${
                            active
                                ? "border-line text-blue lg:border-ink lg:text-ink"
                                : "border-line text-ink-soft hover:text-ink lg:border-transparent"
                        }`;
                    }}
                >
                    {link.label}
                </NavLink>
            ))}
        </nav>
    );
}

export default HeaderNav;
