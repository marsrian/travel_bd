export default function PageHeader({
  eyebrow,
  title,
  description,
}) {
  return (
    <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 px-4 py-20 text-center text-white sm:py-24">
      <div className="mx-auto max-w-3xl">
        {eyebrow && (
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
            {eyebrow}
          </p>
        )}

        <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
          {title}
        </h1>

        {description && (
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-emerald-100 sm:text-base">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}