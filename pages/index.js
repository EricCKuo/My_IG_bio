import { Client } from "@notionhq/client";
import Head from 'next/head';

export default function Home({ posts }) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-emerald-500/30">
      <Head><title>Eric T. | Daily Fragments</title></Head>
      <div className="max-w-xl mx-auto px-6 py-20">
        <header className="mb-16">
          <h1 className="text-3xl font-bold tracking-tighter text-white mb-2 font-mono">Eric T.</h1>
          <p className="text-emerald-500 font-mono text-sm mb-6">PhD Student @ LSU</p>
          <p className="text-slate-400 leading-relaxed text-sm max-w-md">
            Focusing on large-scale groundwater analysis across the U.S. <br/>
            <span className="text-slate-600 italic">This space is for my daily fragments—thoughts and life between simulations. No data, just the journey.</span>
          </p>
        </header>

        <section className="space-y-10">
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold border-b border-slate-900 pb-2">Daily Fragments</h2>
          {posts.map((post) => (
            <div key={post.id} className="group relative">
              <div className="mb-1 flex items-center space-x-3 text-[10px] font-mono text-slate-500">
                <span>{post.date}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-900 text-emerald-400 border border-slate-800">
                  {post.mood}
                </span>
              </div>
              <h3 className="text-white font-medium text-lg decoration-emerald-500/30 group-hover:underline transition-all">
                {post.title}
              </h3>
            </div>
          ))}
        </section>

        <footer className="mt-32 pt-8 border-t border-slate-900 opacity-30 text-[10px] font-mono tracking-widest">
          © 2026 / GROUNDWATER RESEARCHER / DAILY LOG
        </footer>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    sorts: [{ property: 'Date', direction: 'descending' }],
  });
  const posts = response.results.map((page) => ({
    id: page.id,
    title: page.properties.Title.title[0]?.plain_text || "Untitled",
    date: page.properties.Date.date?.start || "",
    mood: page.properties.Mood.select?.name || "Life",
  }));
  return { props: { posts }, revalidate: 60 };
}
