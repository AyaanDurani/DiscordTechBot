const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "../tech_news.db");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error connecting to the database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});


// Create a table for user preferences (if it doesn't exist)
db.run(
    `CREATE TABLE IF NOT EXISTS preferences (
        userId TEXT PRIMARY KEY,
        topics TEXT
    )`,
    (err) => {
        if (err) console.error("Error creating table:", err.message);
    }
);

// Function to save user preferences
function saveUserPreferences(userId, topics) {
    const query = `INSERT OR REPLACE INTO preferences (userId, topics) VALUES (?, ?)`;
    db.run(query, [userId, topics], (err) => {
        if (err) {
            console.error("Error saving preferences:", err.message);
        } else {
            console.log(`Preferences saved for user: ${userId}`);
        }
    });
}

// Function to fetch user preferences
function getUserPreferences(userId, callback) {
    const query = `SELECT topics FROM preferences WHERE userId = ?`;
    db.get(query, [userId], (err, row) => {
        if (err) {
            console.error("Error fetching preferences:", err.message);
            callback(null);
        } else {
            callback(row ? row.topics : null);
        }
    });
}

// Create a table to store server configurations (e.g., channel ID for each server)
db.run(
    `CREATE TABLE IF NOT EXISTS server_config (
        serverId TEXT PRIMARY KEY,
        channelId TEXT
    )`,
    (err) => {
        if (err) console.error("Error creating table:", err.message);
    }
);

// Save the channel ID for a specific server
function saveChannelId(serverId, channelId) {
    const query = `INSERT OR REPLACE INTO server_config (serverId, channelId) VALUES (?, ?)`;
    db.run(query, [serverId, channelId], (err) => {
        if (err) {
            console.error("Error saving channel ID:", err.message);
        } else {
            console.log(`Channel ID saved for server: ${serverId}`);
        }
    });
}

// Get the channel ID for a specific server
function getChannelId(serverId, callback) {
    const query = `SELECT channelId FROM server_config WHERE serverId = ?`;
    db.get(query, [serverId], (err, row) => {
        if (err) {
            console.error("Error fetching channel ID:", err.message);
            callback(null);
        } else {
            callback(row ? row.channelId : null);
        }
    });
}

// Add column for user preferences in the database (if not already created)
db.run(`ALTER TABLE server_config ADD COLUMN category TEXT`, (err) => {
    if (err) console.log("Category column already exists or error:", err.message);
});

// Save category preference
function saveCategoryPreference(serverId, category) {
    const query = `INSERT OR REPLACE INTO server_config (serverId, category) VALUES (?, ?)`;
    db.run(query, [serverId, category], (err) => {
        if (err) {
            console.error("Error saving category preference:", err.message);
        } else {
            console.log(`Category preference saved for server: ${serverId}`);
        }
    });
}

// Get category preference for a server
function getCategoryPreference(serverId, callback) {
    const query = `SELECT category FROM server_config WHERE serverId = ?`;
    db.get(query, [serverId], (err, row) => {
        if (err) {
            console.error("Error fetching category preference:", err.message);
            callback(null);
        } else {
            callback(row ? row.category : "technology"); // Default to 'technology' if not set
        }
    });
}


module.exports = { saveChannelId, getChannelId, saveUserPreferences,
    getUserPreferences, saveCategoryPreference, getCategoryPreference};
