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
                {/* 時間軸圓點 */}
                <div className="absolute -left-[11px] top-2 w-5 h-5 bg-blue-600 rounded-full border-4 border-[#050505] shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                
                {/* 日期 & 狀態 */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">{post.date}</span>
                  {post.status === 'Done' && (
                    <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full font-bold uppercase">Done</span>
                  )}
                </div>

                {/* 標題 */}
                <h3 className="text-2xl text-white font-bold tracking-tight mb-4 leading-tight">{post.title}</h3>
                
                {/* 地點 & 情緒標籤 */}
                <div className="flex flex-wrap gap-3">
                   {post.place && (
                     <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-md border border-slate-800">
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
              // SYNCING WITH NOTION DATABASE... NO FRAGMENTS FOUND //
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
      body: JSON.stringify({
        sorts: [{ property: 'Date', direction: 'descending' }]
      }),
    });

    const data = await res.json();
    if (!data.results) return { props: { posts: [] }, revalidate: 10 };

    const posts = data.results.map((page) => {
      const p = page.properties;
      
      // 自動識別欄位邏輯 (對齊你的 Notion 截圖)
      return {
        id: page.id,
        title: p.Title?.title?.[0]?.plain_text || p.title?.title?.[0]?.plain_text || "Untitled Fragment",
        date: p.Date?.date?.start || "2026-04-15",
        mood: p.Mood?.rich_text?.[0]?.plain_text || p.mood?.rich_text?.[0]?.plain_text || "",
        place: p.Place?.rich_text?.[0]?.plain_text || p.place?.rich_text?.[0]?.plain_text || "",
        status: p.Status?.status?.name || p.status?.status?.name || ""
      };
    });

    return { props: { posts }, revalidate: 10 };
  } catch (err) {
    return { props: { posts: [] }, revalidate: 10 };
  }
}
