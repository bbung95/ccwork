import { test, expect } from '@playwright/test';

/**
 * tag 기능 E2E — 실제 브라우저 + json-server를 통과하는 영속성 검증.
 *
 * 단위 테스트(useTags/TagInput/EditorTagChip/NoteEditor)가 이미 정규화·중복·
 * 10개 제한·렌더 분기·저장 payload(목킹)를 검증한다. 여기서는 그 규칙들을 다시
 * assert하지 않고, 단위 테스트가 못 하는 것 — 저장한 태그가 실제 서버에 남아
 * 새로고침 후에도 보이는가 — 를 사용자 여정으로 검증한다.
 */
test.describe('태그 — 저장 영속성 (E2E 고유 검증)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('새 노트에 붙인 태그가 저장 후 새로고침해도 유지된다', async ({ page }) => {
    const title = `e2e-tag-${Date.now()}`;

    // 여정: 새 노트 → 제목·태그 입력 → 저장
    await page.getByRole('button', { name: '새 노트' }).click();
    await page.getByPlaceholder('제목').fill(title);

    const tagInput = page.getByPlaceholder('태그 추가');
    await tagInput.fill('React'); // 정규화 규칙 자체는 단위 테스트가 검증 — 여기선 결과만 본다
    await tagInput.press('Enter');
    await tagInput.fill('typescript');
    await tagInput.press('Enter');

    await page.getByRole('button', { name: '저장' }).click();

    // 단위 테스트가 못 하는 검증: 새로고침 후에도 실제 서버에 남아있는가
    await page.reload();
    await page.getByText(title).click();

    const tagArea = page.getByTestId('tag-area');
    await expect(tagArea.getByText('react')).toBeVisible();
    await expect(tagArea.getByText('typescript')).toBeVisible();
  });

  test('태그를 제거하고 저장하면 제거가 서버에 반영된다', async ({ page }) => {
    const title = `e2e-tag-remove-${Date.now()}`;

    // 태그 2개를 붙여 새 노트 저장
    await page.getByRole('button', { name: '새 노트' }).click();
    await page.getByPlaceholder('제목').fill(title);
    const tagInput = page.getByPlaceholder('태그 추가');
    await tagInput.fill('keep');
    await tagInput.press('Enter');
    await tagInput.fill('drop');
    await tagInput.press('Enter');
    await page.getByRole('button', { name: '저장' }).click();

    // 저장 후 에디터는 빈 상태로 돌아가므로, 사이드바에서 노트를 다시 연다
    await page.getByText(title).click();

    // drop 태그 제거 후 재저장 → 제거가 서버에 반영되는지 확인
    await page.getByRole('button', { name: 'drop 삭제' }).click();
    await page.getByRole('button', { name: '저장' }).click();

    await page.reload();
    await page.getByText(title).click();

    await expect(page.getByTestId('tag-area').getByText('keep')).toBeVisible();
    await expect(page.getByText('drop')).toHaveCount(0);
  });
});

/**
 * US-9 — 저장하지 않고 다른 노트로 이동하면 태그 변경이 유실된다.
 *
 * 단위 테스트(NoteEditor)는 노트 전환 시 UI의 tags가 리셋되는지까지만(API 목킹)
 * 검증한다. E2E는 거기서 한 발 더 나아가, 미저장 태그가 실제 서버에 절대
 * 기록되지 않았는지를 새로고침으로 확인한다 — 이것이 E2E만 할 수 있는 검증이다.
 */
test.describe('태그 — 미저장 변경 (내비게이션)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('태그를 추가하고 저장하지 않은 채 다른 노트로 이동하면 추가가 유실되고 서버에도 남지 않는다', async ({
    page,
  }) => {
    const titleA = `e2e-tag-unsavedA-${Date.now()}`;
    const titleB = `e2e-tag-unsavedB-${Date.now()}`;

    // 노트 A: 태그 'permanent'를 붙여 저장
    await page.getByRole('button', { name: '새 노트' }).click();
    await page.getByPlaceholder('제목').fill(titleA);
    const tagInput = page.getByPlaceholder('태그 추가');
    await tagInput.fill('permanent');
    await tagInput.press('Enter');
    await page.getByRole('button', { name: '저장' }).click();

    // 노트 B: 전환 대상으로 빈 노트 하나 저장
    await page.getByRole('button', { name: '새 노트' }).click();
    await page.getByPlaceholder('제목').fill(titleB);
    await page.getByRole('button', { name: '저장' }).click();

    // 노트 A를 열어 'unsavedtemp'를 추가하되 저장하지 않는다
    await page.getByText(titleA).click();
    await tagInput.fill('unsavedtemp');
    await tagInput.press('Enter');
    await expect(page.getByTestId('tag-area').getByText('unsavedtemp')).toBeVisible();

    // 저장 없이 노트 B로 이동했다가 다시 A로 돌아온다 → 미저장 태그는 사라진다
    await page.getByText(titleB).click();
    await page.getByText(titleA).click();
    await expect(page.getByTestId('tag-area').getByText('permanent')).toBeVisible();
    await expect(page.getByText('unsavedtemp')).toHaveCount(0);

    // E2E 고유 검증: 미저장 태그는 서버에도 기록되지 않았다
    await page.reload();
    await page.getByText(titleA).click();
    await expect(page.getByTestId('tag-area').getByText('permanent')).toBeVisible();
    await expect(page.getByText('unsavedtemp')).toHaveCount(0);
  });
});
