import Head from 'next/head';

export default function Home({ posts = [] }) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-blue-500/30">
      <Head>
        <title>Eric K. | Fragments</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="max-w-2xl mx-auto py-20 px-8">
        {/* Header 區塊 */}
        <header className="mb-24">
          <h1 className="text-6xl font-black text-white italic tracking-tighter mb-4">
            ERIC K<span className="text-blue-600">.</span>
          </h1>
          <p className="text-slate-500 font-mono text-[10px] tracking-[0.4em] uppercase opacity-70">
            Recording life between simulations.
          </p>
        </header>

        {/* 日誌流佈局 */}
        <div className="space-y-32 relative border-l border-slate-900/50 ml-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <article key={post.id} className="relative pl-12 group">
                {/* 裝飾性圓點：滑鼠移入會發光 */}
                <div className="absolute -left-[5.5px] top-2 w-2.5 h-2.5 bg-slate-800 rounded-full group-hover:bg-blue-600 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.8)] transition-all duration-500"></div>
                
                {/* 元數據：日期與狀態 */}
                <div className="flex items-center gap-4 mb-6 font-mono text-[10px] tracking-widest text-slate-600 uppercase">
                  <span className="bg-slate-900/80 px-2 py-1 rounded border border-slate-800/50">
                    {post.date}
                  </span>
                  {post.status && (
                    <span className="text-blue-500/60 border border-blue-500/20 px-2 py-1 rounded">
                      {post.status}
                    </span>
                  )}
                </div>

                {/* 標題 */}
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight group-hover:text-blue-400 transition-colors duration-300">
                  {post.title}
                </h2>

                {/* 感性內文：首字放大與斜體排版 */}
                {post.content && (
                  <div className="mb-10 text-xl text-slate-400 leading-relaxed font-serif italic border-l-4 border-slate-900/80 pl-8 py-3 bg-gradient-to-r from-slate-900/20 to-transparent">
                    {post.content}
                  </div>
                )}

                {/* 標籤區塊：地點與心情 */}
                <div className="flex flex-wrap gap-10 pt-8 border-t border-slate-900/40">
                  {post.place && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-600 font-black uppercase tracking-t
