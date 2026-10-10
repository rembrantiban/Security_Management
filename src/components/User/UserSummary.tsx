import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "@/hooks/useAuth";

type Slice = {
  key: string;
  label: string;
  value: number;
  color: string;
  dot: string;
};

/** Roles listed on the Users page, in fixed order so colors never shift. */
const ROLES = [
  { key: "Security Personnel", label: "Security Personnel", color: "#d97706", dot: "bg-amber-600" },
  { key: "Authorized Staff", label: "Authorized Staff", color: "#2563eb", dot: "bg-blue-600" },
] as const;

/** Neutral ring shown when there are no users to chart. */
const EMPTY_RING = [{ key: "empty", value: 1 }];

/** Breakdown of the managed user accounts by role. */
export default function UserSummary() {
  const { users } = useAuth();

  const { slices, total } = useMemo(() => {
    const slices: Slice[] = ROLES.map((role) => ({
      ...role,
      value: users.filter((u) => u.role === role.key).length,
    }));

    return { slices, total: slices.reduce((sum, s) => sum + s.value, 0) };
  }, [users]);

  const percentOf = (value: number) => (total ? Math.round((value / total) * 100) : 0);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 sm:col-span-2">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-700">
          User Summary
        </p>
        <p className="mt-1 truncate text-[11px] text-slate-500">
          Accounts by role
        </p>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {slices.map((slice) => (
            <div key={slice.key} className="min-w-0">
              <p className="flex items-center gap-1.5 truncate text-[11px] text-slate-600">
                <span className={`h-2 w-2 shrink-0 rounded-full ${slice.dot}`} aria-hidden="true" />
                {slice.label}
              </p>
              <p className="mt-1 text-lg font-semibold leading-none tabular-nums tracking-tight text-slate-900">
                {slice.value}
                <span className="ml-1 text-[11px] font-normal text-slate-500">
                  {percentOf(slice.value)}%
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="relative h-20 w-20 shrink-0"
        role="img"
        aria-label={slices.map((s) => `${s.label}: ${s.value}`).join(", ")}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {total === 0 ? (
              <Pie
                data={EMPTY_RING}
                dataKey="value"
                innerRadius="72%"
                outerRadius="100%"
                stroke="none"
                isAnimationActive={false}
              >
                <Cell fill="#f1f5f9" />
              </Pie>
            ) : (
              <Pie
                data={slices}
                dataKey="value"
                nameKey="label"
                innerRadius="72%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={slices.every((s) => s.value > 0) ? 4 : 0}
                cornerRadius={4}
                stroke="none"
                isAnimationActive={false}
              >
                {slices.map((slice) => (
                  <Cell key={slice.key} fill={slice.color} />
                ))}
              </Pie>
            )}
            {total > 0 && (
              <Tooltip
                cursor={false}
                wrapperStyle={{ zIndex: 20, outline: "none" }}
                content={({ active, payload }) => {
                  const item = payload?.[0]?.payload as Slice | undefined;
                  if (!active || !item) return null;
                  return (
                    <div className="whitespace-nowrap rounded-lg bg-white px-2.5 py-1.5 text-[11px] shadow-md ring-1 ring-slate-200">
                      <span className="font-medium text-slate-900">{item.label}</span>
                      <span className="ml-1.5 tabular-nums text-slate-500">
                        {item.value} · {percentOf(item.value)}%
                      </span>
                    </div>
                  );
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[15px] font-semibold leading-none tabular-nums text-slate-900">
            {total}
          </p>
          <p className="mt-0.5 text-[8.5px] uppercase tracking-[0.12em] text-slate-500">
            Users
          </p>
        </div>
      </div>
    </div>
  );
}
