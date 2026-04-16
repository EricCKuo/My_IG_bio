import Head from 'next/head';

export default function Home({ posts = [], debugInfo }) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans p-8">
      <Head><title>Eric K. | Debug Mode</title></Head>
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-4xl font-black text-white italic mb-12 tracking-tighter">Eric K.</h1>
        
        {/* 如果有偵錯資訊，會顯示在這裡 */}
        {debugInfo && (
          <div className="bg-red-900/20 border border-red-500/50 p-4 mb-10 rounded text-[10px] font-mono text-red-400">
            [DEBUG LOG]: {debugInfo}
          </div>
        )}

        <div className="relative border-l-2 border-slate-900 ml-3 space-y-12">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="relative pl-8">
                <div className="absolute -left-[9px] top-2 w-4 h-4 bg-blue-600 rounded-full border-4 border-[#050505]"></div>
                <div className="text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-widest">{post.date}</div>
                <h3 className="text-xl text-slate-100 font-semibold mb-2">{post.title}</h3>
                <div className="text-xs text-blue-400 font-mono"># {post.mood}</div>
              </div>
            ))
          ) : (
            <div className="pl-8 text-slate-700 text-sm font-mono italic">// NO DATA FOUND //</div>
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

    // 如果 Notion 報錯，直接把錯誤原因傳給前端
    if (data.object === "error") {
      return { props: { posts: [], debugInfo: `Notion API Error: ${data.message} (${data.code})` } };
    }

    if (!data.results || data.results.length === 0) {
      return { props: { posts: [], debugInfo: "Connection OK, but the database is empty or connection scope is wrong." } };
    }

    const posts = data.results.map((page) => {
      const p = page.properties;
      return {
        id: page.id,
        title: p.Title?.title?.[0]?.plain_text || p.title?.title?.[0]?.plain_text || "Untitled",
        date: p.Date?.date?.start || "2026-04-15",
        mood: p.Mood?.rich_text?.[0]?.plain_text || p.mood?.rich_text?.[0]?.plain_text || "",
      };
    });

    return { props: { posts }, revalidate: 1 };
  } catch (err) {
    return { props: { posts: [], debugInfo: "Fetch Error: Could not reach Notion API." } };
  }
}
