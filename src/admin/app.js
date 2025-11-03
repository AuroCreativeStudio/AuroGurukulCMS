import logo from "./extensions/fav.png";

export default {
  config: {
    head: {
      title: "AuroGurukul CMS",
      titleTemplate: "%s | AuroGurukul CMS",
      favicon: logo,
      meta: [
        {
          name: "description",
          content: "AuroGurukul CMS Dashboard",
        },
      ],
    },
    auth: {
      logo, // optional – shows favicon/logo on login page
    },
    menu: {
      logo, // optional – shows favicon/logo in sidebar
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
          buttonPrimary500: "#ee842c",
          buttonPrimary600: "#e07620",
        },
      },
      dark: {
        colors: {
          alternative100: "#bfbfffff",
          alternative200: "#f8f8f8ff",
          primary100: "#efd3ffff",
          primary200: "#e0c1f4",
          primary500: "#ee842c",
          primary600: "#ee842c",
          primary700: "#ee842c",
          danger700: "#b72b1a",
          buttonPrimary500: "#ee842c",
          buttonPrimary600: "#e07620",
        },
      },
    },
    translations: {
      en: {
        "HomePage.header.title": "Hello {name}",

        "app.components.LeftMenu.navbrand.title": "Store Dashboard",
        "app.components.LeftMenu.navbrand.workplace": "Dashboard",
        "app.components.HomePage.welcome.title": "Welcome to My Admin Panel!",
        "global.content.title": "My Custom Admin Title",
        "Auth.form.welcome.title": "Welcome to Auro Gurukul",
        "Auth.form.welcome.subtitle": "Login to your account",
        "Settings.profile.form.section.experience.interfaceLanguageHelp":
          "Preference changes will apply only to you.",
        "app.containers.AuthPage.head.title": "AuroGurukul CMS",
        "app.components.App.title": "AuroGurukul CMS",
        "app.containers.App.title": "AuroGurukul CMS",

      },
    },
    tutorials: false,
    notifications: { releases: false },
  },


  bootstrap() {
    document.title = "AuroGurukul CMS";
    
  },
};
