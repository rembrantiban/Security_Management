import {
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";

type StatusModalProps = {
  isOpen: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
};

export default function StatusModal({
  isOpen,
  type,
  title,
  message,
  onClose,
}: StatusModalProps) {
  if (!isOpen) return null;

  const success = type === "success";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
    

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <X size={18} />
        </button>

        <div className="p-8 text-center">
          <div
            className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full
            ${
              success
                ? "bg-green-100"
                : "bg-red-100"
            }`}
          >
            {success ? (
              <CheckCircle2
                size={42}
                className="text-green-600"
              />
            ) : (
              <XCircle
                size={42}
                className="text-red-600"
              />
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            {title}
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}