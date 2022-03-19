module.exports = {
  extends: 'airbnb',
  plugins: [
    'react',
  ],
  rules: {
    'no-undef': 'off',
    'no-shadow': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': 'off',
    'react/no-unstable-nested-components': 'off', // FIXME
    'react/function-component-definition': 'off', // FIXME
  },
};
