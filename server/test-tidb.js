const db = require("./db");

async function testConnection() {
    try {
        const [rows] = await db.query(
            "SELECT DATABASE() AS database_name"
        );

        console.log("TiDB Connected Successfully!");
        console.log("Database:", rows[0].database_name);

        const [placements] = await db.query(
            "SELECT COUNT(*) AS total FROM placements"
        );

        console.log(
            "Total Placement Records:",
            placements[0].total
        );

    } catch (error) {
        console.error("TiDB Connection Failed:", error.message);
    } finally {
        await db.end();
    }
}

testConnection();