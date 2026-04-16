import Head from 'next/head';

export default function Home({ posts }) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans p-8">
      <Head><title>Eric K. | Digital Space</title></Head>
      <div className="max-w-2xl mx-auto">
        <header className="mb-16">
          <h1 className="text-4xl font-bold text-white mb-2 italic">Eric K.</h1>
          <p className="text-emerald-500 font-mono text-sm tracking-widest">PHD STUDENT @ LSU</p>
          <p className="mt-4 text-slate-400 text-sm leading-relaxed">
            Welcome to my digital space. Recording life between simulations.
          </p>
        </header>

        <div className="space-y-10">
          {posts.map((post) => (
            <div key={post.id} className="border-l border-slate-800 pl-6 py-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">
                {post.date} {post.place && `@ ${post.place}`}
              </div>
              <h3 className="text-lg text-slate-100 font-medium">{post.title}</h3>
              {post.mood && <span className="text-xs text-emerald-400 mt-2 block italic"># {post.mood}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const res = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: { property: "Status", status: { equals: "Done" } }
    }),
  });
  const data = await res.json();
  const posts = data.results?.map((page) => ({
    id: page.id,
    title: page.properties.Title?.title[0]?.plain_text || "Untitled",
    date: page.properties.Date?.date?.start || "",
    mood: page.properties.Mood?.rich_text[0]?.plain_text || "",
    place: page.properties.Place?.rich_text[0]?.plain_text || "",
  })) || [];
  return { props: { posts }, revalidate: 10 };
}
