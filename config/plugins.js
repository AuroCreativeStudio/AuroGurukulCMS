module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "@strapi-community/strapi-provider-upload-google-cloud-storage",
      providerOptions: {
        bucketName: env("GCS_BUCKET_NAME"),
        publicFiles: true,
        uniform: false,
        basePath: "",
        serviceAccount: JSON.parse(
          Buffer.from(env("GCS_SERVICE_ACCOUNT_JSON"), "base64").toString("utf8")
        ),
      },
    },
  },
});
