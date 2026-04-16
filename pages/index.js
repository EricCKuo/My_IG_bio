/* eslint-disable react/no-unescaped-entities */
import Head from 'next/head';

export default function Home() {
  const notionUrl = "https://super-cairnsmore-e1d.notion.site/342028cc25a180cb8648f42782219809?v=342028cc25a180379be8000c45793982";

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans flex flex-col justify-center items-center p-6">
      <Head>
        <title>Eric K. | Fragments</title>
      </Head>

      <main className="max-w-2xl w-full text-center">
        <header className="mb-16">
          <h1 className="text-6xl font-black text-white italic tracking-tighter mb-4 animate-pulse">
            ERIC K<span className="text-blue-600">.</span>
          </h1>
          {/* 【修改 1】提升 Slogan 的透明度，讓它更清晰 */}
          <p className="text-slate-500 font-mono text-xs tracking-[0.3em] uppercase opacity-90">
            Recording life between simulations.
          </p>
        </header>

        <div className="space-y-8">
          <p className="text-lg text-slate-400 font-serif italic leading-relaxed">
            "No data, just fragments of a researcher's journey."
          </p>

          <a 
            href={notionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-mono font-bold text-white transition-all duration-200 bg-blue-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            ENTER THE FRAGMENTS →
          </a>
        </div>

        {/* 【修改 2】大幅提升 Meta Tags (關鍵字) 的清晰度 */}
        {/* 原本 text-blue-500 opacity-20 改為 text-slate-400 opacity-100 */}
        <div className="mt-20 grid grid-cols-3 gap-4 font-mono text-[8px] uppercase tracking-widest text-slate-400 opacity-100">
            <span>Groundwater</span>
            <span>Simulation</span>
            <span>Baton Rouge</span>
        </div>
      </main>

      {/* 【修改 3】提升 Footer 版權宣告的清晰度 */}
      {/* 原本 text-slate-800 改為 text-slate-600 */}
      <footer className="fixed bottom-8 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
        &copy; 2026 // ERIC CHENG-WEI KUO
      </footer>
    </div>
  );
}
