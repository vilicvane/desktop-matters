import {
  OnOffCluster,
  createDefaultGroupsClusterServer,
  createDefaultIdentifyClusterServer,
  createDefaultOnOffClusterServer,
  createDefaultScenesClusterServer,
} from '@project-chip/matter.js/cluster';
import {Device, DeviceTypes} from '@project-chip/matter.js/device';
import {isLocked, lock} from 'lock-your-windows';

const LOCKED_CHECKING_INTERVAL = 1000;

export class WindowsDevice extends Device {
  private lockedCheckingTimer: NodeJS.Timeout | undefined;

  constructor() {
    super(DeviceTypes.ON_OFF_LIGHT);

    this.addClusterServer(
      createDefaultIdentifyClusterServer({
        identify() {},
      }),
    );

    this.addClusterServer(createDefaultGroupsClusterServer());

    this.addClusterServer(createDefaultScenesClusterServer());

    this.addClusterServer(createDefaultOnOffClusterServer(this.commandHandler));

    this.getClusterServer(OnOffCluster)!.subscribeOnOffAttribute(
      this.onOnOffChange,
    );

    this.scheduleLockedChecking();
  }

  private onOnOffChange = (on: boolean): void => {
    if (!on && !isLocked()) {
      lock();
    }

    this.scheduleLockedChecking();
  };

  private scheduleLockedChecking(): void {
    if (this.lockedCheckingTimer !== undefined) {
      clearTimeout(this.lockedCheckingTimer);
    }

    this.lockedCheckingTimer = setTimeout(() => {
      const on = !isLocked();

      const server = this.getClusterServer(OnOffCluster)!;

      if (server.getOnOffAttribute() !== on) {
        server.setOnOffAttribute(on);
      }

      this.scheduleLockedChecking();
    }, LOCKED_CHECKING_INTERVAL);
  }
}
