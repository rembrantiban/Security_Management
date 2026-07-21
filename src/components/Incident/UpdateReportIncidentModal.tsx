import { useState, useRef, useEffect } from "react";
import {
    AlertTriangle,
    MapPin,
    FileText,
    Tag,
    Upload,
    X,
    File as FileIcon,
    Loader2,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIncidentReport } from "@/hooks/useIncidentsReport"
import type { Incident } from "@/store/useIncidentReportStore"
import { useToast } from "@/hooks/useToast";

type Severity = "Low" | "Medium" | "High" | "Critical";
type Category =
    | "Unauthorized Access"
    | "Theft"
    | "Vandalism"
    | "Suspicious Activity"
    | "Safety Hazard"
    | "Other";

type EvidenceFile = {
    id: string;
    file?: File;
    preview?: string;
    existing?: boolean;
};

type ReportIncidentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    incident: Incident | null;
};

const categories: Category[] = [
    "Unauthorized Access",
    "Theft",
    "Vandalism",
    "Suspicious Activity",
    "Safety Hazard",
    "Other",
];

const severities: { value: Severity; dot: string }[] = [
    { value: "Low", dot: "bg-gray-400" },
    { value: "Medium", dot: "bg-amber-500" },
    { value: "High", dot: "bg-orange-600" },
    { value: "Critical", dot: "bg-red-600" },
];



export default function UpdateReportIncidentModal({
    open,
    onOpenChange,
    incident,
}: ReportIncidentModalProps) {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<Category | "">("");
    const [otherCategory, setOtherCategory] = useState("");
    const [severity, setSeverity] = useState<Severity>("Medium");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [evidence, setEvidence] = useState<EvidenceFile[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { updateIncident, isLoading } = useIncidentReport();
    const { showToast } = useToast();


    useEffect(() => {
        if (!incident) return;
        //eslint-disable-next-line
        setTitle(incident.title);

        setCategory(incident.category as Category);

        setSeverity(incident.severity);

        setLocation(incident.location);

        setDescription(incident.description);

        // Show existing image (if any) when opening the modal
        setEvidence(
            incident.incident_image
                ? [
                      {
                          id: "existing-image",
                          preview: incident.incident_image,
                          existing: true,
                      },
                  ]
                : []
        );
    }, [incident]);

    const isValid =
        title.trim().length > 0 &&
        category !== "" &&
        location.trim().length > 0 &&
        description.trim().length > 0 &&
        (category !== "Other" || otherCategory.trim() !== "");

    function resetForm() {
        setTitle("");
        setCategory("");
        setSeverity("Medium");
        setLocation("");
        setDescription("");
        setEvidence(
            incident?.incident_image
                ? [
                    {
                        id: "existing-image",
                        preview: incident.incident_image,
                        existing: true,
                    },
                ]
                : []
        );
    }

    function handleClose() {
        onOpenChange(false);
        setTimeout(resetForm, 200);
    }

    function addFiles(files: FileList | File[]) {
        const arr = Array.from(files).slice(0, 6 - evidence.length);
        const mapped: EvidenceFile[] = arr.map((file) => ({
            id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`,
            file,
            preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        }));
        setEvidence((prev) => [...prev, ...mapped].slice(0, 6));
    }

    function removeFile(id: string) {
        setEvidence((prev) => prev.filter((f) => f.id !== id));
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    }
const handleSubmit = async () => {
    if (!isValid || !incident) return;

    // Only upload a newly selected file
    const newImage =
        evidence.find((item) => item.file)?.file ?? null;

    const success = await updateIncident(
        incident.incident_id,
        {
            title,
            category:
                category === "Other"
                    ? otherCategory
                    : category,
            severity,
            location,
            description,
            incident_image: newImage,
        }
    );

    if (success) {
        handleClose();

        showToast(
            "success",
            "Incident Updated",
            "The incident report has been updated successfully."
        );
    }
};


    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-xl rounded p-0 gap-0 overflow-hidden border border-gray-200">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 shrink-0">
                            <AlertTriangle size={18} />
                        </span>
                        <div>
                            <DialogTitle className="text-base font-semibold text-gray-800">
                                Report Incident
                            </DialogTitle>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Fill in the details below to file a new report.
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
                    {/* Title */}
                    <FieldShell label="Incident Title" icon={<FileText size={15} />}>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Unauthorized entry at Gate 2"
                            className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                        />
                    </FieldShell>

                    {/* Category + Severity */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                                Category
                            </label>
                            <div className="flex items-center gap-2.5 rounded-xl border border-gray-300 bg-white px-3 py-2.5 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-colors">
                                <Tag size={15} className="text-gray-400 shrink-0" />
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as Category)}
                                    className="w-full bg-transparent text-sm text-gray-800 outline-none appearance-none"
                                >
                                    <option value="" disabled>
                                        Select category
                                    </option>
                                    {categories.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                                Severity
                            </label>
                            <div className="flex gap-1.5">
                                {severities.map((s) => (
                                    <button
                                        key={s.value}
                                        type="button"
                                        onClick={() => setSeverity(s.value)}
                                        className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-medium transition-all ${severity === s.value
                                            ? "border-orange-400 bg-orange-50 text-orange-700 ring-2 ring-orange-100"
                                            : "border-gray-300 text-gray-500 hover:bg-gray-50"
                                            }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                        {s.value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {category === "Other" && (
                        <FieldShell
                            label="Please Specify"
                            icon={<Tag size={15} />}
                        >
                            <input
                                type="text"
                                value={otherCategory}
                                onChange={(e) => setOtherCategory(e.target.value)}
                                placeholder="Enter incident category..."
                                className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                            />
                        </FieldShell>
                    )}

                    {/* Location */}
                    <FieldShell label="Location" icon={<MapPin size={15} />}>
                        <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Gate 2, Main Campus"
                            className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                        />
                    </FieldShell>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what happened, who was involved, and any other relevant details..."
                            rows={4}
                            className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-800 outline-none resize-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors"
                        />
                    </div>

                    {/* Evidence upload */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                            Evidence{" "}
                            <span className="text-gray-400 font-normal">
                                (optional — up to 6 files)
                            </span>
                        </label>

                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragActive(true);
                            }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`rounded-xl border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${dragActive
                                ? "border-orange-400 bg-orange-50"
                                : "border-gray-300 bg-gray-50/60 hover:bg-orange-50/40 hover:border-orange-300"
                                } ${evidence.length >= 6 ? "opacity-50 pointer-events-none" : ""}`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={(e) => e.target.files && addFiles(e.target.files)}
                            />
                            <Upload size={20} className="mx-auto text-gray-400 mb-1.5" />
                            <p className="text-sm text-gray-600">
                                <span className="text-orange-700 font-medium">Click to upload</span> or
                                drag and drop
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Photos or PDFs, up to 6 files</p>
                        </div>

                        {evidence.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-3">
                                {evidence.map((item) => (
                                    <div
                                        key={item.id}
                                        className="relative group aspect-square rounded-xl border border-gray-200 bg-gray-50 overflow-hidden"
                                    >
                                        {item.preview ? (
                                            <img
                                                src={item.preview}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-1.5">
                                                <FileIcon size={18} className="text-gray-400" />
                                                <span className="text-[10px] text-gray-500 truncate w-full text-center">
                                                    {item.file?.name ?? "Current Evidence"}
                                                </span>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile(item.id);
                                            }}
                                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label="Remove file"
                                        >
                                            <X size={11} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 border-t border-gray-300 bg-gray-50/60 flex sm:justify-end gap-2.5">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        className="rounded-xl border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isValid || isLoading}
                        className="rounded-xl bg-linear-to-r from-orange-700 to-amber-700 text-white shadow-sm shadow-orange-900/30 hover:brightness-105 disabled:opacity-40 gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={15} className="animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <AlertTriangle size={15} />
                                Submit Report
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function FieldShell({
    label,
    icon,
    children,
}: {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">{label}</label>
            <div className="flex items-center gap-2.5 rounded-xl border border-gray-300 bg-white px-3 py-2.5 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-colors">
                <span className="text-gray-400 shrink-0">{icon}</span>
                {children}
            </div>
        </div>
    );
}