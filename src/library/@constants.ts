import {VendorId} from '@project-chip/matter.js/datatype';

const TEXTS_EN = {
  Screen: 'Screen',
  Desktop: 'Desktop',
  'will clear storage in 3s':
    'Will clear storage in 3 seconds, press Ctrl+C to exit.',
};

const TEXTS_DICT: Record<string, typeof TEXTS_EN> = {
  zh: {
    Screen: '屏幕',
    Desktop: '台式电脑',
    'will clear storage in 3s': '将在 3 秒后清除存储，按 Ctrl+C 退出。',
  },
};

const LOCALE = Intl.DateTimeFormat().resolvedOptions().locale;
const LOCALE_FALLBACK = LOCALE.split('-')[0];

export const TEXTS =
  TEXTS_DICT[LOCALE] ?? TEXTS_DICT[LOCALE_FALLBACK] ?? TEXTS_EN;

const PLATFORM_NAMES: {
  [platform in NodeJS.Platform]?: string;
} = {
  win32: 'Windows',
};

export const PRODUCT_NAME =
  PLATFORM_NAMES[process.platform] ?? process.platform;

export const VENDOR_NAME = 'vilicvane';
export const VENDOR_ID = VendorId(0xfff1);
