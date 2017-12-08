/* if ('serviceWorker' in navigator)
{
    window.addEventListener('load', function()
    {
        navigator.serviceWorker.register('/service.js').then(function(registration)
        {
            console.log('service worker registered');
        }).catch(function(error)
        {
            console.log('service worker registration failed: ', error);
        });
    });
} */

function xhr(file, id, callback)
{
    var request = new XMLHttpRequest();
    request.open('GET', file);
    request.responseType = 'text';
    request.onreadystatechange = function()
    {
        if (request.readyState === 4 && request.status === 200)
        {
            callback(id, request.responseText);
        }
  }
  request.send(); 
}

var canvas;
var gl;

var shd;
var gfx;
var drw;
var imp;

(function()
{
    canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.marginLeft = 'auto';
    canvas.style.marginRight = 'auto';
    canvas.width  = 16 * 47;
    canvas.height = 9 * 47;
    
    gl = canvas.getContext("webgl");
    
    shd = new ShaderSystem();
    gfx = new RenderSystem();
    drw = new draw();
    imp = new input(canvas);
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.DEPTH_TEST);
    
    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    
    Matrix.Perspective(gfx.perspective, 60, 0.01, 100.0, canvas.width / canvas.height);
    Matrix.Orthographic(gfx.orthographic, 0, canvas.width, 0, canvas.height, 0, 1);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    
    shd.Add(gl, 'color', 'color.v', 'color.f');
    
    // shd.image(gl, 'bookshelf' , IMAGE_BOOKSHELF , gl.CLAMP_TO_EDGE);
    // shd.image(gl, 'sky'       , IMAGE_SKY       , gl.REPEAT);
    
    document.body.appendChild(canvas);
    wait();
})();

function wait()
{
    if (shd.off['color'] === undefined) {
        setTimeout(wait, 1000);
    } else {
        loop();
    }
}

function loop()
{
    update();
    render();
    setTimeout(loop, 1000 / 60);
}

function update()
{
    if (imp.is('q'))
    {
        imp.off('q');
    }
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    
    shd.Set(gl, 'color');
    
    gfx.UseOrthographic(0, 0);
    gfx.Load(gl, shd);
    gfx.Start();
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
}