import {findValue, updateData} from "../utils/CacheUtil";
import * as bytes from "bytes";
import * as App from "../Application";

export class UsageHelper {
    protected moonrakerClient = App.getMoonrakerClient()

    protected lastCpuTime = 0

    public updateKlipperLoad() {
        const currentCpuTime = findValue('state.system_stats.cputime')
        const klipperLoad = ((currentCpuTime - this.lastCpuTime) * 100).toFixed(2)

        this.lastCpuTime = currentCpuTime

        if(Number(klipperLoad) === 0) { return }

        updateData('usage', {
            'klipper_load': klipperLoad
        })
    }

    public updateSystemLoad() {
        const coreCount = findValue('machine_info.system_info.cpu_info.cpu_count')
        const systemLoad = findValue('state.system_stats.sysload')

        const percent = ((systemLoad / coreCount) * 100).toFixed(2)

        updateData('usage', {
            'system_load': percent
        })
    }

    public updateMemoryUsage() {
        const totalMemoryRaw = bytes.parse(
            findValue('machine_info.system_info.cpu_info.total_memory') +
            findValue('machine_info.system_info.cpu_info.memory_units'))

        const freeMemoryRaw = findValue('state.system_stats.memavail')
        const usedMemoryRaw = (totalMemoryRaw * 1024) / freeMemoryRaw

        const totalMemory = (totalMemoryRaw / (1024 ** 3))
            .toFixed(2)

        const freeMemory = (freeMemoryRaw / (1024 ** 2))
            .toFixed(2)

        const usedMemory = (usedMemoryRaw / (1024 ** 2))
            .toFixed(2)

        updateData('usage', {
            'total_ram': totalMemory,
            'free_ram': freeMemory,
            'used_ram': usedMemory
        })
    }

    public async updateDiskUsage() {
        const directoryInformation = await this.moonrakerClient.send({"method": "server.files.get_directory"})

        const diskUsageRaw = directoryInformation.result.disk_usage

        if(typeof diskUsageRaw === 'undefined') { return }

        const totalDisk = (diskUsageRaw.total / (1024 ** 3))
            .toFixed(2)

        const freeDisk = (diskUsageRaw.free / (1024 ** 3))
            .toFixed(2)

        const usedDisk = (diskUsageRaw.used / (1024 ** 3))
            .toFixed(2)

        updateData('usage', {
            'total_disk': totalDisk,
            'used_disk': usedDisk,
            'free_disk': freeDisk
        })
    }
}