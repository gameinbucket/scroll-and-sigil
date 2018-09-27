var APP_STATE_NONE = 0;
var APP_STATE_LINE = 1;
var APP_STATE_CIRCLE = 2;
var APP_STATE_DELETE = 3;

class App {
    constructor() {
        let canvas = document.getElementById('draw')
        let context = canvas.getContext('2d')
        context.translate(0.5, 0.5)

        let skeleton = new Skeleton()
        skeleton.points[0] = new Point(100, 100)

        this.canvas = canvas
        this.context = context
        this.skeleton = skeleton
        this.state = APP_STATE_NONE
        this.state_button = null

        this.resize()
    }
    resize() {
        let canvas = this.canvas
        let bound = canvas.getBoundingClientRect()
        canvas.width = window.innerWidth - bound.left
        canvas.height = window.innerHeight - bound.top
        canvas.style.width = '' + canvas.width + 'px'
        canvas.style.height = '' + canvas.height + 'px'
        this.render()
    }
    render() {
        let canvas = this.canvas
        let context = this.context

        context.fillStyle = 'rgb(100, 100, 100)'
        context.fillRect(0, 0, canvas.width, canvas.height)

        this.skeleton.render(context)
    }
    mouse_down(event) {
        let canvas = this.canvas
        let bound = canvas.getBoundingClientRect()
        let x = event.clientX - bound.left
        let y = event.clientY - bound.top

        if (x < 0 || y < 0 || x > canvas.width || y > canvas.height) {
            returnlk
        }

        console.log('zoink ' + x + ' ' + y)
    }
    action(value) {
        if (this.state_button !== null) {
            this.state_button.classList.remove('mode')
        }
        this.state_button = document.getElementById(value)
        this.state_button.className += ' mode'
        switch (value) {
            case 'line':
                this.state = APP_STATE_LINE
                break
            case 'circle':
                this.state = APP_STATE_CIRCLE
                break
            case 'delete':
                this.state = APP_STATE_DELETE
                break
        }
        this.render()
    }
}

const app = new App();

document.onmousedown = function (event) {
    app.mouse_down(event)
}

document.oncontextmenu = function () {
    return false
}

/*
var canvas;
var context;

var newFSM = 0;
var moveFSM = 1;
var editFSM = 2;

var state;
var stateElement;

var keyShift = false;
var keyZero = false;

var hoverPolygon = null;
var hoverVector = null;
var usingVector = null;
var usingPolygon = null;

var vectorRadius = 5.0;

function vector(x, y) {
    this.x = x;
    this.y = y;
};

function polygon() {
    this.vectors = [];
    this.color = 'black';
};

var mouseX;
var mouseY;

var offscreen;
var offcontext;
var dat;

var polygonList = [];

window.onload = function() {
    state = newFSM;
    stateElement = document.getElementById('new');
    stateElement.className += ' mode';

    canvas = document.getElementById('draw');
    context = canvas.getContext('2d');
    context.translate(0.5, 0.5);
    
    resize();
    // window.addEventListener('resize', resize, false);
    
    offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    offcontext = offscreen.getContext('2d');
    dat = offcontext.createImageData(offscreen.width, offscreen.height);

    
    document.onmousemove = mousemove;
    document.onmousedown = mousedown;
    document.onmouseup = mouseup;
    document.onkeydown = keydown;
    document.onkeyup = keyup;
    document.oncontextmenu = function() { return false; };
    
    draw();
};

function resize() {
    canvas.width = window.innerWidth - menuLeft;
    canvas.height = window.innerHeight;
    canvas.style.width = '' + canvas.width + 'px';
    canvas.style.height = '' + canvas.height + 'px';
    draw();
}

function draw() {
    context.fillStyle = 'rgb(250, 250, 250)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < polygonList.length; i++) {
        var p = polygonList[i];
        if (p.vectors.length === 0)
            continue;
        var v = p.vectors;
        if (p.vectors.length === 2) {
            context.strokeStyle = p.color;
            context.beginPath();
            context.moveTo(v[0].x, v[0].y);
            context.lineTo(v[1].x, v[1].y);
            context.stroke();
        }
        else {
            context.fillStyle = p.color;
            context.beginPath();
            context.moveTo(v[0].x, v[0].y);
            for (var j = 1; j < v.length; j++) {
                context.lineTo(v[j].x, v[j].y);
            }
            context.closePath();
            context.fill();
        }
        
        if (state === editFSM) {
            context.fillStyle = 'red';
            for (var j = 0; j < v.length; j++) {
                context.beginPath();
                context.arc(v[j].x, v[j].y, vectorRadius, 0, 2.0 * Math.PI, false);
                context.fill();
            }
        }
    }
}

function mousemove(m)  {
    var x = m.clientX - menuLeft;
    var y = m.clientY;
    
    var deltaX = x - mouseX;
    var deltaY = y - mouseY;
    
    mouseX = x;
    mouseY = y;
    
    if (x < 0) return;
    if (y < 0) return;
    if (x > canvas.width) return;
    if (y > canvas.height) return;
    
    if (state === moveFSM) {
        if (usingPolygon === null) {
            hoverPolygon = null;
            canvas.style.cursor = 'default';
            for (var i = 0; i < polygonList.length; i++) {
                var p = polygonList[i];
                if (hoverPolygon === null && polygonContains(p, x, y)) {
                    canvas.style.cursor = 'grab';
                    hoverPolygon = p;
                    break;
                }
            }
        } else {
            var v = usingPolygon.vectors;
            for (var i = 0; i < v.length; i++) {
                v[i].x += deltaX;
                v[i].y += deltaY;
            }
            draw();
        }
    } else if (state === editFSM) {
        if (usingVector === null) {
            hoverVector = null;
            canvas.style.cursor = 'default';
            polyloop:
            for (var i = 0; i < polygonList.length; i++) {
                var p = polygonList[i];
                if (p.vectors.length === 0)
                    continue;
                var v = p.vectors;
                for (var j = 0; j < v.length; j++) {
                    if (distanceToVector(v[j], x, y) < vectorRadius) {
                        canvas.style.cursor = 'grab';
                        hoverVector = v[j];
                        break polyloop;
                    }
                }
            }
        } else {
            usingVector.x += deltaX;
            usingVector.y += deltaY;
            draw();
        }
    } else if (state === newFSM && usingPolygon !== null) {
        var v = usingPolygon.vectors[usingPolygon.vectors.length - 1];
        if (keyShift) {
            var last = usingPolygon.vectors[usingPolygon.vectors.length - 2];
            var dX = Math.abs(last.x - x);
            var dY = Math.abs(last.y - y);
            if (dX > dY) {
                v.x = x;
                v.y = last.y;
            }
            else {
                v.x = last.x;
                v.y = y;
            }
        } else {
            v.x = x;
            v.y = y;
        }
        draw();
    }
}

function mousedown(m) {
    var button = m.which || m.button;
    
    if (button === 3) {
        if (state === newFSM && usingPolygon !== null) {
            if (usingPolygon.vectors.length <= 3) {
                polygonList.splice(polygonList.indexOf(usingPolygon), 1);
            }
            else {
                usingPolygon.vectors.splice(-1, 1);
            }
            usingPolygon = null;
            state = newFSM;
        }
    }
    else {
        var x = m.clientX - menuLeft;
        var y = m.clientY;
        
        if (x < 0) return;
        if (y < 0) return;
        if (x > canvas.width) return;
        if (y > canvas.height) return;
        
        if (state === moveFSM) {
            if (hoverPolygon !== null) {
                usingPolygon = hoverPolygon;
                canvas.style.cursor = 'grabbing';
            }
        } else if (state === editFSM) {
            if (hoverVector !== null) {
                usingVector = hoverVector;
                canvas.style.cursor = 'grabbing';
            }
        } else if (state === newFSM) {
            if (usingPolygon === null) {
                usingPolygon = new polygon();
                usingPolygon.vectors.push(new vector(x, y));
                polygonList.push(usingPolygon);
            }
            usingPolygon.vectors.push(new vector(x, y));
        }
    }
    draw();
}

function mouseup() {
    if (state === moveFSM) {
        usingPolygon = null;
        canvas.style.cursor = 'grab';
    } else if (state === editFSM) {
        usingVector = null;
        canvas.style.cursor = 'grab';
    }
}

function keydown(e) {
    switch (e.keyCode) {
        case 16: keyShift = true; break;
        case 48: keyZero = true; break;
    }
}

function keyup(e) {
    switch (e.keyCode) {
        case 16: keyShift = false; break;
        case 48: keyZero = false; break;
    }
}

function action(value) {
    stateElement.classList.remove('mode');
    stateElement = document.getElementById(value);
    stateElement.className += ' mode';
    usingPolygon = null;
    canvas.style.cursor = 'default';
    switch (value) {
        case 'new_line': state = newFSM; break;
        case 'new_circle': state = newFSM; break;
        case 'delete': state = newFSM; break;
    }
    draw();
}

function polygonContains(poly, x, y) {
    var odd = false;
    var v = poly.vectors;
    var j = v.length - 1;
    for (var i = 0; i < v.length; i++) {
        if ((v[i].y > y !== v[j].y > y) && (x < (v[j].x - v[i].x) * (y - v[i].y) / (v[j].y - v[i].y) + v[i].x)) {
            odd = !odd;
        }
        j = i;
    }
    return odd;
}

function distanceToVector(vector, x, y) {
    var dx = vector.x - x;
    var dy = vector.y - y;
    return Math.sqrt(dx * dx + dy * dy);
}
*/