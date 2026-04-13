
export default function Footer() {
  return (
    <footer className="bg-linear-to-b from-gray-900 to-black text-gray-300 pt-16 pb-8 px-6 md:px-12">
      
      {/* TOP SECTION */}
      <div className="grid md:grid-cols-3 gap-10 mb-10">
        
        {/* BRAND */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/40 p-2 rounded text-black shadow-md">
             <img src="./logo.png" alt="logo" className="h-20" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              SECURITY MANAGEMENT SYSTEM
            </h1>
          </div>

          <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
            A smart security management system that provides real-time monitoring,
            incident tracking, and advanced protection for safer environments.
          </p>
        </div>

        {/* NAVIGATION */}
        <div>
          <h3 className="text-white font-semibold mb-4">Navigation</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white transition cursor-pointer">Home</li>
            <li className="hover:text-white transition cursor-pointer">Features</li>
            <li className="hover:text-white transition cursor-pointer">About</li>
            <li className="hover:text-white transition cursor-pointer">Login</li>
          </ul>
        </div>

        {/* SYSTEM */}
        <div>
          <h3 className="text-white font-semibold mb-4">System</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white transition cursor-pointer">Monitoring</li>
            <li className="hover:text-white transition cursor-pointer">Incident Reports</li>
            <li className="hover:text-white transition cursor-pointer">Access Control</li>
          </ul>
        </div>

      </div>

      {/* DIVIDER */}
      <div className="border-t border-white/10 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Security Management System. All rights reserved.
      </div>
    </footer>
  );
}