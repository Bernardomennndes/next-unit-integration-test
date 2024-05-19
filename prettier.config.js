module.exports = {
  arrowParens: 'always',
  bracketSameLine: false,
  bracketSpacing: true,
  endOfLine: 'auto',
  insertPragma: false,
  jsxSingleQuote: true,
  overrides: [
    {
      files: '*.html',
      options: {
        htmlWhitespaceSensitivity: 'css',
        singleQuote: false,
      },
    },
  ],
  printWidth: 80,
  quoteProps: 'as-needed',
  rangeEnd: Infinity,
  rangeStart: 0,
  requirePragma: false,
  semi: true,
  singleAttributePerLine: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
};
