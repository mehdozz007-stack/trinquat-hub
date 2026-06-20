#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:3001';
const BOOTSTRAP_TOKEN = 'ba8277f9c94b0cc120ecd85dcd66bbc069ef5be2f6b998326cd628571a80127c';
const EMAIL = 'contact@trinquatetcompagnie.fr';
const PASSWORD = 'poiuytreza4U!';

let sessionCookie = '';

function makeRequest(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (sessionCookie) {
      options.headers['Cookie'] = sessionCookie;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.headers['set-cookie']) {
          sessionCookie = res.headers['set-cookie'][0].split(';')[0];
        }
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting complete flow test...\n');

  try {
    // Step 1: Bootstrap
    console.log('Step 1: Bootstrap admin...');
    let res = await makeRequest('POST', '/api/admin/bootstrap', 
      { email: EMAIL, password: PASSWORD },
      { 'x-bootstrap-token': BOOTSTRAP_TOKEN }
    );
    console.log(`Status: ${res.status}, Response:`, res.body);
    console.log();

    // Step 2: Login
    console.log('Step 2: Login...');
    res = await makeRequest('POST', '/api/admin/login',
      { email: EMAIL, password: PASSWORD }
    );
    console.log(`Status: ${res.status}, Response:`, res.body);
    console.log(`Session Cookie: ${sessionCookie}`);
    console.log();

    // Step 3: Save draft
    console.log('Step 3: Save draft...');
    res = await makeRequest('POST', '/api/admin/drafts',
      { subject: 'Test Newsletter', content: 'This is a test' }
    );
    console.log(`Status: ${res.status}, Response:`, res.body);
    console.log();

    // Step 4: Get drafts
    console.log('Step 4: Get drafts...');
    res = await makeRequest('GET', '/api/admin/drafts', null);
    console.log(`Status: ${res.status}, Response:`, res.body);
    console.log();

    console.log('✅ All tests completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Run tests
setTimeout(runTests, 500);
