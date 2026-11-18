import { createApp, h, nextTick, ref, Suspense } from 'vue';
import { createI18n, useI18n } from 'vue-i18n';

// Mounts a Suspense branch whose async child uses a local useI18n scope, replaces the branch
// before setup resolves, and returns the size of the i18n instance registry before and after.
export async function runRepro(container) {
  const i18n = createI18n({ legacy: false, locale: 'en' });
  const showPending = ref(true);
  let resolvePending;
  const pending = new Promise(resolve => {
    resolvePending = resolve;
  });

  const Child = {
    name: 'PendingChild',
    // What an SFC <i18n> block compiles to.
    __i18n: [{ locale: 'en', resource: { label: 'Local message' } }],
    async setup() {
      const { t } = useI18n({ useScope: 'local' });
      await pending;
      return () => h('p', t('label'));
    },
  };

  const app = createApp({
    setup: () => () =>
      h(Suspense, null, {
        default: () => (showPending.value ? h(Child) : h('p', 'Replacement')),
        fallback: () => h('p', 'Loading'),
      }),
  });
  app.use(i18n);

  const before = i18n.__instances.size;
  app.mount(container);
  await nextTick();
  const whilePending = i18n.__instances.size;

  showPending.value = false;
  await nextTick();
  resolvePending();
  await new Promise(resolve => setTimeout(resolve, 0));
  const afterDiscard = i18n.__instances.size;

  app.unmount();
  return { before, whilePending, afterDiscard };
}
