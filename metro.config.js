const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// `@supabase/supabase-js` ships ESM builds that Metro only picks up when the
// `.mjs` extension is part of the resolver's source extensions (web).
config.resolver.sourceExts = Array.from(new Set([...config.resolver.sourceExts, 'mjs']));

module.exports = config;
