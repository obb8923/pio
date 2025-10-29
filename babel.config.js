module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
    plugins: [
    ['module-resolver',
    {
      root: ['./src'], // 별칭 기준 경로
      alias: {
        '@': './src', // @ 를 src 폴더로 매핑
        '@assets': './assets',
        '@domain': './src/domain',
        '@libs': './src/libs',
        '@hooks': './src/hooks',
        '@components': './src/components',
        '@screens': './src/screens',
        '@types': './src/types',
        '@utils': './src/utils',
        '@styles': './src/styles',
        '@config': './src/config',
        '@services': './src/services',
        '@store': './src/store',
      },
    }],
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