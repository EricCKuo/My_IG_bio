import Head from 'next/head';

export default function Home({ posts }) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-emerald-500/30">
      <Head><title>Eric K. | Digital Space</title></Head>
      <div className="max-w-2xl mx-auto px-6 py-20">
        <header className="mb-20">
          <div className="flex justify-between items-baseline mb-2">
            <h1 className="text-3xl font-bold tracking-tighter text-white font-mono italic">Eric K.</h1>
            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">📍 Baton Rouge, LA</span>
          </div>
          <p className="text-emerald-500 font-mono text-xs mb-8 tracking-widest uppercase font-bold">PhD Student & Research Assistant @ LSU</p>
          <div className="space-y-6 text-slate-400 leading-relaxed text-sm">
            <p>Welcome to my digital space. Recording life between simulations. No data, just fragments.</p>
          </div>
        </header>

        <section className="space-y-12">
          {posts && posts.length > 0 ? (
            <div className="space-y-10">
              {posts.map((post) => (
                <div key={post.id} className="group relative border-l border-slate-800 pl-6 py-1 hover:border-emerald-500/50 transition-all">
                  <div className="absolute -left-[4px] top-2.5 w-2 h-2 rounded-full bg-slate-800 group-hover:bg-emerald-500 transition-all" />
                  <div className="mb-2 flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-500 uppercase">
                    <span>{post.date}</span>
                    {post.place && <span className="text-slate-600 truncate max-w-[150px]">@ {post.place}</span>}
                    {post.mood && <span className="text-emerald-400 font-bold"># {post.mood}</span>}
                  </div>
                  <h3 className="text-slate-100 font-medium text-lg font-mono tracking-tight">{post.title}</h3>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center border border-dashed border-slate-900 rounded">
              <p className="text-slate-700 text-xs italic font-mono uppercase tracking-widest">No fragments found in Notion.</p>
            </div>
          )}
        </section>

        <footer className="mt-40 pt-8 border-t border-slate-900 opacity-20 text-[9px] font-mono tracking-[0.4em] text-center uppercase">
          SYSTEM.LOG // 2026 // LSU_HYDRO_LAB
        </footer>
      </div>
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
      body: JSON.stringify({
        sorts: [{ property: 'Date', direction: 'descending' }]
      }),
    });

    const data = await res.json();
    if (!data.results) return { props: { posts: [] }, revalidate: 10 };

    // 這裡進行嚴格的資料清洗與過濾
    const posts = data.results
      .filter(page => {
        // 只有當 Status 為 "Done" 時才顯示 (兼容大小寫)
        const status = page.properties.Status?.status?.name || page.properties.status?.status?.name;
        return status === "Done";
      })
      .map((page) => {
        const props = page.properties;
        return {
          id: page.id,
          title: props.Title?.title?.[0]?.plain_text || props.title?.title?.[0]?.plain_text || "Untitled",
          date: props.Date?.date?.start || "",
          mood: props.Mood?.rich_text?.[0]?.plain_text || props.mood?.rich_text?.[0]?.plain_text || "",
          place: props.Place?.rich_text?.[0]?.plain_text || props.place?.rich_text?.[0]?.plain_text || "",
        };
      });

    return { props: { posts }, revalidate: 30 };
  } catch (error) {
    return { props: { posts: [] }, revalidate: 10 };
  }
}
