// eslint-disable-next-line import/no-commonjs
module.exports = {
  root: true,
  extends: ['@modern-js-app'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['../tsconfig.json'],
  },
  rules: {
    '@typescript-eslint/prefer-as-const': 0,
    '@typescript-eslint/no-extraneous-class': 0,
    '@typescript-eslint/naming-convention': 0,
    '@typescript-eslint/member-ordering': 0,
  },
};
