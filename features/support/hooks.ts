import { BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { TARGET_BASE_URL } from '../../src/screenplay/target.js';

setDefaultTimeout(30_000);

// Fail clearly and early if the target is not reachable, rather than letting each scenario fail with
// an opaque fetch error. The scenarios exploit a live container that `npm run bdd` boots for them.
BeforeAll(async function () {
  try {
    const res = await fetch(`${TARGET_BASE_URL}/`);
    if (!res.ok) throw new Error(`status ${res.status}`);
  } catch (err) {
    throw new Error(
      `Juice Shop target not reachable at ${TARGET_BASE_URL} (${(err as Error).message}). ` +
        'Start it with `npm run bdd` (which boots the pinned container), or set JUICE_SHOP_URL.',
    );
  }
});
