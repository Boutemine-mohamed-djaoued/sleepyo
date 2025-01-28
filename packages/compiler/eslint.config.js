import js from "@eslint/js"; // Import the recommended ESLint rules

export default [
  js.configs.recommended, // Extend the recommended rules
  {
    languageOptions: {
      ecmaVersion: "latest", // Use the latest ECMAScript version
      sourceType: "module", // Use ES modules
      globals: {
        console: "readonly", // Define console as a global variable
        window: "readonly", // Define window as a global variable
        document: "readonly", // Define document as a global variable
      },
    },
    rules: {},
  },
];
