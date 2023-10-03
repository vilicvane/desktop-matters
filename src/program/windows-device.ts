import {ClusterServer, SwitchCluster} from '@project-chip/matter.js/cluster';
import {
  Device,
  DeviceClasses,
  DeviceTypeDefinition,
} from '@project-chip/matter.js/device';

export class WindowsDevice extends Device {
  constructor(code: number) {
    super(
      DeviceTypeDefinition({
        name: 'windowsdevice',
        code,
        deviceClass: DeviceClasses.Simple,
        revision: 1,
        requiredServerClusters: [SwitchCluster.id],
      }),
    );

    this.addClusterServer(
      ClusterServer(
        SwitchCluster.with('MomentarySwitch'),
        {},
        {},
        {
          initialPress: true,
        },
      ),
    );
  }
}
