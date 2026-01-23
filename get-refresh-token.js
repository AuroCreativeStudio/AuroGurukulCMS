const axios = require('axios');
const readline = require('readline');

const CLIENT_ID = '1000.ENYHVP8D5K2K6RONQ658O96HN0891I';
const CLIENT_SECRET = '69c367a8a8a17a3ac6bf1eb3070fc5228befe786b6';
const REDIRECT_URI = 'http://localhost:8080/zoho/callback';
const SCOPE = 'ZohoCRM.modules.leads.CREATE,ZohoCRM.modules.leads.READ,ZohoCRM.modules.leads.UPDATE';

const authUrl = `https://accounts.zoho.in/oauth/v2/auth?scope=${SCOPE}&client_id=${CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${REDIRECT_URI}`;

console.log('='.repeat(60));
console.log('STEP 1: Visit this URL in your browser:');
console.log('='.repeat(60));
console.log(authUrl);
console.log('='.repeat(60));
console.log('\nAfter clicking Accept, you will be redirected to:');
console.log('http://localhost:8080/zoho/callback?code=XXXXXXXXX');
console.log('\nCopy ONLY the code part (everything after code=)');
console.log('You have 60 seconds after authorization!\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('STEP 2: Paste the code here: ', async (code) => {
  try {
    console.log('\n⏳ Exchanging code for refresh token...');
    
    const response = await axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
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
    console.log(`ZOHO_CLIENT_ID=${CLIENT_ID}`);
    console.log(`ZOHO_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`ZOHO_REFRESH_TOKEN=${response.data.refresh_token}`);
    console.log(`ZOHO_API_DOMAIN=https://www.zohoapis.in`);
    console.log('='.repeat(60));
    console.log('\n✅ This refresh token is permanent - use it in production too!');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.error === 'invalid_code') {
      console.log('\n💡 The code expired (they only last 60 seconds).');
      console.log('Run this script again and paste the code faster!\n');
    }
  }
  rl.close();
});