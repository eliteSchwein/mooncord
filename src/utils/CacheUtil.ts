const cacheData:any = {}

export function setData(key:string, value:any) {
    cacheData[key] = value
}

export function getEntry(key:string) {
    return cacheData[key]
}

export const dump = cacheData