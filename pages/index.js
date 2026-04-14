import Head from 'next/head';

export default function Home({ posts }) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-emerald-500/30">
      <Head>
        <title>Eric K. | Digital Space</title>
      </Head>
      
      <div className="max-w-2xl mx-auto px-6 py-20">
        <header className="mb-20">
          <div className="flex justify-between items-baseline mb-2">
            <a href="https://www.notion.so/342028cc25a180cb8648f42782219809" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">
              <h1 className="text-3xl font-bold tracking-tighter text-white font-mono italic">Eric K.</h1>
            </a>
            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">📍 Baton Rouge, LA</span>
          </div>
          
          <p className="text-emerald-500 font-mono text-xs mb-8 tracking-widest uppercase font-bold">
            PhD Student & Research Assistant
          </p>
          
          <div className="space-y-6 text-slate-400 leading-relaxed text-[13px] sm:text-sm text-justify">
            <p>
              Welcome to my digital space. I am Eric, a PhD Student and a Research Assistant. 
              My daily life is defined by the intersection of <span className="text-slate-200">high-performance computing (HPC)</span> queues and complex <span className="text-slate-200">hydrogeological systems</span>.
            </p>
            <p>
              My research focuses on <span className="text-slate-200 font-medium">Groundwater Analysis and Water Resource Management</span>, 
              where I leverage computational simulation and Python-based automation.
            </p>

            <div className="py-2 flex flex-wrap items-center gap-2 text-[10px] font-mono text-emerald-500/80 uppercase tracking-tighter">
              <span className="text-slate-600">🛠️ Stack:</span>
              <span className="px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5">Hydrogeology</span>
              <span className="px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5">Python</span>
              <span className="px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5">Simulation</span>
            </div>

            <p className="text-slate-500 italic border-l-2 border-slate-800 pl-4 py-1">
              While my days are spent deciphering the underground world across the United States, this site is a dedicated space for my <span className="text-slate-300">daily fragments</span>.
            </p>
          </div>
        </header>

        <section className="space-y-12">
          {posts && posts.length > 0 && (
            <>
              <div className="flex items-center space-x-4">
                <h2 className="text-[10px] uppercase tracking-[0.5em] text-slate-500 font-bold">Timeline / Fragments</h2>
                <div className="h-[1px] flex-1 bg-slate-900"></div>
              </div>
              <div className="space-y-10">
                {posts.map((post) => (
                  <div key={post.id} className="group relative border-l border-slate-800 pl-6 py-1 hover:border-emerald-500/50 transition-all">
                    <div className="absolute -left-[4px] top-2.5 w-2 h-2 rounded-full bg-slate-800 border border-[#050505] group-hover:bg-emerald-500 transition-all" />
                    <div className="mb-2 flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      <span className="text-slate-400">{post.date}</span>
                      {post.place && <span className="text-slate-600">@ {post.place}</span>}
                      {post.mood && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 font-bold">
                          {post.mood}
                        </span>
                      )}
                    </div>
                    <a href={post.url} target="_blank" rel="noopener noreferrer" className="block">
                      <h3 className="text-slate-100 font-medium text-lg leading-snug group-hover:text-white group-hover:underline decoration-emerald-500/30 transition-all font-mono">
                        {post.title}
                      </h3>
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <footer className="mt-40 pt-8 border-t border-slate-900 opacity-20 text-[9px] font-mono tracking-[0.4em] text-center uppercase">
          SYSTEM.LOG // LSU_HYDRO // 2026
        </footer>
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
        sorts: [{ property: 'Date', direction: 'descending' }],
        filter: { property: "Status", status: { equals: "Done" } }
      }),
    });

    const data = await res.json();

    const posts = data.results?.map((page) => ({
      id: page.id,
      url: `https://www.notion.so/${page.id.replace(/-/g, '')}`,
      title: page.properties.Title?.title[0]?.plain_text || "Untitled",
      date: page.properties.Date?.date?.start || "",
      mood: page.properties.Mood?.rich_text[0]?.plain_text || "",
      place: page.properties.Place?.rich_text[0]?.plain_text || "",
    })) || [];

    return { props: { posts }, revalidate: 30 };
  } catch (error) {
    return { props: { posts: [] }, revalidate: 10 };
  }
}
