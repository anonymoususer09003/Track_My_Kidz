/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const MetroConfig = require('@ui-kitten/metro-config');
const blacklist = require('metro-config/src/defaults/exclusionList');
const evaConfig = {
  evaPackage: '@eva-design/eva',
  customMappingPath: './mapping.json',
};

module.exports = MetroConfig.create(evaConfig,{
  resolver: {
    blacklistRE: blacklist([
      /ios\/Pods\/JitsiMeetSDK\/Frameworks\/JitsiMeet.framework\/assets\/node_modules\/react-native\/.*/,
    ]),
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
});
