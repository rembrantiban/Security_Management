import { useAuthStore  } from "@/store/useAuthStore";


export const useAuth = () => {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);
    const isFetchingUsers = useAuthStore((state) => state.isFetchingUsers);
    const register = useAuthStore((state) => state.register);
    const error = useAuthStore((state) => state.error);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);
    const getCurrentUser = useAuthStore((state) => state.getCurrentUser);
    const stats = useAuthStore((state) => state.stats);
    const getUserStatistics = useAuthStore((state) => state.getUserStatistics);
    const getAllUsers = useAuthStore((state) => state.getAllUsers);
    const users = useAuthStore((state) => state.users);
    const getMeLoading = useAuthStore((state) => state.getMeLoading);
    const createUserByAdmin = useAuthStore((state) => state.createUserByAdmin);
    const updateUser = useAuthStore((state) => state.updateUser);
    const deleteUser = useAuthStore((state) => state.deleteUser);
    const updateUserStatus = useAuthStore((state) => state.updateUserStatus);
    const getSecurityPersonnel = useAuthStore((state) => state.getSecurityPersonnel);
    const securityPersonnel = useAuthStore((state) => state.securityPersonnel);
    const setDutySchedule = useAuthStore((state) => state.setDutySchedule);
    const selectedUserById = useAuthStore((state) => state.selectedUserById);
    const getUserById = useAuthStore((state) => state.getUserById);

    return { 
        user,
        isAuthenticated,
        isLoading,
        getMeLoading,
        register,
        error,
        login,
        logout,
        getCurrentUser,
        stats,
        getUserStatistics,
        getAllUsers,
        users,
        createUserByAdmin,
        isFetchingUsers,
        updateUser,
        deleteUser,
        updateUserStatus,
        getSecurityPersonnel,
        securityPersonnel,
        setDutySchedule,
        selectedUserById,
        getUserById
     };
}