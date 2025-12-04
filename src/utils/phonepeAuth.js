const crypto = require("crypto");

function generatePhonePeToken(clientId, clientSecret, rawBody, version) {
  const message = clientId + rawBody + version;
  const hmac = crypto.createHmac("sha256", clientSecret);
  hmac.update(message);
  return hmac.digest("base64");
}

module.exports = { generatePhonePeToken };
