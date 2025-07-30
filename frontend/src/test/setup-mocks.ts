// TestC用の共通モック設定

// Jest の setupFilesAfterEnv で実行されるグローバルモック設定

// Toastライブラリのモック
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

// localStorageのモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// QueryClientの設定 - モックしない（TestCルールに従う）
// カスタムフックは実装を使用するため、QueryClientもモックしない

// Navigation モック関数（各テストファイルで使用）
const createNavigationMocks = () => ({
  mockPush: jest.fn(),
  mockReplace: jest.fn(),
  mockPrefetch: jest.fn(),
});

// グローバルに共通モック関数を提供
(global as any).createNavigationMocks = createNavigationMocks;

// すべてのモックをリセットする関数
export const resetAllMocks = () => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
};

// localStorageモックをエクスポート
export { localStorageMock };