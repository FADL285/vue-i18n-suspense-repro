# vue-i18n v11: local composer stays registered when Suspense discards a pending branch

Minimal reproduction for vue-i18n 11.4.22 with Vue 3.5.44.

A component with a local i18n scope (an SFC `<i18n>` block, compiled to `__i18n`) calls `useI18n()` and then awaits in its async `setup()`. When the `<Suspense>` branch is replaced before `setup()` resolves, Vue stops the component's effect scope but drops the branch's post-render jobs, so the `onUnmounted` hook that calls `__deleteInstance` never runs. The component stays in `i18n.__instances`.

## Run

```sh
pnpm install
pnpm test   # fails: expected 1 to be +0 (afterDiscard)
pnpm dev    # the page prints { before, whilePending, afterDiscard }
```

Expected `afterDiscard: 0`. Actual `afterDiscard: 1`.

The code is in [`src/repro.js`](src/repro.js).

## Fix that makes the test pass

Register the deletion on the component's own effect scope right after `__setInstance` in the local branch of `useI18n` (tested by editing `dist/vue-i18n.node.mjs`):

```js
i18nInternal.__setInstance(instance, composer);
instance.scope.run(() => {
  onScopeDispose(() => i18nInternal.__deleteInstance(instance));
});
```

`master` (v12) already cleans up through `onScopeDispose` (#2357), but v12 needs Vue 3.6.
