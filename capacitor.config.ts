import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tabu.game',
  appName: 'Tabu',
  webDir: '.output/public',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    buildOptions: {
      signingType: 'apksigner',
    },
  },
};

export default config;
