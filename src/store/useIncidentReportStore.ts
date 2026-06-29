import { create } from "zustand";
import AxiosInstance from "@/api/AxiosInstance";
import { AxiosError } from "axios";


export interface Incident {
    incident_id: number;
    incident_number: string;
    title: string;
    category: string;
    severity:
    | "Low"
    | "Medium"
    | "High"
    | "Critical";
    location: string;
    description: string;
    incident_image: string | null;

    status: "Pending" | "In Progress" | "Resolved" | "Closed";

    reported_by: string;
    reported_by_name: string;

    assigned_to: string | null;
    assigned_to_name: string | null;

    created_at: string;
    updated_at: string;
}

type CreateIncidentData = {
    title: string;
    category: string;
    severity: string;
    location: string;
    description: string;
    incident_image?: File | null;
};

interface IncidentStore {
    isLoading: boolean;
    error: string | null;
    incidents: Incident[];
    myIncidents: Incident[];

    getMyIncidentReports: () => Promise<void>;
    getAllIncidents: () => Promise<void>;
    createIncident: (data: CreateIncidentData) => Promise<boolean>;
    assignIncident: (incidentId: number, assignedTo: number, note: string) => Promise<boolean>;
    reAssignIncident: (incidentId: number, assignedTo: number, note: string) => Promise<boolean>;
    closeIncident: (incidentId: number) => Promise<boolean>;
}

export const useIncidentStore = create<IncidentStore>((set, get) => ({
    isLoading: false,
    error: null,
    incidents: [],
    myIncidents: [],


    closeIncident: async (incident_id) => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            await AxiosInstance.put(
                `/incidents/close/${incident_id}`
            );

            await get().getAllIncidents();

            set({
                isLoading: false,
            });

            return true;
        } catch (error) {
            const err = error as AxiosError<{
                message: string;
            }>;

            set({
                isLoading: false,
                error:
                    err.response?.data.message ??
                    "Failed to close incident.",
            });

            return false;
        }
    },

    assignIncident: async (incident_id, assigned_to, note) => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            await AxiosInstance.put(
                `/incidents/assign/${incident_id}`,
                {
                    assigned_to,
                    note,
                }
            );

            await get().getAllIncidents();

            set({
                isLoading: false,
            });

            return true;
        } catch (error) {
            const err = error as AxiosError<{
                message: string;
            }>;

            set({
                isLoading: false,
                error:
                    err.response?.data.message ??
                    "Failed to assign incident.",
            });

            return false;
        }
    },

    reAssignIncident: async (
        incident_id,
        assigned_to,
        note
    ) => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            await AxiosInstance.put(
                `/incidents/reassign/${incident_id}`,
                {
                    assigned_to,
                    note,
                }
            );

            await get().getAllIncidents();

            set({
                isLoading: false,
            });

            return true;
        } catch (error) {
            const err = error as AxiosError<{
                message: string;
            }>;

            set({
                isLoading: false,
                error:
                    err.response?.data.message ??
                    "Failed to reassign incident.",
            });

            return false;
        }
    },
    getMyIncidentReports: async () => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            const res = await AxiosInstance.get(
                "/incidents/get-my-incidents"
            );

            set({
                myIncidents: res.data.incidents,
                isLoading: false,
            });
        } catch (error) {
            const err = error as AxiosError<{
                message: string;
            }>;

            set({
                isLoading: false,
                error:
                    err.response?.data.message ??
                    "Failed to fetch your incident reports.",
            });
        }
    },
    getAllIncidents: async () => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            const res = await AxiosInstance.get("/incidents/get-all");

            set({
                incidents: res.data.incidents,
                isLoading: false,
            });
        } catch (error) {
            const err = error as AxiosError<{
                message: string;
            }>;

            set({
                isLoading: false,
                error:
                    err.response?.data.message ??
                    "Failed to fetch incidents.",
            });
        }
    },

    createIncident: async (data) => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            const formData = new FormData();

            formData.append("title", data.title);
            formData.append("category", data.category);
            formData.append("severity", data.severity);
            formData.append("location", data.location);
            formData.append("description", data.description);

            if (data.incident_image) {
                formData.append(
                    "incident_image",
                    data.incident_image
                );
            }

            await AxiosInstance.post(
                "/incidents/create-incident",
                formData,
            );

            set({
                isLoading: false,
            });

            return true;
        } catch (error) {
            const err =
                error as AxiosError<{
                    message: string;
                }>;

            set({
                isLoading: false,
                error:
                    err.response?.data.message ??
                    "Failed to create incident.",
            });

            return false;
        }
    },
}));