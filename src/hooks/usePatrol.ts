import { usePatrolStore } from "@/store/usePatrolStore"

export const usePatrol = () => { 
     const startPatrol = usePatrolStore((state) => state.startPatrol);
     const completePatrol = usePatrolStore((state) => state.completePatrol);
     const isloading = usePatrolStore((state) => state.isloading);
     const getMyPatrols = usePatrolStore((state) => state.getMyPatrols);
     const getMyCompletedPatrols = usePatrolStore((state) => state.getMyCompletedPatrols);
     const completedPatrols = usePatrolStore((state) => state.completedPatrols);
     const allPatrolLogs = usePatrolStore((state) => state.allPatrolLogs);
     const isFetchingLogs = usePatrolStore((state) => state.isFetchingLogs);
     const getAllPatrolLogs = usePatrolStore((state) => state.getAllPatrolLogs);
     return { startPatrol, completePatrol, isloading, getMyPatrols, getMyCompletedPatrols, completedPatrols, allPatrolLogs, isFetchingLogs, getAllPatrolLogs };
}