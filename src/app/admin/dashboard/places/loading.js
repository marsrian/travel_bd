export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-emerald-600/20 border-t-emerald-600" />

        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Loading Places Management...
        </p>
      </div>
    </div>
  );
}