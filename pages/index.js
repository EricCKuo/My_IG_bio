import Head from 'next/head';

export default function Home({ posts }) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-8">
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-3xl font-bold text-white italic mb-10">Eric K.</h1>
        <div className="space-y-8">
          {posts.map((post) => (
            <div key={post.id} className="border-l border-slate-800 pl-4">
              <div className="text-xs text-slate-500 font-mono mb-1">{post.date}</div>
              <div className="text-lg text-slate-200">{post.title}</div>
              <div className="text-xs text-emerald-500 mt-1">{post.mood}</div>
            </div>
          ))}
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
    
    // 如果 Notion 沒回傳資料，給一個空的 array，防止網頁崩潰
    if (!data.results) return { props: { posts: [] }, revalidate: 10 };

    const posts = data.results.map((page) => {
      const p = page.properties;
      // 超級保險的抓取方式：如果欄位不存在，就給空字串
      const getPlainText = (field) => field?.rich_text?.[0]?.plain_text || field?.title?.[0]?.plain_text || "";
      
      return {
        id: page.id,
        title: getPlainText(p.Title) || getPlainText(p.title) || "Untitled",
        date: p.Date?.date?.start || "",
        mood: getPlainText(p.Mood) || getPlainText(p.mood) || "",
        place: getPlainText(p.Place) || getPlainText(p.place) || "",
      };
    });

    return { props: { posts }, revalidate: 10 };
  } catch (error) {
    return { props: { posts: [] }, revalidate: 10 };
  }
}
