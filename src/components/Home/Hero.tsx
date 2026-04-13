export default function Hero() {
  return (
    <section id="#home" className="relative flex items-center justify-center text-center py-42 px-6 text-white">
      
      <div className="absolute inset-0">
        <img
          src="/campus.jpg" // put your image in public folder
          alt="Security Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-orange-100  ">
          Smart Security Management System
        </h1>

        <p className="text-gray-200 mb-8">
          Monitor, manage, and secure your environment with real-time tracking,
          incident reporting, and intelligent access control.
        </p>

        <div className="flex justify-center gap-4">
          <button className="bg-blue-500 px-6 py-3 rounded-lg hover:bg-blue-600">
            Get Started
          </button>

          <button className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-black">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}