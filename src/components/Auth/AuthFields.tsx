import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

export const INPUT_CLASS =
  "w-full rounded-md border bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:outline-none focus:ring-1";

const inputStateClass = (invalid: boolean) =>
  invalid
    ? "border-red-500 focus:border-red-600 focus:ring-red-600"
    : "border-stone-300 focus:border-stone-900 focus:ring-stone-900";

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  hint?: ReactNode;
}

function FieldShell({
  id,
  label,
  optional,
  error,
  hint,
  children,
}: Pick<FieldProps, "id" | "label" | "optional" | "error" | "hint"> & {
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-stone-700">
        {label}
        {optional && <span className="font-normal text-stone-400"> (optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-stone-500">{hint}</p>
      )}
    </div>
  );
}

export function TextField({ id, label, optional, error, hint, className, ...input }: FieldProps) {
  return (
    <FieldShell id={id} label={label} optional={optional} error={error} hint={hint}>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${INPUT_CLASS} ${inputStateClass(!!error)} ${className ?? ""}`}
        {...input}
      />
    </FieldShell>
  );
}

export function PasswordField({ id, label, error, hint, ...input }: Omit<FieldProps, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${INPUT_CLASS} ${inputStateClass(!!error)} pr-11`}
          {...input}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-stone-400 transition-colors hover:text-stone-700"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </FieldShell>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <p role="alert" className="border-l-2 border-red-600 bg-red-50 px-3 py-2.5 text-sm text-red-700">
      {message}
    </p>
  );
}

export function SubmitButton({
  disabled,
  children,
}: {
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full rounded-md bg-stone-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
    >
      {children}
    </button>
  );
}
