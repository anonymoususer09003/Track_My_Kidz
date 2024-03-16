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

// If you're using React 17+ and want to explicitly use the new JSX transform
plugins.push([
  "@babel/plugin-transform-react-jsx",
  {
    runtime: "automatic", // This tells Babel to use the new JSX transform
  },
]);

// Add react-native-reanimated plugin separately
plugins.push("react-native-reanimated/plugin");

module.exports = {
  presets,
  plugins,
};
