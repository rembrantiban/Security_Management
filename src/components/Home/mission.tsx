import { Target, ShieldCheck, Zap } from "lucide-react";

export default function Mission() {
  return (
    <section id="mission" className="relative px-6 md:px-12 py-24 bg-linear-to-b from-gray-900 to-black text-white overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-125 h-125 bg-blue-500/20 blur-[120px]"></div>

      {/* Header */}
      <div className="text-center mb-20 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Our Mission
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Building a smarter, safer future through intelligent security systems
          and real-time protection.
        </p>
      </div>

      {/* Timeline Layout */}
      <div className="relative z-10 grid md:grid-cols-3 gap-10 items-center">
        
        {/* LEFT */}
        <div className="space-y-10">
          <div className="flex items-start gap-4 group">
            <div className="p-3 rounded-xl bg-white/10 border border-white/20 group-hover:scale-110 transition">
              <Target size={24} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Clear Purpose</h3>
              <p className="text-gray-400 text-sm">
                Deliver efficient and reliable security management solutions.
              </p>
            </div>
          </div>
        </div>

        {/* CENTER (MAIN FOCUS) */}
        <div className="flex justify-center">
          <div className="relative p-10 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-center max-w-sm">
            
            {/* Glow Ring */}
            <div className="absolute inset-0 rounded-3xl border border-blue-500/30 animate-pulse"></div>

            <h3 className="text-2xl font-bold mb-4">
              Smart Security Vision
            </h3>

            <p className="text-gray-300 text-sm leading-relaxed">
              We aim to revolutionize security management by integrating modern
              technology, automation, and real-time monitoring into one powerful
              platform.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-10">
          
          <div className="flex items-start gap-4 group">
            <div className="p-3 rounded-xl bg-white/10 border border-white/20 group-hover:scale-110 transition">
              <ShieldCheck size={24} className="text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Stronger Protection</h3>
              <p className="text-gray-400 text-sm">
                Enhance safety through monitoring and smart access control.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 group">
            <div className="p-3 rounded-xl bg-white/10 border border-white/20 group-hover:scale-110 transition">
              <Zap size={24} className="text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Innovation</h3>
              <p className="text-gray-400 text-sm">
                Continuously improve using automation and modern technologies.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}