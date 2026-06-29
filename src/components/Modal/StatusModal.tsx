import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  TriangleAlert,
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
  const success = type === "success";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: .25 }}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: .9,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: .9,
              y: 20,
            }}
            transition={{
              duration: .25,
              ease: "easeOut",
            }}
            className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X size={18} />
            </button>

            <div className="p-8 text-center">

              <motion.div
                initial={{ scale: .5, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: .15,
                  type: "spring",
                  stiffness: 220,
                }}
                className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${
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
                  <TriangleAlert
                    size={42}
                    className="text-red-600"
                  />
                )}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: .2 }}
                className="text-xl font-bold text-gray-800"
              >
                {title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: .3 }}
                className="mt-2 text-sm text-gray-500"
              >
                {message}
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}