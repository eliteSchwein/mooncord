import BaseGraph from "./BaseGraph";

export default class PageListGraph extends BaseGraph {
    filename = 'pageGraph.png'

    public async renderGraph(graphData: any) {
        console.log(graphData)

        return await this.convertSvg('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>')
    }
}