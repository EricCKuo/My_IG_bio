import Head from 'next/head';

export default function Home({ posts = [] }) { // 這裡加了預設值
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans p-8">
      <Head><title>Eric K. | Digital Space</title></Head>
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-3xl font-bold text-white italic mb-10 tracking-tighter">Eric K.</h1>
        
        <div className="space-y-8">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="border-l border-slate-800 pl-5 py-1">
                <div className="text-[10px] font-mono text-slate-500 mb-1">{post.date}</div>
                <h3 className="text-lg text-slate-100 font-medium tracking-tight">{post.title}</h3>
                {post.mood && <span className="text-xs text-emerald-500 italic mt-1 block"># {post.mood}</span>}
              </div>
            ))
          ) : (
            <div className="text-slate-600 text-xs font-mono uppercase tracking-widest italic border border-dashed border-slate-900 p-10 text-center">
              System standby. No fragments found.
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
    
    // 如果 Notion 回傳的資料結構不對，就回傳空陣列
    if (!data.results || !Array.isArray(data.results)) {
      return { props: { posts: [] }, revalidate: 10 };
    }

    const posts = data.results.map((page) => {
      const p = page.properties;
      return {
        id: page.id,
        title: p.Title?.title?.[0]?.plain_text || p.title?.title?.[0]?.plain_text || "Untitled",
        date: p.Date?.date?.start || "",
        mood: p.Mood?.rich_text?.[0]?.plain_text || p.mood?.rich_text?.[0]?.plain_text || "",
      };
    });

    return { props: { posts }, revalidate: 10 };
  } catch (error) {
    console.error(error);
    return { props: { posts: [] }, revalidate: 10 };
  }
}
