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
        '@shared': './src/shared',
        '@components': './src/shared/components',
        '@constants': './src/shared/constants',
        '@libs': './src/shared/libs',
        '@nav': './src/shared/nav',
        '@store': './src/shared/store',
        '@type': './src/shared/type',
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