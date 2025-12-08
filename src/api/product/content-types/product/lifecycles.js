'use strict';

module.exports = {
  async beforeCreate(event) {
    await generateProductIdFromTitle(event);
  },

  async beforeUpdate(event) {
    const { data } = event.params;
    
    // If Title is being updated AND Product_Id is empty, regenerate
    if (data.Title && !data.Product_Id) {
      await generateProductIdFromTitle(event);
    }
  },
};

async function generateProductIdFromTitle(event) {
  const { data } = event.params;

  // Only generate if we have a Title
  if (data.Title) {
    // Convert Title to lowercase slug
    const slug = data.Title
      .toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '')     // Remove special characters
      .replace(/\-\-+/g, '-')         // Replace multiple hyphens with single
      .replace(/^-+/, '')             // Trim hyphens from start
      .replace(/-+$/, '');            // Trim hyphens from end

    // Make sure slug is not empty
    if (slug && slug.trim() !== '') {
      data.Product_Id = slug;
    } else {
      // Fallback if slug generation fails
      data.Product_Id = `product-${Date.now()}`;
    }
  }
}