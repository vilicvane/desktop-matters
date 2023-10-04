#!/usr/bin/env node

import {setTimeout} from 'timers/promises';

import '@project-chip/matter-node.js';

import {StorageBackendDisk} from '@project-chip/matter-node.js/storage';
import {hasParameter} from '@project-chip/matter-node.js/util';
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

Logger.defaultLogLevel = Level.INFO;

main(async () => {
  const toClearStorage = hasParameter('clearstorage');

  if (toClearStorage) {
    console.info('Will clear storage in 3 seconds...');
    await setTimeout(3000);
  }

  const storage = new StorageBackendDisk('.storage', toClearStorage);

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

  const run = await StartupRun.create('desktop-matters');

  if (hasParameter('disableautostart')) {
    await run.disable();
  } else if (hasParameter('autostart')) {
    await run.enable();
  }

  await SIGNAL('SIGINT');

  await matterServer.close();

  await storageManager.close();
});
