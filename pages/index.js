import Head from 'next/head';

export default function Home({ posts = [] }) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans p-8">
      <Head><title>Eric K. | Digital Space</title></Head>
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-4xl font-black text-white italic mb-12 tracking-tighter">Eric K.</h1>
        
        <div className="relative border-l-2 border-slate-900 ml-3 space-y-12">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="relative pl-8">
                <div className="absolute -left-[9px] top-2 w-4 h-4 bg-blue-600 rounded-full border-4 border-[#050505]"></div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">{post.date}</div>
                <h3 className="text-xl text-slate-100 font-semibold tracking-tight mb-2">{post.title}</h3>
                <div className="flex gap-2">
                   {post.mood && <span className="text-xs px-2 py-0.5 bg-slate-900 text-blue-400 rounded font-mono"># {post.mood}</span>}
                   {post.place && <span className="text-xs px-2 py-0.5 bg-slate-900 text-slate-400 rounded font-mono">@ {post.place}</span>}
                </div>
              </div>
            ))
          ) : (
            <div className="pl-8 text-slate-700 text-sm font-mono italic">// DATABASE EMPTY OR DISCONNECTED //</div>
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
        // 不加 filter，代表「全抓」
        sorts: [{ property: 'Date', direction: 'descending' }]
      }),
    });

    const data = await res.json();
    if (!data.results) return { props: { posts: [] }, revalidate: 10 };

    const posts = data.results.map((page) => {
      const p = page.properties;
      // 強力抓取：無論欄位叫 Title, title, Mood, mood 都通用
      const getVal = (name) => p[name] || p[name.toLowerCase()] || p[name.charAt(0).toUpperCase() + name.slice(1)];

      return {
        id: page.id,
        title: getVal('Title')?.title?.[0]?.plain_text || "Untitled",
        date: getVal('Date')?.date?.start || "2026-04-15",
        mood: getVal('Mood')?.rich_text?.[0]?.plain_text || "",
        place: getVal('Place')?.rich_text?.[0]?.plain_text || ""
      };
    });

    return { props: { posts }, revalidate: 10 };
  } catch (err) {
    return { props: { posts: [] }, revalidate: 10 };
  }
}
