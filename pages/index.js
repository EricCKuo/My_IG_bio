const { Client } = require("@notionhq/client");
import Head from 'next/head';

export default function Home({ posts }) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-emerald-500/30">
      <Head>
        <title>Eric T. | Daily Fragments</title>
      </Head>
      
      <div className="max-w-xl mx-auto px-6 py-20">
        <header className="mb-16">
          <h1 className="text-3xl font-bold tracking-tighter text-white mb-2 font-mono italic">Eric T.</h1>
          <p className="text-emerald-500 font-mono text-xs mb-6 tracking-widest">PHD STUDENT @ LSU</p>
          <p className="text-slate-400 leading-relaxed text-sm max-w-md">
            Focusing on large-scale groundwater analysis across the U.S. <br/>
            <span className="text-slate-600 italic text-xs block mt-2">
              Recording life between simulations. No data, just fragments of the journey.
            </span>
          </p>
        </header>

        <section className="space-y-12">
          <h2 className="text-[10px] uppercase tracking-[0.5em] text-emerald-500/50 font-bold border-b border-slate-900 pb-2">
            Timeline / Fragments
          </h2>
          
          {posts.length === 0 ? (
            <p className="text-slate-700 text-xs italic font-mono">Connecting to Notion database...</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="group relative border-l border-slate-800 pl-6 py-1 hover:border-emerald-500/50 transition-all">
                <div className="absolute -left-[3px] top-2 w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-emerald-500 transition-colors" />
                
                <div className="mb-2 flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-500">
                  <span className="text-slate-400">{post.date}</span>
                  {post.place && <span className="text-slate-600">@ {post.place}</span>}
                  {post.mood && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/5 text-emerald-400 border border-emerald-500/20">
                      {post.mood}
                    </span>
                  )}
                </div>
                
                <h3 className="text-slate-100 font-medium text-lg leading-snug group-hover:text-white transition-colors">
                  {post.title}
                </h3>
              </div>
            ))
          )}
        </section>

        <footer className="mt-32 pt-8 border-t border-slate-900 opacity-20 text-[9px] font-mono tracking-[0.3em] text-center">
          SYSTEM.LOG // LSU_GROUNDWATER_RESEARCH // 2026
        </footer>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      sorts: [{ property: 'Date', direction: 'descending' }],
      filter: {
        property: "Status",
        status: { equals: "Done" } // 只有 Status 標記為 Done 的才會顯示
      }
    });

    const posts = response.results.map((page) => ({
      id: page.id,
      title: page.properties.Title?.title[0]?.plain_text || "Untitled Fragment",
      date: page.properties.Date?.date?.start || "",
      mood: page.properties.Mood?.rich_text[0]?.plain_text || "",
      place: page.properties.Place?.rich_text[0]?.plain_text || "",
    }));

    return { props: { posts }, revalidate: 30 };
  } catch (error) {
    console.error("Notion Error:", error);
    return { props: { posts: [] }, revalidate: 10 };
  }
}
