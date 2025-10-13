
export default {
  config: {
    // Replace the Strapi logo in auth (login) views

    // Override or extend the theme
    theme: {
      // overwrite light theme properties
      light: {
        colors: {
          primary100: "#f6ecfc",
          primary200: "#e0c1f4",
          primary500: "#ac73e6",
          primary600: "#9736e8",
          primary700: "#8312d1",
          danger700: "#b72b1a",
        },
      },

      // overwrite dark theme properties
      dark: {
        // ...
      },
    },

    // Disable video tutorials
    tutorials: false,
    // Disable notifications about new Strapi releases
    notifications: { releases: false },
  },

  bootstrap() {},
};