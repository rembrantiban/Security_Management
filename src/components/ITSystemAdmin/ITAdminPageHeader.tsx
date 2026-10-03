import type { LucideIcon } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

/**
 * Shared header for the IT / System Administrator console pages.
 *
 * Keeps RBAC Policies (2.28), Permission Matrix (2.29), and Security Settings
 * (2.30) visually consistent with every other page header.
 */

type ITAdminPageHeaderProps = {
    /** Functional-spec reference, e.g. "2.28". Kept for traceability; not displayed. */
    reference: string;
    title: string;
    description: string;
    /** Kept for API compatibility; the plain header style shows no icon. */
    icon: LucideIcon;
    /** Optional right-aligned slot (actions, counters, tabs). */
    actions?: React.ReactNode;
};

export default function ITAdminPageHeader({
    title,
    description,
    actions,
}: ITAdminPageHeaderProps) {
    return (
        <PageHeader
            eyebrow="IT System Administrator"
            title={title}
            description={description}
            actions={actions}
        />
    );
}
