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
};
