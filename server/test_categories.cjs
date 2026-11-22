const db = require("./db");

async function test() {
  console.log("=== Testing Categories Database & Queries ===");
  try {
    const [allCats] = await db.query(
      "SELECT id, target_page, name, slug, color, icon, is_active FROM categories ORDER BY target_page, sort_order"
    );
    console.log(`Total categories in DB: ${allCats.length}`);

    const pages = ["events", "gallery", "notices", "faculty", "placements", "departments", "alumni"];
    for (const p of pages) {
      const pageCats = allCats.filter(c => c.target_page === p);
      console.log(`  Page "${p}": ${pageCats.length} categories -> [${pageCats.map(c => c.name).join(", ")}]`);
    }

    // Verify notices has category column
    const [noticeCols] = await db.query("SHOW COLUMNS FROM notices LIKE 'category'");
    console.log("Notice category column:", noticeCols[0]);

    console.log("=== Category Tests Passed! ===");
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

test();
