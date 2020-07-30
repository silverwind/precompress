const {name} = require("./package.json");

module.exports = {
  input: `${name}.js`,
  output: {
    file: name,
    name,
    format: "cjs",
  },
  plugins: [
    require("rollup-plugin-hashbang")(),
    require("@rollup/plugin-json")(),
    require("@rollup/plugin-node-resolve").default(),
    require("@rollup/plugin-commonjs")({sourceMap: false}),
    require("rollup-plugin-terser").terser({output: {comments: false}}),
  ],
};
