#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'trinquat_newsletter.sqlite3');
const migrationsPath = path.join(__dirname, '..', 'migrations');

console.log('🔧 Initializing database...');
console.log(`📁 Database path: ${dbPath}`);

// Create database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Read and execute migration
const migrationFile = path.join(migrationsPath, '0001_init.sql');
const migrationSQL = fs.readFileSync(migrationFile, 'utf-8');

// Split by statements and execute
const statements = migrationSQL.split(';').filter(s => s.trim());

statements.forEach((statement, index) => {
  try {
    if (statement.trim()) {
      db.exec(statement);
    }
  } catch (err) {
    console.error(`❌ Error at statement ${index}:`, err.message);
    process.exit(1);
  }
});

// Verify tables
const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' 
  AND name NOT LIKE 'sqlite_%'
  ORDER BY name
`).all();

console.log(`\n✅ Database initialized with ${tables.length} tables:`);
tables.forEach(t => console.log(`   • ${t.name}`));

db.close();
console.log('\n✨ Done! Database is ready at ' + dbPath);
