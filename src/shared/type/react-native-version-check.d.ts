declare module 'react-native-version-check' {
  interface VersionCheckResult {
    isNeeded: boolean;
    currentVersion: string;
    latestVersion: string;
    storeVersion: string;
    storeUrl: string;
  }

  interface VersionCheckOptions {
    provider?: 'playStore' | 'appStore';
  }

  export default {
    getCurrentVersion(): Promise<string>;,
    getLatestVersion(options?: VersionCheckOptions): Promise<string>;,
    needUpdate(options?: VersionCheckOptions): Promise<VersionCheckResult>;,
    getStoreUrl(options?: VersionCheckOptions): Promise<string>;
  };
} 