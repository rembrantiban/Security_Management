import {
    Shield,
    ShieldCheck,
    UserCheck,
    Settings2,
} from "lucide-react";

const roleConfig = {
    Administrator: {
        icon: ShieldCheck,
    },
    "Security Personnel": {
        icon: Shield,
    },
    "Authorized Staff": {
        icon: UserCheck,
    },
    "IT System Administrator": {
        icon: Settings2,
    },
} as const;

export type UserRole =
    | "Administrator"
    | "Security Personnel"
    | "Authorized Staff"

type RoleSelectorProps = {
    roles: UserRole[];
    selectedRole: UserRole;
    onSelectRole: React.Dispatch<React.SetStateAction<UserRole>>;
};

export default function RoleSelector({
    roles,
    selectedRole,
    onSelectRole,
}: RoleSelectorProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {roles.map((role) => {
                const config =
                    roleConfig[
                        role as keyof typeof roleConfig
                    ];

                const Icon = config.icon;

                const selected =
                    selectedRole === role;

                return (
                    <button
                        key={role}
                        type="button"
                        onClick={() =>
                            onSelectRole(role)
                        }
                        className={`
                            flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            px-3.5
                            py-1.5
                            text-sm
                            font-medium
                            transition-colors
                            ${
                                selected
                                    ? "border-orange-600 bg-orange-700 text-white"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-700"
                            }
                        `}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        {role}
                    </button>
                );
            })}
        </div>
    );
}