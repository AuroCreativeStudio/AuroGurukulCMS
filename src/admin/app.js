
export default {
  config: {
    head: {
      title: 'AuroGurukul CMS',
    },
    theme: {
      light: {
        colors: {
          primary100: "#214587",
          primary200: "#e0c1f4",
          primary500: "#ee842c",
          primary600: "#ee842c",
          primary700: "#ee842c",
          danger700: "#b72b1a",
          buttonPrimary500: '#ee842c',
          buttonPrimary600: '#e07620',
        },
      },
      dark: {
        colors: {
          alternative100: '#bfbfffff',
          alternative200: '#f8f8f8ff',
          primary100: "#efd3ffff",
          primary200: "#e0c1f4",
          primary500: "#ee842c",
          primary600: "#ee842c",
          primary700: "#ee842c",
          danger700: "#b72b1a",
          buttonPrimary500: '#ee842c',
          buttonPrimary600: '#e07620',
        },
      },
    },
    tutorials: false,
    notifications: { releases: false },
  },

  bootstrap() { },
};