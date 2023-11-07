import type {MatterServer} from '@project-chip/matter.js';
import {CommissioningServer} from '@project-chip/matter.js';
import {Aggregator, DeviceTypes} from '@project-chip/matter.js/device';

import {PRODUCT_NAME, TEXTS, VENDOR_ID, VENDOR_NAME} from './@constants.js';
import {WindowsScreen} from './windows-screen.js';

export type DesktopNodeOptions = {
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
};

export class DesktopNode {
  readonly aggregator: Aggregator;

  readonly commissioningServer: CommissioningServer;

  constructor({
    name = TEXTS['Desktop'],
    productId = 0x0001,
    passcode,
    discriminator,
    serialNumber,
    port = 5540,
  }: DesktopNodeOptions) {
    const aggregator = new Aggregator();

    const screen = new WindowsScreen();

    aggregator.addBridgedDevice(screen, {
      nodeLabel: TEXTS['Screen'],
      productName: PRODUCT_NAME,
      vendorName: VENDOR_NAME,
      vendorId: VENDOR_ID,
      serialNumber: `${serialNumber}-screen`,
      reachable: true,
    });

    const commissioningServer = new CommissioningServer({
      port,
      deviceName: name,
      deviceType: DeviceTypes.AGGREGATOR.code,
      passcode,
      discriminator,
      basicInformation: {
        vendorName: VENDOR_NAME,
        vendorId: VENDOR_ID,
        productName: PRODUCT_NAME,
        productId,
        serialNumber,
      },
    });

    commissioningServer.addDevice(aggregator);

    this.aggregator = aggregator;
    this.commissioningServer = commissioningServer;
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
