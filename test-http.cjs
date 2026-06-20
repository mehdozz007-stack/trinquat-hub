const http = require('http');

console.log('=== HTTP REQUEST TEST ===\n');

// Test GET /api/admin/drafts with cookie
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/admin/drafts',
  method: 'GET',
  headers: {
    'Cookie': 'tc_admin=32077d90-42d8-46d2-901e-c1ae543280de'
  }
};

console.log('Making request:');
console.log(`  GET http://${options.hostname}:${options.port}${options.path}`);
console.log(`  Cookie: tc_admin=32077d90-42d8-46d2-901e-c1ae543280de`);

const req = http.request(options, (res) => {
  console.log(`\nResponse status: ${res.statusCode}`);
  console.log(`Response headers:`, res.headers);
  
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`\nResponse body:`);
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();

// Give it 2 seconds to complete
setTimeout(() => {
  process.exit(0);
}, 2000);
