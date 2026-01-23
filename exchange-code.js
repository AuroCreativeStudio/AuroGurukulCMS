const axios = require('axios');

const CLIENT_ID = '1000.ENYHVP8D5K2K6RONQ658O96HN0891I';
const CLIENT_SECRET = '69c367a8a8a17a3ac6bf1eb3070fc5228befe786b6';
const CODE = '1000.6e3680b875124f391634a061e3358357.42934cbbaef554155fe69a9d6a208ed6';
const REDIRECT_URI = 'http://localhost:8080/zoho/callback';

(async () => {
  try {
    console.log('Exchanging code for refresh token...\n');
    
    const response = await axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
      params: {
        code: CODE,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      }
    });

    console.log('='.repeat(60));
    console.log('Full Response from Zoho:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(response.data, null, 2));
    console.log('='.repeat(60));

    if (response.data.refresh_token) {
      console.log('\n✅ SUCCESS! Copy these to your .env file:');
      console.log('='.repeat(60));
      console.log(`ZOHO_CLIENT_ID=${CLIENT_ID}`);
      console.log(`ZOHO_CLIENT_SECRET=${CLIENT_SECRET}`);
      console.log(`ZOHO_REFRESH_TOKEN=${response.data.refresh_token}`);
      console.log(`ZOHO_API_DOMAIN=https://www.zohoapis.in`);
      console.log('='.repeat(60));
    } else {
      console.log('\n⚠️ No refresh_token in response!');
      console.log('This might mean the code expired or access_type was not set to "offline"');
      console.log('\nTry getting a new authorization code with this URL:');
      console.log(`https://accounts.zoho.in/oauth/v2/auth?scope=ZohoCRM.modules.leads.CREATE,ZohoCRM.modules.leads.READ,ZohoCRM.modules.leads.UPDATE&client_id=${CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${REDIRECT_URI}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
})();