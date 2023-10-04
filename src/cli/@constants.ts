const TEXTS_EN = {
  'will clear storage in 3s':
    'Will clear storage in 3 seconds, press Ctrl+C to exit.',
};

const TEXTS_DICT: Record<string, typeof TEXTS_EN> = {
  zh: {
    'will clear storage in 3s': '将在 3 秒后清除存储，按 Ctrl+C 退出。',
  },
};

const LOCALE = Intl.DateTimeFormat().resolvedOptions().locale;
const LOCALE_FALLBACK = LOCALE.split('-')[0];

export const TEXTS =
  TEXTS_DICT[LOCALE] ?? TEXTS_DICT[LOCALE_FALLBACK] ?? TEXTS_EN;
