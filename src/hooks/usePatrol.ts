import { usePatrolStore } from "@/store/usePatrolStore"

export const usePatrol = () => { 
     const startPatrol = usePatrolStore((state) => state.startPatrol);
     const isloading = usePatrolStore((state) => state.isloading);
     const getMyPatrols = usePatrolStore((state) => state.getMyPatrols);
     const getMyCompletedPatrols = usePatrolStore((state) => state.getMyCompletedPatrols);
     const completedPatrols = usePatrolStore((state) => state.completedPatrols);
     return { startPatrol, isloading, getMyPatrols, getMyCompletedPatrols, completedPatrols };
}