import { defineConfig, devices } from '@playwright/test';

/**
 * E2E 설정.
 * - 테스트는 e2e/ 디렉터리의 *.spec.ts 만 수집 (Vitest 유닛 테스트와 분리)
 * - webServer가 vite(5173) + json-server(3001)를 자동 기동
 * - json-server는 실제 db.json이 아니라 e2e/db.seed.json을 복사한
 *   런타임 사본(e2e/db.runtime.json)을 사용 → 실제 데이터 오염 방지
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  // SLOWMO를 켜면 액션마다 지연이 쌓여 기본 30s 타임아웃을 넘기므로 넉넉히 늘린다.
  timeout: process.env.SLOWMO ? 120_000 : 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    // 동작을 눈으로 따라가고 싶을 때 SLOWMO(ms)로 각 액션 사이에 지연을 준다.
    // 기본 0 → 평소·CI 실행 속도에는 영향 없음. 예: SLOWMO=800 npm run test:e2e:headed
    launchOptions: { slowMo: Number(process.env.SLOWMO) || 0 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command:
        'cp e2e/db.seed.json e2e/db.runtime.json && json-server --watch e2e/db.runtime.json --port 3001',
      port: 3001,
      reuseExistingServer: !process.env.CI,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'vite',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});
