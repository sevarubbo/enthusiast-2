module.exports = {
  root: true,
  extends: "eslint-config-seva",
  settings: {
    "import/resolver": {
      node: {
        moduleDirectory: ["./source"],
      },
    },
  },
  rules: {
    "import/no-duplicates": ["error"],

    "max-lines": [
      "error",
      { max: 300, skipBlankLines: true, skipComments: true },
    ],

    "@typescript-eslint/indent": "off",
    "@typescript-eslint/no-use-before-defined": "off",
  },
};
