export default class SvgHelper {
    public calculateDonut(cx, cy, radius, strokeWidth, data) {
        const startAngle = -90

        const dataLength = data.length
        const arr = []

        let filled = 0
        let total = 0

        for (let i = 0; i < dataLength; i++) {
            total += data[i].value;
        }

        for (let i = 0; i < dataLength; i++) {
            const item = data[i]
            const fill = (100 / total) * item.value
            const dashArray = 2 * Math.PI * radius
            const dashOffset = dashArray - (dashArray * fill / 100)
            const angle = (filled * 360 / 100) + startAngle

            arr.push(`<circle r="${radius}" cx="${cx}" cy="${cy}" fill="transparent" stroke="${item.color}" stroke-width="${strokeWidth}" stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}" transform="rotate(${angle} ${cx} ${cy})"></circle>`)

            filled += fill
        }

        return arr;
    }
}