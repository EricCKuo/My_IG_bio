import Head from 'next/head';

export default function Home({ posts = [] }) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-blue-500/30">
      <Head>
        <title>Eric K. | Fragments</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="max-w-2xl mx-auto py-20 px-8">
        <header className="mb-24">
          <h1 className="text-6xl font-black text-white italic tracking-tighter mb-4">
            ERIC K<span className="text-blue-600">.</span>
          </h1>
          <p className="text-slate-500 font-mono text-[10px] tracking-[0.4em] uppercase opacity-70">
            Recording life between simulations. No data, just fragments.
          </p>
        </header>

        <div className="space-y-32 relative border-l border-slate-900/50 ml-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <article key={post.id} className="relative pl-12 group">
                {/* 裝飾點 */}
                <div className="absolute -left-[5.5px] top-2 w-2.5 h-2.5 bg-slate-800 rounded-full group-hover:bg-blue-600 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.8)] transition-all duration-500"></div>
                
                {/* 日期 */}
                <div className="flex items-center gap-4 mb-6 font-mono text-[10px] tracking-widest text-slate-600 uppercase">
                  <span className="bg-slate-900/80 px-2 py-1 rounded border border-slate-800/50">
                    {post.date}
                  </span>
                </div>

                {/* 標題 */}
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>

                {/* 內文 */}
                {post.content && (
                  <div className="mb-10 text-xl text-slate-400 leading-relaxed font-serif italic border-l-4 border-slate-900/80 pl-8 py-3 bg-gradient-to-r from-slate-900/10 to-transparent">
                    {post.content}
                  </div>
                )}

                {/* 標籤區 */}
                <div className="flex flex-wrap gap-10 pt-8 border-t border-slate-900/40">
                  {post.place && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">Location</span>
                      <span className="text-xs text-slate-500 font-mono italic">@ {post.place}</span>
                    </div>
                  )}
                  {post.mood && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">Current Mood</span>
                      <span className="text-xs text-blue-500/60 font-mono italic"># {post.mood}</span>
                    </div>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="pl-12 py-20 text-slate-800 font-mono text-sm italic tracking-[0.2em] animate-pulse uppercase">
              // DATA LINK ACTIVE. WAITING FOR FRAGMENTS... //
            </div>
          )}
        </div>

        <footer className="mt-56 pt-16 border-t border-slate-900/50 text-center">
          <p className="text-[9px] font-mono text-slate-700 uppercase tracking-[0.5em]">
            Sentimental Researcher Series © 2026
          </p>
        </footer>
      </main>
    </div>
  );
}

export async function getServerSideProps({ res }) {
  // 強制 Vercel 不要快取這一頁，實現「即時同步」
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );

  const databaseId = process.env.NOTION_DATABASE_ID;
  const token = process.env.NOTION_TOKEN;

  if (!databaseId || !token) {
    return { props: { posts: [] } };
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      // 排序：確保最新日期在最上面
      body: JSON.stringify({
        sorts: [{ property: 'Date', direction: 'descending' }]
      }),
    });

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return { props: { posts: [] } };
    }

    const posts = data.results.map((page) => {
      const p = page.properties;
      
      // 輔助函式：安全抓取 Text
      const getRichText = (name) => {
        const prop = p[name] || p[name.toLowerCase()];
        return prop?.rich_text?.[0]?.plain_text || "";
      };

      // 抓取 Title (通常是第一個欄位)
      const titleProp = Object.values(p).find(v => v.type === 'title');
      const title = titleProp?.title?.[0]?.plain_text || "Untitled";

      // 抓取 Date
      const dateProp = Object.values(p).find(v => v.type === 'date');
      const date = dateProp?.date?.start || "2026-04-16";

      return {
        id: page.id,
        title: title,
        date: date,
        content: getRichText('Content'),
        mood: getRichText('Mood'),
        place: getRichText('Place')
      };
    });

    return { props: { posts } };
  } catch (err) {
    console.error("API Error:", err);
    return { props: { posts: [] } };
  }
}
