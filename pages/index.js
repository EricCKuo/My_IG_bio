export async function getServerSideProps() {
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

    // --- 診斷邏輯：如果抓不到資料，我們在後台印出原因 ---
    if (!data.results || data.results.length === 0) {
      console.log("Notion API 成功連線，但回傳結果為空。請檢查資料庫是否有內容。");
      return { props: { posts: [] } };
    }

    const posts = data.results.map((page) => {
      const p = page.properties;
      
      // 自動偵測：尋找任何包含文字的欄位，不論名稱
      const getAllText = (obj) => {
        for (let key in obj) {
          if (obj[key].type === 'rich_text' && obj[key].rich_text.length > 0) {
            return obj[key].rich_text[0].plain_text;
          }
        }
        return "";
      };

      // 尋找標題
      const titleProp = Object.values(p).find(v => v.type === 'title');
      const title = titleProp?.title?.[0]?.plain_text || "Untitled";

      // 尋找日期
      const dateProp = Object.values(p).find(v => v.type === 'date');
      const date = dateProp?.date?.start || "2026-04-16";

      return {
        id: page.id,
        title: title,
        date: date,
        // 如果找不到名為 Content 的欄位，就隨便抓一個有文字的欄位當內容
        content: p.Content?.rich_text?.[0]?.plain_text || p.content?.rich_text?.[0]?.plain_text || getAllText(p),
        mood: p.Mood?.rich_text?.[0]?.plain_text || p.mood?.rich_text?.[0]?.plain_text || "",
        place: p.Place?.rich_text?.[0]?.plain_text || p.place?.rich_text?.[0]?.plain_text || "",
        status: p.Status?.status?.name || ""
      };
    });

    return { props: { posts } };
  } catch (err) {
    return { props: { posts: [] } };
  }
}
