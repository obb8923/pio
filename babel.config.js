module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
    plugins: [
      ['module:react-native-dotenv', {
        envName: 'APP_ENV',
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: false,
        verbose: false,
      }],
      'react-native-reanimated/plugin',// 반드시 마지막에
    ],
  };
};
