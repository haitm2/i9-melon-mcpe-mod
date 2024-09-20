const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.assetExts.push('json', 'png', 'jpg', 'jpeg');

module.exports = defaultConfig;