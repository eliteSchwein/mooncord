import { getEntry, updateData } from "../utils/CacheUtil"

export function updateTimes() {
    const stateCache = getEntry('state')
    const metaDataCache = getEntry('meta_data')
    const endTime = Math.floor(Date.now() / 1000)

    const duration = stateCache.print_stats.print_duration

    let total = duration / stateCache.display_status.progress

    if (total === 0 ||
        isNaN(total) ||
        !isFinite(total)) {
        total = metaDataCache.estimated_time
    }
  
    const left = (total - duration) / stateCache.gcode_move.speed_factor || 1
    const end = endTime + (total - duration)

    updateData('time', {
        'total': total,
        'duration': duration,
        'left': left,
        'eta': end
    })
}