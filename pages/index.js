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
              // NO FRAGMENTS FOUND. PLEASE ENSURE NOTION CONNECTION IS ACTIVE //
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
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

    if (!data.results || data.results.length === 0) {
      return { props: { posts: [] } };
    }

    const posts = data.results.map((page) => {
      const p = page.properties;
      
      // 改用最原始的方式抓取 Text
      const getVal = (name) => {
        const prop = p[name];
        if (!prop) return "";
        // 兼容 Title 類型和 Rich Text 類型
        if (prop.type === 'title') return prop.title?.[0]?.plain_text || "";
        if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text || "";
        return "";
      };

      return {
        id: page.id,
        title: getVal('Title') || getVal('Name') || "Untitled",
        date: p.Date?.date?.start || "2026-04-16",
        content: getVal('Content'),
        mood: getVal('Mood'),
        place: getVal('Place')
      };
    });

    return { props: { posts } };
  } catch (error) {
    return { props: { posts: [] } };
  }
}
