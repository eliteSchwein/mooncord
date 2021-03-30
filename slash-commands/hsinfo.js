const { SlashCommand } = require('slash-create');
const si = require('systeminformation')

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
            name: 'hsinfo',
            description: 'Get the current Hardware and Software Informations.',
            choices: [{
                name: 'cpu'
            }]
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        const cpu = await si.cpu()
        const ram = await si.mem()
        const os = await si.osInfo()
        const load = await si.currentLoad()
        const disks = await si.diskLayout()
        const partitions = await si.fsSize()

        ctx.defer(false)

        const cpufeedback = `${'**🧠 CPU:**\n' +
            '`Model: '}${cpu.brand} \`\n` +
            `\`Manufacturer: ${cpu.manufacturer} \`\n` +
            `\`${cpu.physicalCores} Cores | ${cpu.cores} Threads\`\n` +
            `\`${load.currentLoad.toFixed(2)}% Usage\``
        const ramfeedback = `${'**📟 RAM:**\n' +
            '`Total: '}${(ram.total / (1024 ** 3)).toFixed(2)}GB \`\n` +
            `\`Used: ${(ram.used / (1024 ** 3)).toFixed(2)}GB \`\n`
        const osfeedback = `${'**💻 OS:**\n' +
            '`Plattform: '}${os.platform} \`\n` +
            `\`Distro: ${os.distro} \`\n` +
            `\`Release: ${os.release} \`\n` +
            `\`Kernel: ${os.kernel} \`\n` +
            `\`Arch: ${os.arch} \`\n`
        let disksfeedback = ''
        for (const diskindex in disks) {
            const disk = disks[diskindex]
            if (!String(disk.device).includes('/dev/ram')) {
            disksfeedback = disksfeedback.concat(`**💾 DISK **(${disk.device})\n`)
            disksfeedback = disksfeedback.concat(`\`Type: ${disk.type}\`\n`)
            disksfeedback = disksfeedback.concat(`\`Modell: ${disk.name}\`\n`)
            disksfeedback = disksfeedback.concat(`\`Vendor: ${disk.vendor}\`\n`)
            disksfeedback = disksfeedback.concat(`\`Size: ${(disk.size / (1024 ** 3)).toFixed(2)}GB\`\n`)
            let partitionslist = ''
            let usage = 0
            for (const partitionindex in partitions) {
                const partition = partitions[partitionindex]
                if (String(partition.fs).startsWith(disk.device)) {
                partitionslist = partitionslist.concat(`${partition.mount} `)
                usage += partition.used
                }
                if (String(disk.device) === '/dev/mmcblk0' && os.distro.includes('Raspbian') && String(partition.fs).startsWith('/dev/root')) {
                partitionslist = partitionslist.concat(`${partition.mount} `)
                usage += partition.used
                }
            }
            disksfeedback = disksfeedback.concat(`\`Used: ${(usage / (1024 ** 3)).toFixed(2)}GB\`\n`)
            disksfeedback = disksfeedback.concat(`\`Parititions: ${partitionslist}\`\n\n`)
            }
        }
        return `${cpufeedback}\n\n${ramfeedback}\n${disksfeedback}${osfeedback}`;
    }
}