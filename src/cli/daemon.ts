#!/usr/bin/env node

import {spawn} from 'child_process';
import {join} from 'path';
import {setTimeout} from 'timers/promises';

import main, {SIGNAL} from 'main-function';

const RESPAWN_DELAY = 1000;

main(async () => {
  const child = (async () => {
    while (true) {
      console.info('starting...');

      const cp = spawn(process.execPath, [join(__dirname, 'main.js')]);

      console.info('started.');

      const code = await new Promise<number>(resolve => cp.on('exit', resolve));

      console.info(`exited with code 0x${code.toString(16)}.`);

      await setTimeout(RESPAWN_DELAY);
    }
  })();

  await Promise.race([child, SIGNAL('SIGINT')]);
});
