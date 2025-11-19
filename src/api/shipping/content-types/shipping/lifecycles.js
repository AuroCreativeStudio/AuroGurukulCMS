module.exports = {
  async beforeCreate(event) {
    await generateShippingId(event);
  },

  async beforeUpdate(event) {
    // If Shipping_ID is empty during update, generate one
    const { data } = event.params;
    if (!data.Shipping_ID) {
      await generateShippingId(event);
    }
  },
};

async function generateShippingId(event) {
  const { data } = event.params;

  // Only generate if Shipping_ID is not provided
  if (!data.Shipping_ID) {
    // Get last Shipping record
    const lastEntry = await strapi.db
      .query("api::shipping.shipping")   // UID from your schema
      .findMany({
        orderBy: { id: "desc" },
        limit: 1,
      });

    let nextNumber = 1;

    if (lastEntry.length > 0 && lastEntry[0].Shipping_ID) {
      const lastId = lastEntry[0].Shipping_ID.replace("SHIP", "");
      const lastNumber = parseInt(lastId, 10);

      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    // Format: SHIP0001
    data.Shipping_ID = `SHIP${String(nextNumber).padStart(4, "0")}`;
  }
}
