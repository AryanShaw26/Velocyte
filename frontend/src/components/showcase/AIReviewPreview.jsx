export default function AIReviewPreview() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-10">

      <h3 className="text-2xl font-bold">

        Pull Request #142

      </h3>

      <div className="mt-10 flex items-center gap-10">

        <div className="flex h-32 w-32 items-center justify-center rounded-full border-8 border-violet-500 text-4xl font-bold">

          94

        </div>

        <div className="space-y-4">

          <p className="text-green-400">✓ Security Passed</p>

          <p className="text-green-400">✓ Maintainability Excellent</p>

          <p className="text-yellow-400">⚠ Performance Optimization Suggested</p>

          <p className="text-blue-400">💡 AI recommends caching API responses.</p>

        </div>

      </div>

    </div>
  );
}