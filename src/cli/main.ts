import {randomInt} from 'crypto';
import {setTimeout} from 'timers/promises';

import '@project-chip/matter-node.js';

import {StorageBackendDisk} from '@project-chip/matter-node.js/storage';
import {hasParameter} from '@project-chip/matter-node.js/util';
import {MatterServer} from '@project-chip/matter.js';
import {Level, Logger} from '@project-chip/matter.js/log';
import {StorageManager} from '@project-chip/matter.js/storage';
import {SIGNAL, main} from 'main-function';

import {WindowsDeviceNode, generatePassCode} from '../library';

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

  const windowsDeviceContext = storageManager.createContext('windows-device');

  const passcode = windowsDeviceContext.get('passcode', generatePassCode());
  const discriminator = windowsDeviceContext.get(
    'discriminator',
    randomInt(0, 0xfff + 1),
  );
  const serialNumber = windowsDeviceContext.get(
    'serialNumber',
    `windows-device-${randomInt(0, 10 ** 8)
      .toString()
      .padStart(8, '0')}`,
  );

  if (
    !windowsDeviceContext.has('passcode') ||
    !windowsDeviceContext.has('discriminator') ||
    !windowsDeviceContext.has('serialNumber')
  ) {
    windowsDeviceContext.set('passcode', passcode);
    windowsDeviceContext.set('discriminator', discriminator);
    windowsDeviceContext.set('serialNumber', serialNumber);
  }

  const windowsDeviceNode = new WindowsDeviceNode({
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
