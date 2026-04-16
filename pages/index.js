import Head from 'next/head';

export default function Home({ posts = [] }) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-blue-500/30">
      <Head><title>Eric K. | Digital Space</title></Head>

      <main className="max-w-2xl mx-auto py-24 px-8">
        <header className="mb-24">
          <h1 className="text-5xl font-black text-white italic tracking-tighter mb-4">
            ERIC K<span className="text-blue-600">.</span>
          </h1>
          <p className="text-slate-500 font-mono text-[10px] tracking-[0.3em] uppercase">
            Recording life between simulations. No data, just fragments.
          </p>
        </header>

        <div className="space-y-32 relative border-l border-slate-900/50 ml-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <article key={post.id} className="relative pl-12 group">
                {/* 裝飾點 */}
                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 bg-slate-800 rounded-full group-hover:bg-blue-600 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all duration-500"></div>
                
                {/* 1. 日期與狀態 (自動偵測) */}
                <div className="flex items-center gap-4 mb-6 font-mono text-[10px] tracking-widest text-slate-600 uppercase">
                  <span className="bg-slate-900 px-2 py-0.5 rounded">{post.date}</span>
                  {post.status && <span className="text-blue-500 opacity-70 border border-blue-500/20 px-2 py-0.5 rounded">{post.status}</span>}
                </div>

                {/* 2. 標題 (自動抓取類型為 Title 的欄位) */}
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>

                {/* 3. 內文 (自動抓取 Content 欄位或第一個長文本) */}
                {post.content && (
                  <div className="mb-10 text-lg text-slate-400 leading-relaxed font-serif italic border-l-4 border-slate-900 pl-6 py-2">
                    {post.content}
                  </div>
                )}

                {/* 4. 其他所有欄位 (地點、心情、備註等) */}
                <div className="flex flex-wrap gap-8 pt-6 border-t border-slate-900/30">
                  {post.place && (
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-600 font-bold uppercase mb-1">Location</span>
                      <span className="text-xs text-slate-500 font-mono">{post.place}</span>
                    </div>
                  )}
                  {post.mood && (
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-600 font-bold uppercase mb-1">Mood</span>
                      <span className="text-xs text-blue-500/70 font-mono"># {post.mood}</span>
                    </div>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="pl-12 text-slate-800 font-mono text-sm italic tracking-widest animate-pulse uppercase">
              // NO DATA FOUND. CHECKING NOTION SCOPE... //
            </div>
          )}
        </div>
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
    if (!data.results) return { props: { posts: [] }, revalidate: 1 };

    const posts = data.results.map((page) => {
      const p = page.properties;
      
      // 【暴力偵測邏輯】
      // 1. 找標題欄位 (不管它叫什麼，只要 type 是 title)
      const titleProp = Object.values(p).find(v => v.type === 'title');
      
      // 2. 找日期欄位 (type 為 date)
      const dateProp = Object.values(p).find(v => v.type === 'date');
      
      // 3. 找狀態欄位 (type 為 status)
      const statusProp = Object.values(p).find(v => v.type === 'status');

      // 4. 其他欄位則根據「欄位名稱」精確抓取 (確保順序)
      const getVal = (name) => p[name]?.rich_text?.[0]?.plain_text || "";

      return {
        id: page.id,
        title: titleProp?.title?.[0]?.plain_text || "Untitled",
        date: dateProp?.date?.start || "2026-04-15",
        status: statusProp?.status?.name || "",
        content: getVal('Content') || getVal('content'),
        place: getVal('Place') || getVal('place'),
        mood: getVal('Mood') || getVal('mood')
      };
    });

    return { props: { posts }, revalidate: 1 };
  } catch (err) {
    return { props: { posts: [] }, revalidate: 1 };
  }
}
