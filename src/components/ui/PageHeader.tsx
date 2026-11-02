import type { ReactNode } from "react";

interface PageHeaderProps {
    eyebrow?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    children?: ReactNode;
}

/** כותרת עמוד: מילה קטנה מרווחת, כותרת גדולה ודקה ושורת הסבר. */
function PageHeader({ eyebrow, title, description, actions, children }: PageHeaderProps) {
    return (
        <header className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                {eyebrow && <p className="mb-3.5 text-[13px] font-semibold tracking-[0.14em] text-blue">{eyebrow}</p>}
                <h1 className="page-title">{title}</h1>
                {description && <p className="page-sub mt-2 max-w-2xl">{description}</p>}
                {children}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
        </header>
    );
}

export default PageHeader;
