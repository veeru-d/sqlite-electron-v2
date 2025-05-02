import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'sqlite-electron',
  webDir: 'www',
  plugins: {
    CapacitorSQLite: {
      electronIsEncryption: true,
      electronWindowsLocation: 'C:\\Users\\Public',
    },
  },
};

export default config;
