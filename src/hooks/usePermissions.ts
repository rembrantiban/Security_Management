import { useRolePermissionStore } from "@/store/useRolePermissionStore";

export const usePermission = () => {
      const getRolePermissions = useRolePermissionStore.getState().getRolePermissions;
      
      return{
        getRolePermissions
      }
}