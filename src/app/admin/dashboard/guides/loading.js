import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <LoaderCircle
          size={32}
          className="mx-auto animate-spin text-green-700"
        />
        <p className="mt-3 text-sm text-slate-500">
          Loading Travel Guides...
        </p>
      </div>
    </div>
  );
}