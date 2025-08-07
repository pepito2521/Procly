const axios = require('axios');

// URLs a probar
const testUrls = [
  'http://procly.net',
  'https://procly.net', 
  'http://www.procly.net',
  'https://www.procly.net',
  'http://procly.net/robots.txt',
  'https://procly.net/robots.txt',
  'http://www.procly.net/robots.txt',
  'https://www.procly.net/robots.txt'
];

async function testRedirects() {
  console.log('🔍 Probando redirecciones...\n');
  
  for (const url of testUrls) {
    try {
      const response = await axios.get(url, {
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Aceptar redirecciones
        }
      });
      
      console.log(`✅ ${url}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Final URL: ${response.request.res.responseUrl || url}`);
      console.log(`   Content-Type: ${response.headers['content-type']}`);
      console.log('');
      
    } catch (error) {
      console.log(`❌ ${url}`);
      console.log(`   Error: ${error.message}`);
      console.log('');
    }
  }
}

testRedirects(); 