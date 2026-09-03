import { Search } from "lucide-react";

export default function Hero() {
  // TODO(backend): wire this up to POST /api/symptom-checker with the query text,
  // then route to the results/chat page.
  const handleCheckNow = (e) => {
    e.preventDefault();
    const query = new FormData(e.target).get("symptoms");
    console.log("TODO: send to symptom checker API ->", query);
  };

  return (
    <section className="relative overflow-hidden px-6 pt-6 md:px-12">
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
        {/* Left: copy + search */}
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
            Smart care
            <br />
            <span className="text-[var(--theme-primary)]">for your pets</span>
          </h1>
          <p className="mt-5 max-w-md text-slate-500">
            AI symptom checker, vet appointments, health records and more —
            all in one place.
          </p>

          <form
            onSubmit={handleCheckNow}
            className="mt-8 flex max-w-lg items-center gap-2 rounded-full border border-slate-200 bg-white p-2 pl-5 shadow-sm"
          >
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <input
              type="text"
              name="symptoms"
              placeholder="Describe your pet's symptoms..."
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="relative z-10 shrink-0 rounded-full bg-[var(--theme-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--theme-primary-hover)]"
            >
              Check Now
            </button>
          </form>
        </div>

        {/* Right: hero image (your existing dog & cat image) */}
        <div className="relative flex justify-center md:justify-end">
          {/* Decorative paw print, purely visual */}
          {/* <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 top-6 hidden text-7xl text-brand-100 md:block"
          >
            🐾
          </span> */}
          <img
            src="/images/hero-dog-cat.png"
            alt="A golden retriever and a tabby cat sitting together"
            className="relative z-10 h-auto w-full max-w-[420px] rounded-[2rem] object-contain sm:max-w-[480px] md:max-w-[520px]"          />
        </div>
      </div>
    </section>
  );
}
