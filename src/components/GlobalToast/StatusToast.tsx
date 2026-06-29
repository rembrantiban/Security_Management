import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  TriangleAlert,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

import { useToast } from "@/hooks/useToast";

export default function StatusToast() {
  const {
    open,
    type,
    title,
    message,
    duration,
    closeToast,
  } = useToast();

  const config = {
    success: {
      icon: CheckCircle2,
      border: "border-emerald-200",
      bg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      progress: "bg-emerald-500",
    },
    error: {
      icon: TriangleAlert,
      border: "border-red-200",
      bg: "bg-red-100",
      iconColor: "text-red-600",
      progress: "bg-red-500",
    },
    warning: {
      icon: AlertTriangle,
      border: "border-amber-200",
      bg: "bg-amber-100",
      iconColor: "text-amber-600",
      progress: "bg-amber-500",
    },
    info: {
      icon: Info,
      border: "border-blue-200",
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
      progress: "bg-blue-500",
    },
  };

  const current = config[type];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 28,
          }}
          className="fixed inset-x-0 bottom-6 z-9999 flex justify-center px-4"
        >
          <div
            className={`relative w-full max-w-md overflow-hidden rounded-2xl border bg-white shadow-2xl ${current.border}`}
          >
            <div className="flex items-start gap-4 p-5">
              <motion.div
                initial={{ rotate: -25, scale: 0.6 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{
                  delay: 0.15,
                  type: "spring",
                  stiffness: 400,
                }}
                className={`rounded-full p-2 ${current.bg}`}
              >
                <Icon className={`h-6 w-6 ${current.iconColor}`} />
              </motion.div>

              <div className="flex-1">
                <motion.h3
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-semibold text-gray-900"
                >
                  {title}
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-1 text-sm text-gray-500"
                >
                  {message}
                </motion.p>
              </div>

              <button
                onClick={closeToast}
                className="text-gray-400 transition hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <motion.div
              className={`absolute bottom-0 left-0 h-1 ${current.progress}`}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{
                duration: duration / 1000,
                ease: "linear",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}