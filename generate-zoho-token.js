const axios = require('axios');
const readline = require('readline');

// Your CORRECT credentials (note the full Client ID)
const CLIENT_ID = '1000.ENYHVP8D5K2K6RONQ658O96HN0891I';
const CLIENT_SECRET = '69c367a8a8a17a3ac6bf1eb3070fc5228befe786b6';  // Get the full secret from Zoho
const REDIRECT_URI = 'http://localhost:8080/zoho/callback';
const SCOPE = 'ZohoCRM.modules.leads.CREATE,ZohoCRM.modules.leads.READ,ZohoCRM.modules.leads.UPDATE';

// Zoho India domains
const AUTH_DOMAIN = 'https://accounts.zoho.in';
const TOKEN_DOMAIN = 'https://accounts.zoho.in';

console.log('='.repeat(60));
console.log('ZOHO CRM REFRESH TOKEN GENERATOR (India)');
console.log('='.repeat(60));
console.log('\nStep 1: Visit this URL in your browser:\n');

const authUrl = `${AUTH_DOMAIN}/oauth/v2/auth?scope=${SCOPE}&client_id=${CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${REDIRECT_URI}`;
console.log(authUrl);

console.log('\n' + '='.repeat(60));
console.log('Step 2: After authorization, copy the code from the redirect URL');
console.log('http://localhost:8080/zoho/callback?code=XXXXXXXXXXXXX');
console.log('='.repeat(60) + '\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Paste the authorization code here: ', async (code) => {
  try {
    console.log('\nExchanging code for tokens...');
    
    const response = await axios.post(`${TOKEN_DOMAIN}/oauth/v2/token`, null, {
      params: {
        code: code.trim(),
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS! Add these to your .env file:');
    console.log('='.repeat(60));
    console.log(`\nZOHO_CLIENT_ID=${CLIENT_ID}`);
    console.log(`ZOHO_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`ZOHO_REFRESH_TOKEN=${response.data.refresh_token}`);
    console.log(`ZOHO_API_DOMAIN=https://www.zohoapis.in`);
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
  rl.close();
});