import Head from 'next/head';

export default function Home({ posts = [] }) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans p-8">
      <Head><title>Eric K. | Digital Space</title></Head>
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-4xl font-black text-white italic mb-12 tracking-tighter border-b-4 border-blue-600 inline-block">Eric K.</h1>
        
        <div className="relative border-l-2 border-slate-900 ml-3 space-y-16">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="relative pl-10">
                <div className="absolute -left-[11px] top-2 w-5 h-5 bg-blue-600 rounded-full border-4 border-[#050505] shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
                
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">{post.date}</span>
                  {post.status && (
                    <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-bold uppercase">{post.status}</span>
                  )}
                </div>

                <h3 className="text-2xl text-white font-bold tracking-tight mb-4 leading-tight">{post.title}</h3>
                
                <div className="flex flex-wrap gap-3">
                   {post.place && (
                     <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-md border border-slate-800">
                       <span>📍</span> {post.place}
                     </div>
                   )}
                   {post.mood && (
                     <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/5 px-3 py-1.5 rounded-md border border-blue-500/20 italic">
                       <span>#</span> {post.mood}
                     </div>
                   )}
                </div>
              </div>
            ))
          ) : (
            <div className="pl-10 text-slate-700 text-sm font-mono italic animate-pulse">
              // NO FRAGMENTS FOUND. PLEASE CHECK IF NOTION COLUMNS ARE CORRECT. //
            </div>
          )}
        </div>
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
    });

    const data = await res.json();
    if (!data.results || data.results.length === 0) return { props: { posts: [] }, revalidate: 1 };

    const posts = data.results.map((page) => {
      const p = page.properties;
      
      // 【終極相容邏輯】：自動尋找各種類型的欄位
      const findProp = (type) => Object.values(p).find(prop => prop.type === type);
      
      return {
        id: page.id,
        // 抓取 Title 類型的欄位
        title: findProp('title')?.title?.[0]?.plain_text || "Untitled",
        // 抓取 Date 類型的欄位
        date: findProp('date')?.date?.start || "2026-04-15",
        // 抓取 Place (Rich Text)
        place: p.Place?.rich_text?.[0]?.plain_text || p.place?.rich_text?.[0]?.plain_text || "",
        // 抓取 Mood (Rich Text)
        mood: p.Mood?.rich_text?.[0]?.plain_text || p.mood?.rich_text?.[0]?.plain_text || "",
        // 抓取 Status (Status)
        status: p.Status?.status?.name || p.status?.status?.name || ""
      };
    });

    return { props: { posts }, revalidate: 1 };
  } catch (err) {
    return { props: { posts: [] }, revalidate: 1 };
  }
}
