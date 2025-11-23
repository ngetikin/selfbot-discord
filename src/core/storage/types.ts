export type StorageAdapter = {
  readJson: <T>(key: string, fallback: T) => T;
  writeJson: <T>(key: string, data: T) => void;
  listKeys: () => string[];
  remove: (key: string) => void;
};
