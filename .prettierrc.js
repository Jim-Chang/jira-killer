module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
  overrides: [
    {
      files: ['*.html'],
      options: {
        tabWidth: 4,
      },
    },
  ],
  importOrderParserPlugins: ['decorators-legacy', 'typescript'],
};
