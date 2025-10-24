const fs = require("fs");
const path = require("path");

module.exports = ({ env }) => {
  const serviceAccountPath = path.join(__dirname, "gcs-service-account.json");
  const serviceAccount = fs.existsSync(serviceAccountPath)
    ? require(serviceAccountPath)
    : null;

  return {
    upload: {
      config: {
        provider: "@strapi-community/strapi-provider-upload-google-cloud-storage",
        providerOptions: {
          bucketName: env("GCS_BUCKET_NAME"),
          publicFiles: true,
          uniform: false,
          basePath: "",
          serviceAccount,
        },
      },
    },
  };
};
