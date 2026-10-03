interface DashboardPlaceholderProps {
  title: string;
  description: string;
}

export function DashboardPlaceholder({ title, description }: DashboardPlaceholderProps) {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">xCollab workspace</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      </header>
      <div className="flex flex-col gap-2 border border-dashed border-slate-300 bg-white px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">This workspace is ready for its next feature.</p>
          <p className="mt-1 text-sm text-slate-500">Your role-specific dashboard navigation is active.</p>
        </div>
        <span className="inline-flex w-fit items-center border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
          Coming soon
        </span>
      </div>
    </section>
  );
}