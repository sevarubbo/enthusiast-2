module.exports = {
  "root": true,
  "extends": "eslint-config-seva",
  "settings": {
    "import/resolver": {
      "node": {
        "moduleDirectory": ["./source"],
      },
    },
  },
  "rules": {
    "max-lines": ["error", { "max": 100, "skipBlankLines": true, "skipComments": true }],
  },
};
