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
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <article key={post.id} className="relative pl-12 group">
                <div className="absolute -left-[5.5px] top-2 w-2.5 h-2.5 bg-slate-800 rounded-full group-hover:bg-blue-600 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.8)] transition-all duration-500"></div>
                
                <div className="flex items-center gap-4 mb-6 font-mono text-[10px] tracking-widest text-slate-600 uppercase">
                  <span className="bg-slate-900/80 px-2 py-1 rounded border border-slate-800/50">
                    {post.date}
                  </span>
                </div>

                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>

                {post.content && (
                  <div className="mb-10 text-xl text-slate-400 leading-relaxed font-serif italic border-l-4 border-slate-900/80 pl-8 py-3 bg-gradient-to-r from-slate-900/10 to-transparent">
                    {post.content}
                  </div>
                )}

                <div className="flex flex-wrap gap-10 pt-8 border-t border-slate-900/40">
                  {post.place && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-600 font-black uppercase">Location</span>
                      <span className="text-xs text-slate-500 font-mono italic">@ {post.place}</span>
                    </div>
                  )}
                  {post.mood && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-600 font-black uppercase">Mood</span>
                      <span className="text-xs text-blue-500/60 font-mono italic"># {post.mood}</span>
                    </div>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="pl-12 py-20 text-slate-800 font-mono text-sm italic tracking-[0.2em] animate-pulse uppercase">
              // NO DATA FOUND. CHECK NOTION CONNECTION & DATABASE CONTENT //
            </div>
          )}
        </div>

        <footer className="mt-56 pt-16 border-t border-slate-900/50 text-center text-[9px] font-mono text-slate-700 uppercase tracking-[0.5em]">
          Sentimental Researcher Series © 2026
        </footer>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const token = process.env.NOTION_TOKEN;

  if (!databaseId || !token) {
    return { props: { posts: [] } };
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!data.results) return { props: { posts: [] } };

    const posts = data.results.map((page) => {
      const p = page.properties;
      
      // 暴力提取函數：遍歷所有屬性，找到第一個有內容的文字欄位
      const extractText = (propertyName) => {
        const prop = p[propertyName] || Object.values(p).find(v => v.type === 'rich_text' && v.rich_text?.length > 0);
        return prop?.rich_text?.[0]?.plain_text || "";
      };

      // 提取標題
      const titleProp = Object.values(p).find(v => v.type === 'title');
      const title = titleProp?.title?.[0]?.plain_text || "Untitled Fragment";

      // 提取日期
      const dateProp = Object.values(p).find(v => v.type === 'date');
      const date = dateProp?.date?.start || "2026-04-16";

      return {
        id: page.id,
        title: title,
        date: date,
        content: p.Content?.rich_text?.[0]?.plain_text || p.content?.rich_text?.[0]?.plain_text || "",
        mood: p.Mood?.rich_text?.[0]?.plain_text || p.mood?.rich_text?.[0]?.plain_text || "",
        place: p.Place?.rich_text?.[0]?.plain_text || p.place?.rich_text?.[0]?.plain_text || "",
      };
    });

    return { props: { posts } };
  } catch (error) {
    return { props: { posts: [] } };
  }
}
