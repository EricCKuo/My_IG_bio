import Head from 'next/head';

export default function Home() {
  // 這是你的 Notion 公開網址
  const notionUrl = "https://super-cairnsmore-e1d.notion.site/342028cc25a180cb8648f42782219809?v=342028cc25a180379be8000c45793982";

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans">
      <Head>
        <title>Eric K. | Fragments</title>
      </Head>

      <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-black text-white italic tracking-tighter mb-2">
            ERIC K<span className="text-blue-600">.</span>
          </h1>
          <p className="text-slate-500 font-mono text-[10px] tracking-[0.2em] uppercase opacity-70">
            Recording life between simulations. No data, just fragments.
          </p>
        </header>

        {/* 容器：加入圓角與陰影 */}
        <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0f0f0f] shadow-2xl">
          {/* 使用 iframe-container 技巧確保高度適中 */}
          <iframe 
            src={notionUrl}
            className="w-full h-[700px] border-none"
            allowFullScreen
          ></iframe>
        </div>

        <footer className="mt-12 text-[10px] text-slate-800 font-mono text-center uppercase tracking-widest">
          &copy; 2026 Eric Kuo // All fragments reserved.
        </footer>
      </main>
    </div>
  );
}
