import '@project-chip/matter-node.js';

import {StorageBackendDisk} from '@project-chip/matter-node.js/storage';
import {MatterServer} from '@project-chip/matter.js';
import {StorageManager} from '@project-chip/matter.js/storage';

import {WindowsDeviceNode} from '../library';

const storageManager = new StorageManager(new StorageBackendDisk('.storage'));

await storageManager.initialize();

const matterServer = new MatterServer(storageManager);

const windowsDeviceNode = new WindowsDeviceNode();

matterServer.addCommissioningServer(windowsDeviceNode.commissioningServer);

await matterServer.start();
