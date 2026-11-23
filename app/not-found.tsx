import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F2F3] text-[#0B1026] px-6 select-none">
      <div className="max-w-md w-full border border-[rgba(2,31,148,0.34)] bg-white p-8 rounded-sm shadow-2xl text-center">
        <div className="font-swiss-mono text-xs uppercase tracking-[0.16em] text-[#D93829] font-bold mb-3">
          404 &middot; ENTRY NOT FOUND
        </div>
        <h1 className="font-swiss-sans font-black text-4xl uppercase tracking-tight text-[#0B1026]">
          LEDGER MISS
        </h1>
        <p className="mt-3 font-swiss-mono text-xs text-[#565C73] leading-relaxed">
          The requested coordinate does not exist on the Echo Time campus registry.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 font-swiss-mono text-xs">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded bg-[#021F94] text-[#F5F2F3] font-semibold uppercase tracking-[0.12em] hover:brightness-110 transition-all"
          >
            &larr; Return to Portal
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded border border-[rgba(2,31,148,0.34)] text-[#021F94] font-semibold uppercase tracking-[0.12em] hover:bg-[#021F94]/5 transition-all"
          >
            Workspace &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
