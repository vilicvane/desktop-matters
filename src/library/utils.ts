import {randomInt} from 'crypto';

export function generatePassCode(): number {
  return randomInt(1, 99999998 + 1);
}
