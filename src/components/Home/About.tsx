import { Shield, Eye, Database } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="px-6 md:px-12 py-20 bg-gray-50">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        
        {/* LEFT: IMAGE */}
        <div className="relative">
          <img
            src="/sfc-image.jpg" // put image in public folder
            alt="Security System"
            className="rounded-2xl shadow-lg object-cover w-full h-100"
          />

          {/* Overlay Card */}
          <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow">
            <p className="text-sm font-medium text-gray-700">
              Real-time protection system
            </p>
          </div>
        </div>

        {/* RIGHT: CONTENT */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            About the System
          </h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            This Security Management System enhances safety by providing a
            centralized platform for monitoring, incident reporting, and
            real-time access control. It simplifies operations while improving
            response time and system reliability.
          </p>

          {/* FEATURES LIST */}
          <div className="space-y-4">
            
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <Shield size={20} />
              </div>
              <p className="text-gray-700">
                Strengthens overall security and protection
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                <Eye size={20} />
              </div>
              <p className="text-gray-700">
                Real-time monitoring and visibility
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                <Database size={20} />
              </div>
              <p className="text-gray-700">
                Centralized data and incident management
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}