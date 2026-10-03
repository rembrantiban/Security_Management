const MODULES = [
  {
    title: "Incident reporting",
    body: "Staff file a report with location, category, severity and a photo. Each one gets a reference number and moves from Pending to Resolved to Closed.",
  },
  {
    title: "Monitoring schedules",
    body: "Assign personnel to an area and time window. Shifts start and complete on schedule, and past shifts stay on record.",
  },
  {
    title: "Patrol operations",
    body: "Guards start and complete patrols from their own dashboard and file a short report on what they found.",
  },
  {
    title: "Visitor access",
    body: "Visitor requests are reviewed at the gate, approved or rejected with a reason, and checked out when the visitor leaves.",
  },
  {
    title: "Visitor blacklist",
    body: "Flag people who should not be admitted. Requests are checked against the list before anyone is let in.",
  },
  {
    title: "Reports & audit trail",
    body: "Generate incident, patrol, visitor and user activity reports, and see who changed what and when.",
  },
] as const;

export default function Features() {
  return (
    <section id="modules" className="scroll-mt-16 bg-stone-50 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-6 md:grid-cols-2 md:gap-16">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-stone-900 md:text-4xl">
            What the security office keeps track of.
          </h2>
          <p className="text-base leading-relaxed text-stone-600 md:pt-2">
            Paper logbooks and group chats are hard to search and easy to lose.
            The system keeps these six areas in one place, tied to the people
            responsible for them.
          </p>
        </div>

        <ol className="mt-16 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module, index) => (
            <li key={module.title} className="border-t border-stone-300 py-7">
              <span className="font-mono text-xs text-stone-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-stone-900">
                {module.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {module.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
