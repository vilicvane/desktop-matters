import {randomInt} from 'crypto';
import {setTimeout} from 'timers/promises';

import '@project-chip/matter-node.js';

import {StorageBackendDisk} from '@project-chip/matter-node.js/storage';
import {hasParameter} from '@project-chip/matter-node.js/util';
import {MatterServer} from '@project-chip/matter.js';
import {Level, Logger} from '@project-chip/matter.js/log';
import {StorageManager} from '@project-chip/matter.js/storage';
import {SIGNAL, main} from 'main-function';

import {DesktopNode, generatePassCode} from '../library';

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

  const desktopDeviceContext = storageManager.createContext('desktop-device');

  const passcode = desktopDeviceContext.get('passcode', generatePassCode());
  const discriminator = desktopDeviceContext.get(
    'discriminator',
    randomInt(0, 0xfff + 1),
  );
  const serialNumber = desktopDeviceContext.get(
    'serialNumber',
    `desktop-${randomInt(0, 10 ** 8)
      .toString()
      .padStart(8, '0')}`,
  );

  if (
    !desktopDeviceContext.has('passcode') ||
    !desktopDeviceContext.has('discriminator') ||
    !desktopDeviceContext.has('serialNumber')
  ) {
    desktopDeviceContext.set('passcode', passcode);
    desktopDeviceContext.set('discriminator', discriminator);
    desktopDeviceContext.set('serialNumber', serialNumber);
  }

  const windowsDeviceNode = new DesktopNode({
    passcode,
    discriminator,
    serialNumber,
  });

  await windowsDeviceNode.addToMatterServer(matterServer);

  windowsDeviceNode.commissioningServer.addCommandHandler(
    'testEventTrigger',
    () => {},
  );

  await matterServer.start();

  windowsDeviceNode.printPairingCodeIfNotPaired();

  await SIGNAL('SIGINT');

  await matterServer.close();

  await storageManager.close();
});
