// @vitest-environment happy-dom
import { expect, it } from 'vitest';

import { runRepro } from './repro.js';

it('removes the local composer when Suspense discards the pending branch', async () => {
  const result = await runRepro(document.createElement('div'));

  expect(result.whilePending).toBe(1);
  expect(result.afterDiscard).toBe(0);
});
