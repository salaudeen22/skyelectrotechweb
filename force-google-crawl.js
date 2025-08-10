const https = require('https');

const urls = [
  'https://sweet-hamster-f11198.netlify.app/sitemap.xml',
  'https://sweet-hamster-f11198.netlify.app/robots.txt'
];

const userAgents = [
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
];

function makeRequest(url, userAgent) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: new URL(url).hostname,
      path: new URL(url).pathname,
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 200) + '...'
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function testUrls() {
  console.log('🔍 Testing sitemap and robots.txt accessibility...\n');
  
  for (const url of urls) {
    console.log(`📄 Testing: ${url}`);
    
    try {
      const result = await makeRequest(url, userAgents[0]);
      console.log(`✅ Status: ${result.statusCode}`);
      console.log(`📋 Content-Type: ${result.headers['content-type']}`);
      console.log(`📏 Content-Length: ${result.headers['content-length']}`);
      console.log(`📄 Preview: ${result.data}`);
      console.log('');
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log('');
    }
  }
  
  console.log('🎯 Next Steps:');
  console.log('1. Go to Google Search Console');
  console.log('2. Delete the old sitemap entry');
  console.log('3. Add new sitemap: https://sweet-hamster-f11198.netlify.app/sitemap.xml');
  console.log('4. Wait 24-48 hours for Google to process');
}

testUrls();
