import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans">
      <Head>
        <title>Eric K. | Fragments</title>
      </Head>

      <main className="max-w-4xl mx-auto py-20 px-6">
        <header className="mb-12">
          <h1 className="text-5xl font-black text-white italic tracking-tighter mb-4">
            ERIC K<span className="text-blue-600">.</span>
          </h1>
          <p className="text-slate-500 font-mono text-xs tracking-widest uppercase opacity-70">
            Recording life between simulations.
          </p>
        </header>

        {/* Notion Embed 區塊 */}
        <div className="w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900/20 shadow-2xl">
          <iframe 
            src="https://notionwidget.com/embed/YOUR_NOTION_SHARE_LINK" 
            style={{ width: '100%', height: '600px', border: 'none' }}
            title="Notion Content"
          ></iframe>
        </div>

        <footer className="mt-12 text-[10px] text-slate-700 font-mono text-center uppercase tracking-widest">
          // Connection Mode: Direct Embed //
        </footer>
      </main>
    </div>
  );
}
