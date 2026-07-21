import { useEffect, useRef, useState } from "react";
import {
  User,
  BadgeCheck,
  ClipboardList,
  UploadCloud,
  UserPlus,
  X,
} from "lucide-react";
import { useRequest } from "@/hooks/useRequest" 
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";


type RegisterVisitorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const idTypes = [
  "National ID",
  "School ID",
  "Driver's License",
  "Passport",
  "UMID",
  "PhilHealth ID",
  "SSS ID",
  "Postal ID",
  "Company ID",
  "Other",
];

export default function RegisterVisitorModal({
  open,
  onOpenChange,
}: RegisterVisitorModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { createRequest, isLoading, error } = useRequest();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    id_type: "",
    purpose: "",
  });

  const [image, setImage] = useState<File | null>(null);

  const preview = image ? URL.createObjectURL(image) : null;

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setImage(e.target.files[0]);
  };

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name.trim()) {
        showToast(
            "error",
            "Missing Information",
            "First name is required."
        );
        return;
    }

    if (!formData.last_name.trim()) {
        showToast(
            "error",
            "Missing Information",
            "Last name is required."
        );
        return;
    }

    if (!formData.purpose.trim()) {
        showToast(
            "error",
            "Missing Information",
            "Please enter the purpose of the visit."
        );
        return;
    }
    const success = await createRequest({
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        id_type: formData.id_type,
        id_image: image,
        purpose: formData.purpose,
    });

    if (!success) {
        showToast(
            "error",
            "Registration Failed",
            error ?? "Unable to register visitor."
        );
        return;
    }

    showToast(
        "success",
        "Visitor Registered",
        "Visitor access request has been submitted successfully."
    );

    // Reset form
    setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        id_type: "",
        purpose: "",
    });

    setImage(null);

    onOpenChange(false);
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="relative flex w-full max-w-lg max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <UserPlus className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Register Visitor Entry
              </h2>
              <p className="text-xs text-slate-400">
                Create a visitor record for campus access
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0 rounded-full text-slate-500 hover:bg-slate-100"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4.5 w-4.5" />
          </Button>

        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto">

          <div className="space-y-6 px-5 py-5">

            {/* PERSONAL */}
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-orange-700">
                Personal Information
              </h3>

              <div className="grid gap-3 sm:grid-cols-3">
                <Field
                  icon={<User size={16} />}
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                />
                <Field
                  placeholder="Middle Name"
                  value={formData.middle_name}
                  onChange={(e) =>
                    setFormData({ ...formData, middle_name: e.target.value })
                  }
                />
                <Field
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                />
              </div>
            </section>

            {/* IDENTIFICATION */}
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-orange-700">
                Identification
              </h3>

              <div className="space-y-3">

                <div className="relative">
                  <BadgeCheck className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500" />
                  <select
                    value={formData.id_type}
                    onChange={(e) =>
                      setFormData({ ...formData, id_type: e.target.value })
                    }
                    className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  >
                    <option value="">Select Government ID</option>
                    {idTypes.map((id) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload */}
                <input
                  hidden
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                />

                <div
                  onClick={() => inputRef.current?.click()}
                  className="group cursor-pointer rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-5 transition hover:border-orange-500 hover:bg-orange-50"
                >
                  {preview ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={preview}
                        className="mb-3 h-28 rounded-lg object-cover shadow"
                      />
                      <Button type="button" variant="outline" size="sm">
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-2.5 rounded-full bg-orange-100 p-3">
                        <UploadCloud className="h-5 w-5 text-orange-700" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        Upload ID Image
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Drag & drop or click to browse
                      </p>
                      <span className="mt-1 text-[11px] text-slate-400">
                        PNG · JPG · JPEG
                      </span>
                    </div>
                  )}
                </div>

              </div>
            </section>

            {/* PURPOSE */}
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-orange-700">
                Purpose of Visit
              </h3>

              <div className="relative">
                <ClipboardList className="absolute left-3.5 top-3.5 h-4 w-4 text-orange-500" />
                <textarea
                  rows={3}
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  placeholder="Briefly describe the purpose of the visit..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="flex shrink-0 justify-end gap-2.5 border-t border-slate-100 px-5 py-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="gap-1.5 rounded-xl bg-orange-700 hover:bg-orange-800"
            >
              <UserPlus className="h-4 w-4" />
              {isLoading ? "Submitting..." : "Register Visitor"}
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
}

type FieldProps = {
  placeholder: string;
  value: string;
  icon?: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function Field({ placeholder, value, onChange, icon }: FieldProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500">
          {icon}
        </span>
      )}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`h-10 w-full rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 ${
          icon ? "pl-10" : "pl-3.5"
        } pr-3.5`}
      />
    </div>
  );
}