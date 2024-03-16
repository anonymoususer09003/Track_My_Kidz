const presets = ["module:metro-react-native-babel-preset"];
const plugins = [];

// Correctly configured module-resolver plugin
plugins.push([
  "module-resolver",
  {
    root: ["./src"],
    extensions: [".js", ".json"],
    alias: {
      "@": "./src",
    },
  },
]);

// If you want to explicitly use the JSX transform plugin with the new JSX transform
// Note: This is usually not necessary if you're using React 17+ with the appropriate Babel preset
plugins.push([
  "@babel/plugin-transform-react-jsx",
  "react-native-reanimated/plugin",
  {
    runtime: "automatic", // This tells Babel to use the new JSX transform
  },
]);

module.exports = {
  presets,
  plugins,
};
