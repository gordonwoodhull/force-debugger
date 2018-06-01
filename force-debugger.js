var view = d3.select('#view');

const FADEIN=250, PADDING=20;
function do_step(data, i) {
    if(i >= data.length)
        return;
    var step = data[i];
    var bounds = step.nodes.reduce(
    var node = view.selectAll('circle.node').data(graph.nodes, n=>n.id);
    node.enter().append('circle')
        .attr('cx', n=>n.x)
        .attr('cy', n=>n.y)
        .attr('fill', 'black')
        .attr('r', 5)
        .attr('opacity', 0)
      .transition().duration(FADEIN)
        .attr('opacity', 1);
    
    d3.timeout(function() {
        do_step(data, step+1);
    }, data[step].delay);
}
function read_data(text) {
    var data = JSON.parse(text);
    do_step(data, 0);
}

d3.select('#paste').on('keyup', function() {
    read_data(this.value);
});
