import type {MatterServer} from '@project-chip/matter.js';
import {CommissioningServer} from '@project-chip/matter.js';
import {DeviceTypeId} from '@project-chip/matter.js/datatype';

import {VENDOR_ID, VENDOR_NAME} from './@constants';
import {WindowsScreen} from './windows-screen';

export interface DesktopNodeOptions {
  name?: string;
  /**
   * 16 bits.
   */
  productId?: number;
  passcode: number;
  /**
   * 12 bits.
   */
  discriminator: number;
  serialNumber: string;
  port?: number;
}

export class DesktopNode {
  readonly device: WindowsScreen;

  readonly commissioningServer: CommissioningServer;

  constructor({
    name = 'Desktop',
    productId = 0x0001,
    passcode,
    discriminator,
    serialNumber,
    port = 5540,
  }: DesktopNodeOptions) {
    this.device = new WindowsScreen();

    this.commissioningServer = new CommissioningServer({
      port,
      deviceName: name,
      deviceType: DeviceTypeId(this.device.deviceType),
      passcode,
      discriminator,
      basicInformation: {
        vendorName: VENDOR_NAME,
        vendorId: VENDOR_ID,
        productName: 'Desktop',
        productId,
        serialNumber,
      },
    });

    this.commissioningServer.addDevice(this.device);
  }

  addToMatterServer(matterServer: MatterServer): void {
    matterServer.addCommissioningServer(this.commissioningServer);
  }

  printPairingCodeIfNotPaired(): void {
    if (!this.commissioningServer.isCommissioned()) {
      this.printPairingCode();
    }
  }

  private printPairingCode(): void {
    const {qrCode, manualPairingCode} = this.commissioningServer.getPairingCode(
      {
        ble: false,
        onIpNetwork: true,
        softAccessPoint: false,
      },
    );

    console.info(qrCode);
    console.info(`Manual pairing code: ${manualPairingCode}`);
  }
}
