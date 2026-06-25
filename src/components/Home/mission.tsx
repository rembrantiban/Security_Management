import { Target, ShieldCheck, Zap } from "lucide-react";

export default function Mission() {
  const pillars = [
    {
      icon: Target,
      title: "Clear Purpose",
      description: "Deliver efficient and reliable security management solutions.",
      accent: "text-sky-300",
    },
    {
      icon: ShieldCheck,
      title: "Stronger Protection",
      description: "Enhance safety through monitoring and smart access control.",
      accent: "text-emerald-300",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Continuously improve using automation and modern technologies.",
      accent: "text-amber-300",
    },
  ];

  return (
    <section
      id="mission"
      className="relative px-6 md:px-12 py-10 bg-linear-to-b from-orange-900 via-orange-800 to-amber-950 text-white overflow-hidden"
    >
      {/* Simple drifting glow orbs */}
      <div className="absolute -top-20 left-1/4 w-96 h-96 rounded-full bg-amber-400/20 blur-[100px] animate-[drift_14s_ease-in-out_infinite]" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-orange-300/15 blur-[100px] animate-[drift_18s_ease-in-out_infinite_reverse]" />

      {/* Faint dot-grid texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-amber-300/90 mb-3">
            What drives us
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Our Mission
          </h2>
          <p className="text-orange-100/70 max-w-xl mx-auto">
            Building a smarter, safer future through intelligent security systems
            and real-time protection.
          </p>
        </div>

        {/* Centerpiece statement */}
        <div className="flex justify-center mb-16">
          <div className="relative w-full max-w-2xl p-10 md:p-12 rounded-3xl bg-white/[0.07] backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/20 text-center">
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-amber-300/20" />
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
                Smart Security Vision
              </h3>
              <p className="text-orange-50/80 text-base leading-relaxed max-w-lg mx-auto">
                We aim to revolutionize security management by integrating modern
                technology, automation, and real-time monitoring into one powerful
                platform.
              </p>
            </div>
          </div>
        </div>

        {/* Pillars row */}
        <div className="grid sm:grid-cols-3 gap-6">
          {pillars.map(({ icon: Icon, title, description, accent }) => (
            <div
              key={title}
              className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 group-hover:scale-110 transition-transform duration-300">
                  <Icon size={20} className={accent} />
                </div>
                <h3 className="font-semibold text-base">{title}</h3>
              </div>
              <p className="text-orange-100/60 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.1); }
        }
      `}</style>
    </section>
  );
}