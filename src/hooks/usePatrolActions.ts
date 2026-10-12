import { useState } from "react";

import type { MonitoringSchedule } from "@/store/useMonitoringStore";
import { useMonitoring } from "@/hooks/useMonitoring";
import { usePatrol } from "@/hooks/usePatrol";
import { useToast } from "@/hooks/useToast";

/**
 * Shared state and handlers for recording (starting) and completing a patrol
 * from any personnel view. Pair with StartPatrolModal and CompletePatrolModal.
 */
export const usePatrolActions = () => {
    const [startOpen, setStartOpen] = useState(false);
    const [completeOpen, setCompleteOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<MonitoringSchedule | null>(null);

    const { getMyMonitoringSchedules } = useMonitoring();
    const { startPatrol, completePatrol, getMyPatrols, getMyCompletedPatrols, isloading } = usePatrol();
    const { showToast } = useToast();

    const refresh = () =>
        Promise.all([
            getMyMonitoringSchedules(),
            getMyPatrols(),
            getMyCompletedPatrols(),
        ]);

    const openStart = (schedule: MonitoringSchedule) => {
        setSelectedSchedule(schedule);
        setStartOpen(true);
    };

    const openComplete = (schedule: MonitoringSchedule) => {
        setSelectedSchedule(schedule);
        setCompleteOpen(true);
    };

    const closeStart = () => setStartOpen(false);
    const closeComplete = () => setCompleteOpen(false);

    const handleStartPatrol = async () => {
        if (!selectedSchedule) return;

        const result = await startPatrol(selectedSchedule.schedule_id);

        if (result.success) {
            showToast("success", "Patrol Recorded", result.message);
            await refresh();
            setStartOpen(false);
            setSelectedSchedule(null);
        } else {
            showToast("error", "Unable to Record Patrol", result.message);
        }
    };

    const handleCompletePatrol = async (observations: string) => {
        if (!selectedSchedule) return;

        const result = await completePatrol(selectedSchedule.schedule_id, observations);

        if (result.success) {
            showToast("success", "Patrol Completed", result.message);
            await refresh();
            setCompleteOpen(false);
            setSelectedSchedule(null);
        } else {
            showToast("error", "Unable to Complete Patrol", result.message);
        }
    };

    return {
        startOpen,
        completeOpen,
        selectedSchedule,
        isloading,
        openStart,
        openComplete,
        closeStart,
        closeComplete,
        handleStartPatrol,
        handleCompletePatrol,
    };
};
