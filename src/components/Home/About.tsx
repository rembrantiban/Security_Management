const ROLES = [
  {
    name: "Administrator",
    scope: "Approves accounts, assigns incidents and shifts, reviews visitor requests, and generates reports.",
  },
  {
    name: "Security Personnel",
    scope: "Sees assigned incidents and patrols, starts and completes shifts, and processes visitors at the gate.",
  },
  {
    name: "Authorized Staff",
    scope: "Reports incidents and follows the status of the reports they have filed.",
  },
  {
    name: "IT System Administrator",
    scope: "Manages roles, the permission matrix, and login and password policies.",
  },
] as const;

export default function About() {
  return (
    <section id="roles" className="scroll-mt-16 bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-[1fr_1.4fr] md:gap-20 md:px-8">
        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-stone-900 md:text-4xl">
            Each person sees what their job needs.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-stone-600">
            Access is set by role. New accounts stay inactive until an
            administrator approves them.
          </p>
          <img
            src="/sfc-image.jpg"
            alt="Saint Francis College campus"
            className="mt-10 hidden aspect-4/3 w-full rounded-md object-cover md:block"
          />
        </div>

        <dl className="divide-y divide-stone-200 border-y border-stone-200">
          {ROLES.map((role) => (
            <div
              key={role.name}
              className="grid gap-2 py-6 sm:grid-cols-[12rem_1fr] sm:gap-8"
            >
              <dt className="text-sm font-semibold text-stone-900">
                {role.name}
              </dt>
              <dd className="text-sm leading-relaxed text-stone-600">
                {role.scope}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
