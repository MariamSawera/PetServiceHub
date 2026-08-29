export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-16 text-white shadow-lg">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-100">
            Pet care made simple
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Trusted care for every wag, purr, and paw.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-teal-50">
            Book trusted pet sitters, vets, and grooming services from one easy platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/login"
              className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-teal-700 transition hover:bg-slate-100"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="rounded-lg border border-white/60 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sign up
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
