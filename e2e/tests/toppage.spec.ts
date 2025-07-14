import { test, expect } from '@playwright/test';

test.describe('トップページ', () => {
  test('トップページにアクセスできる', async ({ page }) => {
    // トップページにアクセス
    await page.goto('http://localhost:3000');
    
    // ページタイトルを確認
    await expect(page).toHaveTitle(/Online Calendar/);
    
    // メインコンテンツが表示されることを確認
    await expect(page.locator('body')).toBeVisible();
    
    // 会議作成ボタンが存在することを確認
    await expect(page.locator('text=会議を作成')).toBeVisible();
  });

  test('カレンダーが表示される', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // カレンダーコンポーネントが表示されることを確認
    await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible();
  });
});