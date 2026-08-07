const columns = {
  "To Do": ["Landing Page", "Authentication"],
  "In Progress": ["GitHub Integration", "Hero UI"],
  Review: ["AI Code Review"],
  Done: ["Database Setup"],
};

export default function KanbanPreview() {
  return (
    <div className="grid grid-cols-4 gap-5">

      {Object.entries(columns).map(([title, tasks]) => (

        <div
          key={title}
          className="rounded-2xl bg-white/5 p-5 border border-white/10"
        >

          <h3 className="mb-5 font-semibold text-violet-300">

            {title}

          </h3>

          <div className="space-y-4">

            {tasks.map((task) => (

              <div
                key={task}
                className="rounded-xl bg-[#1A1B22] p-4 hover:bg-[#22232D] transition"
              >

                {task}

              </div>

            ))}

          </div>

        </div>

      ))}

    </div>
  );
}