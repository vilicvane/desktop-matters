#!/usr/bin/env node

import {setTimeout} from 'timers/promises';

import '@project-chip/matter-node.js';

import {StorageBackendDisk} from '@project-chip/matter-node.js/storage';
import {MatterServer} from '@project-chip/matter.js';
import {Level, Logger} from '@project-chip/matter.js/log';
import {StorageManager} from '@project-chip/matter.js/storage';
import {SIGNAL, main} from 'main-function';
import {StartupRun} from 'startup-run';

import {
  DesktopNode,
  generateDiscriminator,
  generatePassCode,
  generateSerialNumber,
} from '../library/index.js';

import {TEXTS} from './@constants.js';

Logger.defaultLogLevel = Level.INFO;

main(async args => {
  const run = StartupRun.create('desktop-matters');

  await run.setup({
    enable: args.includes('--startup'),
    disable: args.includes('--disable-startup'),
  });

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
