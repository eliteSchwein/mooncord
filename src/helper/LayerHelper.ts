import {getEntry, updateData} from "../utils/CacheUtil"


export function updateLayers() {
    const stateCache = getEntry('state')
    const metaDataCache = getEntry('meta_data')

    if (metaDataCache === undefined) {
        return
    }

    let top_layer = Math.ceil((metaDataCache.object_height - metaDataCache.first_layer_height) / metaDataCache.layer_height + 1)
    top_layer = top_layer > 0 ? top_layer : 0

    let current_layer = Math.ceil((stateCache.gcode_move.gcode_position[2] - metaDataCache.first_layer_height) / metaDataCache.layer_height + 1)
    current_layer = (current_layer <= top_layer) ? current_layer : top_layer
    current_layer = current_layer > 0 ? current_layer : 0

    updateData('layers', {
        'top': top_layer,
        'current': current_layer
    })
}