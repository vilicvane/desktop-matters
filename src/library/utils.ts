import {randomInt} from 'crypto';

export function generatePassCode(): number {
  return randomInt(1, 99999998 + 1);
}

export function generateDiscriminator(): number {
  return randomInt(0, 0xfff + 1);
}

export function generateSerialNumber(prefix: string): string {
  return `${prefix}-${randomInt(0, 10 ** 8)
    .toString()
    .padStart(8, '0')}`;
}
