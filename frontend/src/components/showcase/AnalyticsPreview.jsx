export default function AnalyticsPreview() {
  return (
    <div className="grid grid-cols-3 gap-6">

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

        <p className="text-zinc-400">

          Team Velocity

        </p>

        <h2 className="mt-3 text-4xl font-bold text-green-400">

          +24%

        </h2>

      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

        <p className="text-zinc-400">

          PR Quality

        </p>

        <h2 className="mt-3 text-4xl font-bold">

          91%

        </h2>

      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

        <p className="text-zinc-400">

          Cycle Time

        </p>

        <h2 className="mt-3 text-4xl font-bold">

          2.4 Days

        </h2>

      </div>

    </div>
  );
}