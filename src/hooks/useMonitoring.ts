import { useMonitoringStore } from "@/store/useMonitoringStore";

export const useMonitoring = () => {
     const { mySchedules,
             getMyMonitoringSchedules,
             schedules,
             selectedSchedule,
             loading,
             createMonitoringSchedule,
             getMonitoringSchedules,
             getMonitoringScheduleById,
             updateMonitoringSchedule,
             deleteMonitoringSchedule,
             updateMonitoringScheduleStatus,
        } = useMonitoringStore();

     return { mySchedules,
             getMyMonitoringSchedules,
             schedules, 
             selectedSchedule,
             loading,
             createMonitoringSchedule,

              getMonitoringSchedules,
             getMonitoringScheduleById,
             updateMonitoringSchedule,
             deleteMonitoringSchedule,
             updateMonitoringScheduleStatus,
             };
}