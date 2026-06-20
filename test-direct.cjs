const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'trinquat_newsletter.sqlite3');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

console.log('=== DIRECT DATABASE TEST ===');

// Test 1: List all admins
console.log('\n1. All admins in database:');
const allAdmins = db.prepare('SELECT id, email FROM admins').all();
console.log(allAdmins);

// Test 2: Query with exact ID
const testId = '32077d90-42d8-46d2-901e-c1ae543280de';
console.log(`\n2. Query for ID: ${testId}`);
const stmt = db.prepare('SELECT id, email FROM admins WHERE id = ?');
console.log('   Prepared statement created');

const result = stmt.get(testId);
console.log('   Query result:', result);

// Test 3: Check if getDatabase function works
console.log('\n3. Testing getDatabase function from db.cjs:');
const { getDatabase, getDrafts } = require('./db.cjs');
const testDb = getDatabase();
console.log('   getDatabase() called successfully');

const testResult = testDb.prepare('SELECT id, email FROM admins WHERE id = ?').get(testId);
console.log('   Query via getDatabase:', testResult);

// Test 4: Get drafts
console.log('\n4. Getting drafts for admin:');
if (testResult) {
  try {
    const drafts = getDrafts(testResult.id);
    console.log('   Drafts:', drafts);
  } catch (e) {
    console.error('   Error getting drafts:', e.message);
  }
}

db.close();
console.log('\n=== TEST COMPLETE ===');
