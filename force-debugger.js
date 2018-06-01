var view = d3.select('#view');

const FADEIN=.25, HOLD=.5, FADEOUT=.2, MOVE=.25;
const PADDING=20, FMAG=1000;
const durations = {
    init: 2000,
    force: 10000
};
var _nodes = {};
function edged(e) {
    return 'M' + _nodes[e.source].x + ',' + _nodes[e.source].y + ' L' + _nodes[e.target].x + ',' + _nodes[e.target].y;
}

function do_step(data, i) {
    if(i >= data.length)
        return;
    var step = data[i], T = durations[step.type];

    step.nodes.forEach(function(n) {
        _nodes[n.id] = n;
    });
    var bounds = Object.keys(_nodes).reduce(function(bounds, k) {
        var n = _nodes[k];
        if(!bounds)
            return {left: n.x, top: n.y, right: n.x, bottom: n.y};
        bounds.left = Math.min(bounds.left, n.x);
        bounds.top = Math.min(bounds.top, n.y);
        bounds.right = Math.max(bounds.right, n.x);
        bounds.bottom = Math.max(bounds.bottom, n.y);
        return bounds;
    }, null);
    view.attr('viewBox', [
        bounds.left-PADDING, bounds.top-PADDING,
        bounds.right-bounds.left+2*PADDING, bounds.bottom-bounds.top+2*PADDING
    ].join(','));

    var node = view.selectAll('circle.node').data(step.nodes, n=>n.id);
    var nodeEnter = node.enter().append('circle')
        .attr('class', 'node')
        .attr('cx', n=>n.x)
        .attr('cy', n=>n.y)
        .attr('fill', 'black')
        .attr('r', 5)
        .attr('opacity', 0);
    nodeEnter.append('title').text(n=>n.id);
    nodeEnter.transition('fade').duration(T*FADEIN)
        .attr('opacity', 1);
    node = nodeEnter.merge(node);
    node.transition().duration(T*MOVE)
        .attr('cx', n=>n.x)
        .attr('cy', n=>n.y);

    var edge = view.selectAll('path.edge').data(step.edges, e=>[e.source,e.target].join('->'));
    var edgeEnter = edge.enter().append('path')
        .attr('class', 'edge')
        .attr('d', edged)
        .attr('stroke', 'black')
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('stroke-width', "1px")
        .attr('opacity', 0);
    edgeEnter.transition('fade').duration(T*FADEIN)
        .attr('opacity', 1);
    edge = edgeEnter.merge(edge);
    edge.transition('move').duration(T*MOVE)
        .attr('d', edged);

    d3.timeout(function() {
        do_step(data, i+1);
    }, durations[step.type]);
}
function read_data(text) {
    try {
        var data = JSON.parse(text);
        do_step(data, 0);
    }
    catch(x) {
        console.log('bad json');
    }
}

d3.select('#paste').on('keyup', function() {
    read_data(this.value);
});
