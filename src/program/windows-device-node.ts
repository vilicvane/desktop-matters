import {randomInt} from 'crypto';

import type {MatterServer} from '@project-chip/matter.js';
import {CommissioningServer} from '@project-chip/matter.js';
import {DeviceTypeId} from '@project-chip/matter.js/datatype';

import {VENDOR_ID, VENDOR_NAME} from './@constants';
import {generatePassCode} from './@utils';
import {WindowsDevice} from './windows-device';

export interface WindowsDeviceNodeOptions {
  name?: string;
  /**
   * 16 bits.
   */
  productId?: number;
  passcode?: number;
  /**
   * 12 bits.
   */
  discriminator?: number;
  port?: number;
}

export class WindowsDeviceNode {
  readonly device: WindowsDevice;

  readonly commissioningServer: CommissioningServer;

  constructor({
    name = 'Windows Device',
    productId = 0x0001,
    passcode = generatePassCode(),
    discriminator = randomInt(1, 0xfff + 1),
    port = 5540,
  }: WindowsDeviceNodeOptions = {}) {
    this.device = new WindowsDevice(VENDOR_ID * 0x10000 + productId);

    this.commissioningServer = new CommissioningServer({
      port,
      deviceName: name,
      deviceType: DeviceTypeId(this.device.deviceType),
      passcode,
      discriminator,
      basicInformation: {
        vendorName: VENDOR_NAME,
        vendorId: VENDOR_ID,
        productName: 'Windows Device',
        productId,
      },
    });

    this.commissioningServer.addDevice(this.device);
  }

  addToMatterServer(matterServer: MatterServer): void {
    matterServer.addCommissioningServer(this.commissioningServer);

    if (!this.commissioningServer.isCommissioned()) {
      this.printPairingCode();
    }
  }

  private printPairingCode(): void {
    const {qrCode, manualPairingCode} =
      this.commissioningServer.getPairingCode();

    console.info(qrCode);
    console.info(`Manual pairing code: ${manualPairingCode}`);
  }
}
