import Head from 'next/head';

export default function Home({ posts = [], rawData = null }) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans p-8">
      <Head><title>Eric K. | Debug Mode</title></Head>
      <main className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8 italic">System Debugging...</h1>
        
        {/* 如果抓不到資料，顯示原始回傳內容供診斷 */}
        {posts.length === 0 && (
          <div className="bg-slate-900 border border-blue-900/50 p-6 rounded-lg font-mono text-xs">
            <p className="text-blue-400 mb-4">// NOTION API RAW RESPONSE //</p>
            <pre className="overflow-auto text-slate-500 max-h-96">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-12 space-y-8">
          {posts.map((post) => (
            <div key={post.id} className="border-l-2 border-blue-600 pl-6">
              <h2 className="text-xl font-bold text-white">{post.title}</h2>
              <p className="text-slate-500 text-sm">{post.date}</p>
              <p className="mt-4 text-slate-300">{post.content}</p>
            </div>
          ))}
        </div>
        
        <p className="mt-12 text-[10px] text-slate-700 font-mono">
          If "results" is [], check if your Notion row is EMPTY or FILTERED.
        </p>
      </main>
    </div>
  );
}

export async function getServerSideProps({ res }) {
  res.setHeader('Cache-Control', 'no-store');
  const databaseId = process.env.NOTION_DATABASE_ID;
  const token = process.env.NOTION_TOKEN;

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

    // 如果沒有 results，把整個 data 丟給前端看
    if (!data.results || data.results.length === 0) {
      return { props: { posts: [], rawData: data } };
    }

    const posts = data.results.map((page) => {
      const p = page.properties;
      return {
        id: page.id,
        title: p.Title?.title?.[0]?.plain_text || p.Name?.title?.[0]?.plain_text || "Untitled",
        date: p.Date?.date?.start || "N/A",
        content: p.Content?.rich_text?.[0]?.plain_text || "",
      };
    });

    return { props: { posts, rawData: data } };
  } catch (err) {
    return { props: { posts: [], rawData: { error: err.message } } };
  }
}
