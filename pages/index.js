export default function Home({ posts, error, debug }) {
  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-500 p-10 font-mono">
        <h1 className="text-2xl mb-4">🚨 Connection Failed</h1>
        <p className="bg-red-900/20 p-4 border border-red-900 rounded">{error}</p>
        <div className="mt-10 text-slate-500">
          <p>Debug Info:</p>
          <pre className="text-xs mt-2 bg-slate-900 p-4">{JSON.stringify(debug, null, 2)}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-10">
      <h1 className="text-4xl font-black mb-10 italic">ERIC K<span className="text-blue-600">.</span></h1>
      <div className="space-y-10">
        {posts && posts.map(post => (
          <div key={post.id} className="border-l-2 border-blue-600 pl-6">
            <h2 className="text-2xl font-bold">{post.title}</h2>
            <p className="text-slate-400 mt-2">{post.content}</p>
          </div>
        ))}
        {(!posts || posts.length === 0) && <p className="text-slate-600 italic">// NO DATA IN DATABASE //</p>}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const databaseId = process.env.NOTION_DATABASE_ID?.trim();
  const token = process.env.NOTION_TOKEN?.trim();

  // 1. 檢查變數是否存在
  if (!databaseId || !token) {
    return { props: { error: `Missing Variables. ID: ${databaseId ? 'YES' : 'NO'}, Token: ${token ? 'YES' : 'NO'}` } };
  }

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

    // 2. 檢查 Notion API 是否報錯
    if (data.object === 'error') {
      return { props: { error: `Notion API Error: ${data.message}`, debug: data } };
    }

    // 3. 處理資料
    const posts = data.results?.map((page) => ({
      id: page.id,
      title: page.properties.Title?.title?.[0]?.plain_text || page.properties.Name?.title?.[0]?.plain_text || "Untitled",
      content: page.properties.Content?.rich_text?.[0]?.plain_text || "No Content",
    })) || [];

    return { props: { posts, debug: { status: response.status, results_count: data.results?.length } } };
  } catch (err) {
    // 4. 捕捉網路或語法錯誤
    return { props: { error: `Fetch Exception: ${err.message}` } };
  }
}
