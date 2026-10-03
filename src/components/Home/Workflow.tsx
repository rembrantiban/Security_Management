const STEPS = [
  {
    status: "Pending",
    actor: "Authorized Staff",
    body: "A report is filed with what happened, where, and how serious it is.",
  },
  {
    status: "In Progress",
    actor: "Administrator",
    body: "The report is reviewed and assigned to a member of security personnel.",
  },
  {
    status: "Resolved",
    actor: "Security Personnel",
    body: "The assigned guard responds on site and records how it was handled.",
  },
  {
    status: "Closed",
    actor: "Administrator",
    body: "The outcome is confirmed and the case is closed, then archived for the record.",
  },
] as const;

export default function Workflow() {
  return (
    <section
      id="workflow"
      className="scroll-mt-16 bg-stone-950 py-24 text-white md:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-orange-300">
          Workflow
        </p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          How an incident moves from report to record.
        </h2>

        <ol className="mt-16 grid gap-10 md:grid-cols-4 md:gap-0">
          {STEPS.map((step, index) => (
            <li
              key={step.status}
              className="relative border-l border-white/15 pl-6 md:border-l-0 md:border-t md:pl-0 md:pr-8 md:pt-8"
            >
              <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-orange-400 md:-top-[5px] md:left-0" />
              <p className="font-mono text-xs text-white/40">
                Step {index + 1}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{step.status}</h3>
              <p className="mt-1 text-sm text-orange-200/80">{step.actor}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
