#!/usr/bin/env node

import {setTimeout} from 'timers/promises';

import '@project-chip/matter-node.js';

import {StorageBackendDisk} from '@project-chip/matter-node.js/storage';
import {MatterServer} from '@project-chip/matter.js';
import {Level, Logger} from '@project-chip/matter.js/log';
import {StorageManager} from '@project-chip/matter.js/storage';
import main, {SIGNAL} from 'main-function';
import {StartupRun} from 'startup-run';

import {
  DesktopNode,
  generateDiscriminator,
  generatePassCode,
  generateSerialNumber,
} from '../library';

import {TEXTS} from './@constants';

Logger.defaultLogLevel = Level.INFO;

main(async args => {
  if (!StartupRun.daemonSpawned) {
    const run = await StartupRun.create('desktop-matters');

    if (args.includes('--auto-start')) {
      await run.enable();

      run.start();

      return;
    } else if (args.includes('--disable-auto-start')) {
      await run.disable();

      return;
    }
  }

  const toReset = args.includes('--reset');

  if (toReset) {
    console.info(TEXTS['will clear storage in 3s']);
    await setTimeout(3000);
  }

  const storage = new StorageBackendDisk('.desktop-matters', toReset);

  const storageManager = new StorageManager(storage);

  await storageManager.initialize();

  const matterServer = new MatterServer(storageManager);

  const desktopNodeContext = storageManager.createContext('desktop-node');

  const passcode = desktopNodeContext.get('passcode', generatePassCode());
  const discriminator = desktopNodeContext.get(
    'discriminator',
    generateDiscriminator(),
  );
  const serialNumber = desktopNodeContext.get(
    'serialNumber',
    generateSerialNumber('desktop'),
  );

  if (
    !desktopNodeContext.has('passcode') ||
    !desktopNodeContext.has('discriminator') ||
    !desktopNodeContext.has('serialNumber')
  ) {
    desktopNodeContext.set('passcode', passcode);
    desktopNodeContext.set('discriminator', discriminator);
    desktopNodeContext.set('serialNumber', serialNumber);
  }

  const desktopNode = new DesktopNode({
    passcode,
    discriminator,
    serialNumber,
  });

  await desktopNode.addToMatterServer(matterServer);

  await matterServer.start();

  desktopNode.printPairingCodeIfNotPaired();

  desktopNode.commissioningServer.updateStructure();

  await SIGNAL('SIGINT');

  await matterServer.close();

  await storageManager.close();
});
