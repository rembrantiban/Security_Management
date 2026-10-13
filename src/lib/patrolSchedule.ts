/** Date/time helpers for monitoring schedules and patrol logs. */

export function formatScheduleCode(scheduleId: number) {
    return `PTL-${String(scheduleId).padStart(4, "0")}`;
}

export function formatScheduleDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/** Formats a "HH:mm[:ss]" time-of-day string as "h:mm AM/PM". */
export function formatTimeOfDay(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

export function formatDateTime(value: string | null | undefined) {
    if (!value) return "—";

    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

function formatMinutes(totalMinutes: number) {
    if (Number.isNaN(totalMinutes) || totalMinutes < 0) return "—";

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
}

function toMinutes(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

/** Scheduled window length; handles shifts that cross midnight. */
export function scheduledDuration(start: string, end: string) {
    const diff = toMinutes(end) - toMinutes(start);
    return formatMinutes(diff >= 0 ? diff : diff + 24 * 60);
}

/** Scheduled end of a patrol; shifts that cross midnight end the next day. */
export function getScheduleEnd(
    scheduleDate: string,
    startTime: string,
    endTime: string
) {
    const end = new Date(scheduleDate);
    const [hours, minutes] = endTime.split(":").map(Number);
    end.setHours(hours, minutes, 0, 0);

    if (toMinutes(endTime) <= toMinutes(startTime)) {
        end.setDate(end.getDate() + 1);
    }

    return end;
}

export function actualDuration(start: string | null, end: string | null) {
    if (!start || !end) return "—";
    const ms = new Date(end).getTime() - new Date(start).getTime();
    return formatMinutes(Math.round(ms / 60000));
}
