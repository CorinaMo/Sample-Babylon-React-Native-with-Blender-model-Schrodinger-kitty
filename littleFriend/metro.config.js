/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const { getDefaultConfig } = require('metro-config');
const config = {};

module.exports = ( async () => {
  const {
    resolver: { assetExts },
    } = await getDefaultConfig();

  return {
    transformer: {
      getTransformOptions:  () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
    resolver: {
      assetExts: [...assetExts, 'gltf', 'glb', 'babylon'],
    },
  };
})();
