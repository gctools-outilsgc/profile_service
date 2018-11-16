'use strict'

module.exports = {
  "transform": {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.jsx?$": "<rootDir>/tests/jest-preprocess.js",
    "^.+\\.js?$": "<rootDir>/tests/jest-preprocess.js"
  },
  "testRegex": "(/__tests__/.*\\.([tj]sx?)|(\\.|/)(test|spec))\\.([tj]sx?)$",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  "testPathIgnorePatterns": ["node_modules", ".cache"],
  "moduleNameMapper": {
    ".+\\.(css|styl|less|sass|scss)$": "identity-obj-proxy",
    ".+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|ico)$": "<rootDir>/tests/__mocks__/fileMock.js"
  },
  "verbose":true,
  "collectCoverage":true,
  "coverageReporters": ["html"],
  "collectCoverageFrom": [
    "<rootDir>/src/**.{js,jsx}",
    "!**/node_modules/**",
    "!**/vendor/**"
  ],
  "reporters":["default",
    ["jest-html-reporter",{"includeFailureMsg":true, "includeConsoleLog":true}]
  ]
}