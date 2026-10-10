import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ExternalLink, File as FileIcon, Loader2, Paperclip, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    INCIDENT_CATEGORIES,
    type Category,
    type IncidentFormValues,
    type Severity,
} from "./incidentForm";

/** UI building blocks shared by the Report / Update incident modals. */

const SEVERITIES: { value: Severity; dot: string }[] = [
    { value: "Low", dot: "bg-slate-400" },
    { value: "Medium", dot: "bg-amber-500" },
    { value: "High", dot: "bg-orange-600" },
    { value: "Critical", dot: "bg-red-600" },
];

/** Matches the server's multer limit for `incident_image`. */
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const inputClass =
    "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100";

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPdfUrl(url: string) {
    return /\.pdf($|\?)/i.test(url);
}

/** Dialog frame shared by the Report / Update incident modals. */
export function IncidentFormDialog({
    open,
    onClose,
    title,
    description,
    submitLabel,
    submittingLabel,
    canSubmit,
    isSubmitting,
    onSubmit,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    description: string;
    submitLabel: string;
    submittingLabel: string;
    canSubmit: boolean;
    isSubmitting: boolean;
    onSubmit: () => void;
    children: React.ReactNode;
}) {
    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="gap-0 overflow-hidden rounded-2xl border border-slate-200 p-0 sm:max-w-lg">
                <DialogHeader className="border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700 ring-1 ring-orange-100">
                            <AlertTriangle className="h-4 w-4" />
                        </span>
                        <div>
                            <DialogTitle className="text-[14px] font-semibold tracking-tight text-slate-900">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="mt-0.5 text-[11.5px] text-slate-500">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">{children}</div>

                <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-none border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="h-9 rounded-lg border-slate-200 px-4 text-[13px] text-slate-700 shadow-none hover:bg-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={onSubmit}
                        disabled={!canSubmit || isSubmitting}
                        className="h-9 gap-2 rounded-lg bg-stone-900 px-4 text-[13px] font-medium text-white shadow-none hover:bg-stone-700 disabled:opacity-40"
                    >
                        {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {isSubmitting ? submittingLabel : submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function Field({
    label,
    htmlFor,
    required,
    hint,
    children,
}: {
    label: string;
    htmlFor?: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <label htmlFor={htmlFor} className="text-[12px] font-medium text-slate-700">
                    {label}
                    {required && <span className="ml-0.5 text-red-500">*</span>}
                </label>
                {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
            </div>
            {children}
        </div>
    );
}

/** Title, category, location, severity and description fields. */
export function IncidentDetailsFields({
    values,
    onChange,
}: {
    values: IncidentFormValues;
    onChange: (patch: Partial<IncidentFormValues>) => void;
}) {
    return (
        <>
            <Field label="Incident title" htmlFor="incident-title" required>
                <input
                    id="incident-title"
                    value={values.title}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="e.g. Unauthorized entry at Gate 2"
                    className={inputClass}
                />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category" htmlFor="incident-category" required>
                    <select
                        id="incident-category"
                        value={values.category}
                        onChange={(e) => onChange({ category: e.target.value as Category })}
                        className={`${inputClass} ${values.category === "" ? "text-slate-400" : ""}`}
                    >
                        <option value="" disabled>
                            Select category
                        </option>
                        {INCIDENT_CATEGORIES.map((c) => (
                            <option key={c} value={c} className="text-slate-900">
                                {c}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field label="Location" htmlFor="incident-location" required>
                    <input
                        id="incident-location"
                        value={values.location}
                        onChange={(e) => onChange({ location: e.target.value })}
                        placeholder="e.g. Gate 2, Main Campus"
                        className={inputClass}
                    />
                </Field>
            </div>

            {values.category === "Other" && (
                <Field label="Specify category" htmlFor="incident-other" required>
                    <input
                        id="incident-other"
                        value={values.otherCategory}
                        onChange={(e) => onChange({ otherCategory: e.target.value })}
                        placeholder="Enter incident category"
                        className={inputClass}
                    />
                </Field>
            )}

            <Field label="Severity">
                <div
                    role="radiogroup"
                    aria-label="Severity"
                    className="grid grid-cols-4 gap-1 rounded-lg bg-slate-50 p-1 ring-1 ring-slate-200"
                >
                    {SEVERITIES.map((s) => {
                        const selected = values.severity === s.value;
                        return (
                            <button
                                key={s.value}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => onChange({ severity: s.value })}
                                className={`inline-flex h-7 items-center justify-center gap-1.5 rounded-md text-[12px] font-medium transition-colors ${
                                    selected
                                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                                        : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                                {s.value}
                            </button>
                        );
                    })}
                </div>
            </Field>

            <Field label="Description" htmlFor="incident-description" required>
                <textarea
                    id="incident-description"
                    value={values.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    placeholder="Describe what happened, who was involved, and any other relevant details."
                    rows={4}
                    className={`${inputClass} h-auto resize-none py-2 leading-relaxed`}
                />
            </Field>
        </>
    );
}

/**
 * Single evidence attachment (the API accepts one file). When `currentUrl`
 * is given, the existing evidence is shown and a new file replaces it.
 */
export function EvidencePicker({
    file,
    onFileChange,
    currentUrl,
}: {
    file: File | null;
    onFileChange: (file: File | null) => void;
    currentUrl?: string | null;
}) {
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const preview = useMemo(
        () => (file?.type.startsWith("image/") ? URL.createObjectURL(file) : undefined),
        [file]
    );

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    function select(next: File | undefined) {
        if (!next) return;

        if (!next.type.startsWith("image/") && next.type !== "application/pdf") {
            setError("Only images or PDF files are allowed.");
            return;
        }
        if (next.size > MAX_FILE_BYTES) {
            setError(`File is too large (${formatBytes(next.size)}). Maximum is 5 MB.`);
            return;
        }

        setError("");
        onFileChange(next);
    }

    const openPicker = () => inputRef.current?.click();

    return (
        <Field
            label="Evidence"
            hint={currentUrl ? "Image or PDF, max 5 MB" : "Optional · image or PDF, max 5 MB"}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                    select(e.target.files?.[0]);
                    e.target.value = "";
                }}
            />

            {file ? (
                <FileRow
                    thumbnail={preview}
                    name={file.name}
                    meta={currentUrl ? `${formatBytes(file.size)} · replaces current evidence` : formatBytes(file.size)}
                    action={
                        <button
                            type="button"
                            onClick={() => onFileChange(null)}
                            aria-label="Remove file"
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    }
                />
            ) : currentUrl ? (
                <FileRow
                    thumbnail={isPdfUrl(currentUrl) ? undefined : currentUrl}
                    name="Current evidence"
                    meta={
                        <a
                            href={currentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-slate-800 hover:underline"
                        >
                            View file
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    }
                    action={
                        <button
                            type="button"
                            onClick={openPicker}
                            className="h-7 rounded-md px-2.5 text-[12px] font-medium text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
                        >
                            Replace
                        </button>
                    }
                />
            ) : (
                <button
                    type="button"
                    onClick={openPicker}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        select(e.dataTransfer.files?.[0]);
                    }}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-3 text-[12.5px] transition-colors ${
                        dragActive
                            ? "border-slate-400 bg-slate-50 text-slate-700"
                            : "border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                >
                    <Paperclip className="h-3.5 w-3.5" />
                    <span>
                        <span className="font-medium text-slate-800">Attach a file</span> or drag it here
                    </span>
                </button>
            )}

            {error && (
                <p role="alert" className="mt-1.5 text-[11.5px] text-red-600">
                    {error}
                </p>
            )}
        </Field>
    );
}

function FileRow({
    thumbnail,
    name,
    meta,
    action,
}: {
    thumbnail?: string;
    name: string;
    meta: React.ReactNode;
    action: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-50 ring-1 ring-slate-200">
                {thumbnail ? (
                    <img src={thumbnail} alt="" className="h-full w-full object-cover" />
                ) : (
                    <FileIcon className="h-4 w-4 text-slate-400" />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-slate-800">{name}</p>
                <div className="truncate text-[11px] text-slate-500">{meta}</div>
            </div>
            {action}
        </div>
    );
}
