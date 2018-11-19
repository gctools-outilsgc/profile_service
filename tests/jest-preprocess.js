const babelOptions = {
  presets: ["@babel/preset-env"],
  plugins: [
    "@babel/plugin-proposal-optional-chaining",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-transform-runtime"
  ],
}

module.exports = require("babel-jest").createTransformer(babelOptions)  