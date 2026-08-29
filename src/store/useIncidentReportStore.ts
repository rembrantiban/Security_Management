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

export interface IncidentStats {
    total_incidents: number;
    pending_incidents: number;
    resolved_incidents: number;
    assigned_personnel: number;
}

export interface PersonnelDashboardStats {
    assigned_incidents: number;
    active_response: number;
    resolved_today: number;
}

type UpdateIncidentData = {
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
    mySubmittedIncidents: Incident[];
    isFetchingSubmitted: boolean;
    getMyAssignedIncidents: Incident[];
    archivedIncidents: Incident[];
    isFetchingArchived: boolean;
    stats: IncidentStats | null;
    personnelStats: PersonnelDashboardStats | null;

    getIncidentStatistics: () => Promise<void>;
    getMyIncidentReports: () => Promise<void>;
    getMySubmittedIncidents: () => Promise<void>;
    getAllIncidents: () => Promise<void>;
    createIncident: (data: CreateIncidentData) => Promise<boolean>;
    assignIncident: (incidentId: number, assignedTo: number, note: string) => Promise<boolean>;
    reAssignIncident: (incidentId: number, assignedTo: number, note: string) => Promise<boolean>;
    closeIncident: (incidentId: number) => Promise<boolean>;
    resolvedIncident: (incident_id: number) => Promise<boolean>;
    fetchMyAssignedIncidents: () => Promise<void>;
    fetchPersonnelDashboardStats: () => Promise<void>;
    updateIncident: (incident_id: number, data: UpdateIncidentData) => Promise<boolean>;
    getArchivedIncidents: () => Promise<void>;
    archiveIncident: (incident_id: number) => Promise<boolean>;
    restoreIncident: (incident_id: number) => Promise<boolean>;

}

export const useIncidentStore = create<IncidentStore>((set, get) => ({
    isLoading: false,
    error: null,
    incidents: [],
    myIncidents: [],
    mySubmittedIncidents: [],
    isFetchingSubmitted: false,
    getMyAssignedIncidents: [],
    archivedIncidents: [],
    isFetchingArchived: false,
    stats: null,
    personnelStats: null,

    fetchPersonnelDashboardStats: async () => {
        try {
            const res = await AxiosInstance.get(
                "/incidents/personnel-dashboard-stats"
            );

            set({
                personnelStats: res.data.stats,
            });
        } catch (error) {
            console.error(error);
        }
    },

    fetchMyAssignedIncidents: async () => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            const res = await AxiosInstance.get(
                "/incidents/my-assigned-incidents"
            );

            set({
                getMyAssignedIncidents: res.data.incidents,
                isLoading: false,
            });
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;

            set({
                isLoading: false,
                error:
                    err.response?.data.message ??
                    "Failed to fetch assigned incidents.",
            });
        }
    },
    getIncidentStatistics: async () => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            const res = await AxiosInstance.get(
                "/incidents/statistics"
            );

            set({
                stats: res.data.stats,
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
                    "Failed to fetch incident statistics.",
            });
        }
    },

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

    resolvedIncident: async (incident_id) => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            await AxiosInstance.put(
                `/incidents/resolve/${incident_id}`
            );

            const markResolved = (incident: Incident): Incident =>
                incident.incident_id === incident_id
                    ? { ...incident, status: "Resolved" }
                    : incident;

            set((state) => ({
                getMyAssignedIncidents: state.getMyAssignedIncidents.filter(
                    (incident) => incident.incident_id !== incident_id
                ),
                myIncidents: state.myIncidents.map(markResolved),
                incidents: state.incidents.map(markResolved),
                isLoading: false,
            }));

            return true;
        } catch (error) {
            const err = error as AxiosError<{
                message: string;
            }>;

            set({
                isLoading: false,
                error:
                    err.response?.data.message ??
                    "Failed to resolve incident.",
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
    getMySubmittedIncidents: async () => {
        try {
            set({
                isFetchingSubmitted: true,
                error: null,
            });

            const res = await AxiosInstance.get(
                "/incidents/my-submitted-incidents"
            );

            set({
                mySubmittedIncidents: res.data.incidents,
                isFetchingSubmitted: false,
            });
        } catch (error) {
            const err = error as AxiosError<{
                message: string;
            }>;

            set({
                isFetchingSubmitted: false,
                error:
                    err.response?.data.message ??
                    "Failed to fetch your submitted incident reports.",
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

            const res = await AxiosInstance.post(
                "/incidents/create-incident",
                formData,
            );

            set((state) => ({
                myIncidents: [
                    res.data.incident,
                    ...state.myIncidents,
                ],
                mySubmittedIncidents: [
                    res.data.incident,
                    ...state.mySubmittedIncidents,
                ],
                isLoading: false,
            }));

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

    updateIncident: async (incident_id, data) => {
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

        const res = await AxiosInstance.put(
            `/incidents/update/${incident_id}`,
            formData
        );

        set((state) => ({
            myIncidents: state.myIncidents.map((incident) =>
                incident.incident_id === incident_id
                    ? {
                          ...incident,
                          ...res.data.incident,
                      }
                    : incident
            ),

            incidents: state.incidents.map((incident) =>
                incident.incident_id === incident_id
                    ? {
                          ...incident,
                          ...res.data.incident,
                      }
                    : incident
            ),

            isLoading: false,
        }));

        return true;
    } catch (error) {
        const err = error as AxiosError<{
            message: string;
        }>;

        set({
            isLoading: false,
            error:
                err.response?.data.message ??
                "Failed to update incident.",
        });

        return false;
    }
},

    getArchivedIncidents: async () => {
        try {
            set({
                isFetchingArchived: true,
                error: null,
            });

            const res = await AxiosInstance.get("/incidents/archived");

            set({
                archivedIncidents: res.data.incidents,
                isFetchingArchived: false,
            });
        } catch (error) {
            const err = error as AxiosError<{
                message: string;
            }>;

            set({
                isFetchingArchived: false,
                error:
                    err.response?.data.message ??
                    "Failed to fetch archived incidents.",
            });
        }
    },

    archiveIncident: async (incident_id) => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            await AxiosInstance.put(
                `/incidents/archive/${incident_id}`
            );

            set((state) => ({
                incidents: state.incidents.filter(
                    (incident) => incident.incident_id !== incident_id
                ),
                isLoading: false,
            }));

            await get().getIncidentStatistics();

            return true;
        } catch (error) {
            const err = error as AxiosError<{
                message: string;
            }>;

            set({
                isLoading: false,
                error:
                    err.response?.data.message ??
                    "Failed to archive incident.",
            });

            return false;
        }
    },

    restoreIncident: async (incident_id) => {
        try {
            set({
                isLoading: true,
                error: null,
            });

            await AxiosInstance.put(
                `/incidents/restore/${incident_id}`
            );

            set((state) => ({
                archivedIncidents: state.archivedIncidents.filter(
                    (incident) => incident.incident_id !== incident_id
                ),
                isLoading: false,
            }));

            await get().getAllIncidents();
            await get().getIncidentStatistics();

            return true;
        } catch (error) {
            const err = error as AxiosError<{
                message: string;
            }>;

            set({
                isLoading: false,
                error:
                    err.response?.data.message ??
                    "Failed to restore incident.",
            });

            return false;
        }
    },

}));