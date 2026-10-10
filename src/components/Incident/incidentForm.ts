/** Form model shared by the Report / Update incident modals. */

export type Severity = "Low" | "Medium" | "High" | "Critical";

export const INCIDENT_CATEGORIES = [
    "Unauthorized Access",
    "Theft",
    "Vandalism",
    "Suspicious Activity",
    "Safety Hazard",
    "Other",
] as const;

export type Category = (typeof INCIDENT_CATEGORIES)[number];

export type IncidentFormValues = {
    title: string;
    category: Category | "";
    /** Free-text category, used when `category` is "Other". */
    otherCategory: string;
    severity: Severity;
    location: string;
    description: string;
};

export const EMPTY_INCIDENT_FORM: IncidentFormValues = {
    title: "",
    category: "",
    otherCategory: "",
    severity: "Medium",
    location: "",
    description: "",
};

export function isIncidentFormValid(values: IncidentFormValues) {
    return (
        values.title.trim() !== "" &&
        values.category !== "" &&
        values.location.trim() !== "" &&
        values.description.trim() !== "" &&
        (values.category !== "Other" || values.otherCategory.trim() !== "")
    );
}

/** Resolves the category actually stored on the incident. */
export function resolveCategory(values: IncidentFormValues) {
    return values.category === "Other" ? values.otherCategory.trim() : values.category;
}

/** Maps a stored category back to the form; unknown values become "Other". */
export function categoryToForm(
    stored: string
): Pick<IncidentFormValues, "category" | "otherCategory"> {
    return (INCIDENT_CATEGORIES as readonly string[]).includes(stored)
        ? { category: stored as Category, otherCategory: "" }
        : { category: "Other", otherCategory: stored };
}
