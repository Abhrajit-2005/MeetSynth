const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create summaries table
      db.run(`
        CREATE TABLE IF NOT EXISTS summaries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          original_text TEXT NOT NULL,
          custom_prompt TEXT NOT NULL,
          generated_summary TEXT NOT NULL,
          edited_summary TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating summaries table:', err);
          reject(err);
        } else {
          console.log('✅ Summaries table created/verified');
        }
      });

      // Create email_logs table
      db.run(`
        CREATE TABLE IF NOT EXISTS email_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          summary_id INTEGER NOT NULL,
          recipient_emails TEXT NOT NULL,
          sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'sent',
          FOREIGN KEY (summary_id) REFERENCES summaries (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating email_logs table:', err);
          reject(err);
        } else {
          console.log('✅ Email logs table created/verified');
        }
      });

      // Create trigger to update updated_at timestamp
      db.run(`
        CREATE TRIGGER IF NOT EXISTS update_summaries_timestamp 
        AFTER UPDATE ON summaries
        BEGIN
          UPDATE summaries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
      `, (err) => {
        if (err) {
          console.error('Error creating trigger:', err);
        } else {
          console.log('✅ Database trigger created/verified');
        }
      });

      resolve();
    });
  });
};

// Initialize database when module is loaded
initDatabase().catch(console.error);

module.exports = db;
