import Head from 'next/head';

export default function Home({ posts = [] }) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-blue-500/30">
      <Head>
        <title>Eric K. | Fragments</title>
      </Head>

      <main className="max-w-2xl mx-auto py-24 px-8">
        {/* Header: 極簡字體設計 */}
        <header className="mb-24">
          <h1 className="text-5xl font-black text-white italic tracking-tighter mb-4">
            ERIC K<span className="text-blue-600">.</span>
          </h1>
          <p className="text-slate-500 font-mono text-[10px] tracking-[0.3em] uppercase">
            Recording life between simulations.
          </p>
        </header>

        {/* 日誌流: 垂直時間軸設計 */}
        <div className="space-y-32 relative border-l border-slate-900/50 ml-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <article key={post.id} className="relative pl-12 group">
                {/* 裝飾圓點：滑鼠移入會發光 */}
                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 bg-slate-800 rounded-full group-hover:bg-blue-600 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all duration-500"></div>
                
                {/* 日期與狀態 */}
                <div className="flex items-center gap-4 mb-6 font-mono text-[10px] tracking-widest text-slate-600">
                  <span className="bg-slate-900 px-2 py-0.5 rounded">{post.date}</span>
                  {post.status && (
                    <span className="text-blue-500 opacity-70 uppercase">{post.status}</span>
                  )}
                </div>

                {/* 標題：大膽的排版 */}
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight group-hover:text-blue-400 transition-colors duration-300">
                  {post.title}
                </h2>

                {/* 內文：加入首字放大與優雅的行距 */}
                {post.content && (
                  <div className="mb-10">
                    <p className="text-lg text-slate-400 leading-relaxed font-serif italic border-l-4 border-slate-900 pl-6 py-2">
                      {post.content}
                    </p>
                  </div>
                )}

                {/* 地點與心情：美式工業風標籤 */}
                <div className="flex flex-wrap gap-6 pt-6 border-t border-slate-900/30">
                  {post.place && (
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-600 font-bold uppercase mb-1">Location</span>
                      <span className="text-xs text-slate-500 font-mono">@ {post.place}</span>
                    </div>
                  )}
                  {post.mood && (
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-600 font-bold uppercase mb-1">Current Mood</span>
                      <span className="text-xs text-blue-500/70 font-mono"># {post.mood}</span>
                    </div>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="pl-12 text-slate-800 font-mono text-sm italic tracking-widest animate-pulse">
              // SYNCING_NOTION_CORE...
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-48 pt-12 border-t border-slate-900/50">
          <p className="text-[10px] font-mono text-slate-700 uppercase tracking-[0.4em] text-center">
            Sentimental Researcher Series © 2026
          </p>
        </footer>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if (!data.results) return { props: { posts: [] }, revalidate: 10 };

    const posts = data.results.map((page) => {
      const p = page.properties;
      const getRichText = (name) => p[name]?.rich_text?.[0]?.plain_text || "";

      return {
        id: page.id,
        title: p.Title?.title?.[0]?.plain_text || p.Name?.title?.[0]?.plain_text || "Untitled",
        date: p.Date?.date?.start || "",
        content: getRichText('Content') || getRichText('content'),
        mood: getRichText('Mood') || getRichText('mood'),
        place: getRichText('Place') || getRichText('place'),
        status: p.Status?.status?.name || ""
      };
    });

    return { props: { posts }, revalidate: 10 };
  } catch (err) {
    return { props: { posts: [] }, revalidate: 10 };
  }
}
