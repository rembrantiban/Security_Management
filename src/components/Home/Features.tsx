import { ShieldCheck, AlertTriangle, Fingerprint } from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Real-Time Monitoring",
      desc: "Track activities and security logs instantly with live updates.",
      icon: <ShieldCheck size={28} />,
    },
    {
      title: "Incident Reporting",
      desc: "Quickly log, manage, and review security incidents efficiently.",
      icon: <AlertTriangle size={28} />,
    },
    {
      title: "Access Control",
      desc: "Secure entry using smart authentication and verification.",
      icon: <Fingerprint size={28} />,
    },
  ];

  return (
    <section id="features" className="relative px-6 md:px-12 py-20 bg-linear-to-b from-gray-50 to-white">
      
      {/* Header */}
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Powerful Security Features
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Designed to give you full control, visibility, and protection in one system.
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div
            key={i}
            className="group relative p-6 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
          >
            
            {/* Icon */}
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-4 group-hover:scale-110 transition">
              {f.icon}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold mb-2">
              {f.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed">
              {f.desc}
            </p>

            {/* Gradient Hover Glow */}
            <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
          </div>
        ))}
      </div>
    </section>
  );
}