export default function ShowcaseTabs() {
  return (
    <div className="mt-14 flex justify-center">

      <div className="flex rounded-2xl border border-white/10 bg-white/[0.03] p-2">

        <button
          className="
          rounded-xl
          bg-violet-600
          px-6
          py-3
          font-medium
          "
        >
          Kanban
        </button>

        <button
          className="
          rounded-xl
          px-6
          py-3
          text-zinc-400
          hover:text-white
          "
        >
          AI Review
        </button>

        <button
          className="
          rounded-xl
          px-6
          py-3
          text-zinc-400
          hover:text-white
          "
        >
          Analytics
        </button>

      </div>

    </div>
  );
}