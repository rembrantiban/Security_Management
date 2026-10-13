import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Label } from "@/components/ui/label";

export const scheduleInputClass =
    "h-9 rounded-xl border-0 bg-slate-50 text-[12.5px] ring-1 ring-slate-200 placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-amber-300 aria-invalid:ring-red-300";

export const scheduleTextareaClass =
    "min-h-20 resize-none rounded-xl border-0 bg-slate-50 text-[12.5px] ring-1 ring-slate-200 placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-amber-300";

type PersonInitialsProps = {
    firstName: string;
    lastName: string;
    className: string;
};

export function PersonInitials({ firstName, lastName, className }: PersonInitialsProps) {
    return (
        <span
            aria-hidden="true"
            className={`flex shrink-0 items-center justify-center rounded-md font-semibold ${className}`}
        >
            {`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()}
        </span>
    );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-700">
                {title}
            </p>
            {children}
        </section>
    );
}

type FieldProps = {
    id: string;
    label: string;
    icon: LucideIcon;
    required?: boolean;
    optional?: boolean;
    hint?: string;
    children: ReactNode;
};

export function Field({ id, label, icon: Icon, required, optional, hint, children }: FieldProps) {
    return (
        <div className="space-y-1.5">
            <Label
                htmlFor={id}
                className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-700"
            >
                <Icon className="h-3.5 w-3.5 text-slate-500" />
                {label}
                {required && <span className="text-red-500">*</span>}
                {optional && <span className="font-normal text-slate-400">(optional)</span>}
            </Label>
            {children}
            {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
        </div>
    );
}
