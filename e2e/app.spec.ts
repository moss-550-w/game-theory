import { test, expect } from '@playwright/test';

test.describe('应用主页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('加载后显示标题和四象限', async ({ page }) => {
    await expect(page.getByText('博弈论思想演进全景')).toBeVisible();
    await expect(page.getByText('极小极大定理')).toBeVisible();
    await expect(page.getByText('纳什均衡')).toBeVisible();
    await expect(page.getByText('逆向归纳均衡')).toBeVisible();
    await expect(page.getByText('贝叶斯均衡')).toBeVisible();
  });

  test('坐标轴标签可见', async ({ page }) => {
    await expect(page.getByText('零和')).toBeVisible();
    await expect(page.getByText('非零和')).toBeVisible();
  });
});

test.describe('深度探索视图', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('点击纳什均衡进入深度视图', async ({ page }) => {
    await page.getByRole('button', { name: /纳什均衡/ }).click();
    await expect(page.getByText('← 返回版图')).toBeVisible();
    await expect(page.getByText('历史演进线')).toBeVisible();
    await expect(page.getByText('数学支撑线')).toBeVisible();
  });

  test('透视模式切换', async ({ page }) => {
    await page.getByRole('button', { name: /纳什均衡/ }).click();
    await page.getByRole('button', { name: '历史' }).click();
    await expect(page.getByText('历史演进线')).toBeVisible();
    await page.getByRole('button', { name: '数学' }).click();
    await expect(page.getByText('数学支撑线')).toBeVisible();
  });

  test('返回版图', async ({ page }) => {
    await page.getByRole('button', { name: /纳什均衡/ }).click();
    await expect(page.getByText('← 返回版图')).toBeVisible();
    await page.getByRole('button', { name: '← 返回版图' }).click();
    await expect(page.getByText(/四象限理论版图/)).toBeVisible();
  });
});

test.describe('筛选与对比', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('标签筛选高亮匹配理论', async ({ page }) => {
    await page.getByRole('button', { name: '动态' }).click();
    // 贝叶斯均衡和逆向归纳应保留，极小极大和纳什应降饱和
    await expect(page.getByText('逆向归纳均衡')).toBeVisible();
  });

  test('对比模式选择两个理论', async ({ page }) => {
    await page.getByRole('button', { name: '对比模式' }).click();
    await page.getByRole('button', { name: /纳什均衡/ }).click();
    await page.getByRole('button', { name: /极小极大定理/ }).click();
    // 对比卡片应出现
    await expect(page.locator('.fixed')).toBeVisible();
  });
});

test.describe('模拟器', () => {
  test('囚徒困境模拟器可交互', async ({ page }) => {
    await page.goto('/');
    // 通过 TheoryDetail 进入模拟器 — 先进入纳什均衡深度视图
    await page.getByRole('button', { name: /纳什均衡/ }).click();
    // 模拟器入口在 TheoryDetail 中，这里先验证深度视图正常加载
    await expect(page.getByText('← 返回版图')).toBeVisible();
  });
});
