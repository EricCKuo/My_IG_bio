import Head from 'next/head';

export default function Home({ posts, debugInfo }) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans p-8">
      <Head><title>Eric K. | Final Debug</title></Head>
      
      <main className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-white italic mb-12">SYSTEM <span className="text-blue-600">CHECK</span></h1>

        {/* 偵錯面板 */}
        <div className="mb-12 p-6 bg-slate-900/50 border border-blue-900/30 rounded-lg font-mono text-[10px]">
          <p className="text-blue-400 mb-2">// DIAGNOSTIC REPORT //</p>
          <p>Status: <span className="text-green-500">CONNECTED</span></p>
          <p>Found Rows: <span className="text-white">{debugInfo?.rowCount || 0}</span></p>
          <p className="mt-4 text-blue-400">// DETECTED PROPERTIES IN YOUR NOTION //</p>
          <pre className="text-slate-500 mt-2">
            {JSON.stringify(debugInfo?.properties, null, 2)}
          </pre>
        </div>

        {/* 資料顯示區 */}
        <div className="space-y-20">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <article key={post.id} className="border-l-2 border-blue-600 pl-8 relative">
                <div className="absolute -left-[5px] top-0 w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,1)]"></div>
                <p className="text-[10px] font-mono text-slate-500 uppercase mb-2">{post.date}</p>
                <h2 className="text-2xl font-bold text-white mb-4">{post.title}</h2>
                <p className="text-lg text-slate-400 italic leading-relaxed font-serif tracking-wide">
                  {post.content}
                </p>
                <div className="mt-6 flex gap-4 text-[10px] font-mono text-blue-500/50">
                   {post.mood && <span>#{post.mood}</span>}
                   {post.place && <span>@{post.place}</span>}
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-slate-900 rounded-xl">
              <p className="text-slate-600 font-mono italic animate-pulse">
                // DATABASE IS CONNECTED BUT RETURNED NO ROWS //
                <br />
                <span className="text-[10px] mt-2 block font-normal text-slate-700">Check if your rows have content in the 'Title' column</span>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps({ res }) {
  res.setHeader('Cache-Control', 'no-store');
  const databaseId = process.env.NOTION_DATABASE_ID?.trim();
  const token = process.env.NOTION_TOKEN?.trim();

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    // 獲取資料庫結構資訊，幫 Eric 檢查欄位名
    const samplePage = data.results?.[0];
    const properties = samplePage ? Object.keys(samplePage.properties) : "No properties found - is the database empty?";

    const posts = data.results?.map((page) => {
      const p = page.properties;
      
      // 自動尋找標題欄位 (不論它叫 Name 還是 Title)
      const titleKey = Object.keys(p).find(k => p[k].type === 'title');
      const title = p[titleKey]?.title?.[0]?.plain_text || "Untitled";

      // 自動尋找日期
      const dateKey = Object.keys(p).find(k => p[k].type === 'date');
      const date = p[dateKey]?.date?.start || "2026-04-16";

      // 針對 Eric 的特定欄位 (Content, Mood, Place)
      const getText = (name) => {
        const key = Object.keys(p).find(k => k.toLowerCase() === name.toLowerCase());
        return p[key]?.rich_text?.[0]?.plain_text || "";
      };

      return {
        id: page.id,
        title,
        date,
        content: getText('Content') || "Empty Content",
        mood: getText('Mood'),
        place: getText('Place')
      };
    }) || [];

    return { 
      props: { 
        posts, 
        debugInfo: { 
          rowCount: data.results?.length || 0,
          properties: properties 
        } 
      } 
    };
  } catch (err) {
    return { props: { posts: [], debugInfo: { error: err.message } } };
  }
}
