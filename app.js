if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service.js').then(function(registration) {
            console.log('service worker registered');
        }).catch(function(error) {
            console.log('service worker registration failed: ', error);
        });
    });
}

var canvas;
var gl;

var mat;
var shd;
var gfx;
var drw;
var imp;

var lens;

var viewPointX = [1];
var viewPointY = [1];
var viewPointZ = [1];

var mapW = 20;
var mapH = 4;
var mapL = 20;
var map  = [];

function map_empty(x, y, z)
{
    if (x < 0 || x >= mapW || z < 0 || z >= mapL || y < 0) return false;
    if (y >= mapH) return true;
    
    if (map[x][y][z] === 0) return true;
    
    return false;
}

function app()
{
    canvas = document.getElementById('win');
    canvas.width  = 16 * 47;
    canvas.height = 9 * 47;
    
    gl = canvas.getContext("webgl");
    
    mat = new matrix();
    shd = new shader();
    gfx = new graphic();
    drw = new draw();
    imp = new input(canvas);
    
    lens = new camera();
    edit = new editor();
    hero = new you();
    doot = new skele();
    entities = [hero, doot];
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.DEPTH_TEST);
    
    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    
    mat.perspective(gfx.perspective, 60, 0.01, 100.0, canvas.width / canvas.height);
    mat.orthographic(gfx.orthographic, 0, canvas.width, 0, canvas.height, 0, 1);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    
    shd.add(gl, 'pre-color'      , 'pre-color.v'  , 'pre-color.f');
    shd.add(gl, 'pre-texture'    , 'pre-texture.v', 'pre-texture.f');
    shd.add(gl, 'pre-point-light', 'pre-light.v'  , 'pre-point-light.f');
    
    shd.image(gl, 'bookshelf' , IMAGE_BOOKSHELF , gl.CLAMP_TO_EDGE);
    shd.image(gl, 'grass'     , IMAGE_GRASS     , gl.CLAMP_TO_EDGE);
    shd.image(gl, 'leaves'    , IMAGE_LEAVES    , gl.CLAMP_TO_EDGE);
    shd.image(gl, 'plank'     , IMAGE_PLANK     , gl.CLAMP_TO_EDGE);
    shd.image(gl, 'stonebrick', IMAGE_STONEBRICK, gl.CLAMP_TO_EDGE);
    shd.image(gl, 'tree'      , IMAGE_TREE      , gl.CLAMP_TO_EDGE);
    shd.image(gl, 'sky'       , IMAGE_SKY       , gl.REPEAT);
    shd.image(gl, 'you'       , IMAGE_YOU       , gl.CLAMP_TO_EDGE);
    shd.image(gl, 'dialogue'  , IMAGE_DIALOGUE  , gl.CLAMP_TO_EDGE);
    
    edit.x = mapW - 1;
    edit.y = 2;
    edit.z = mapL - 1;
    
    hero.x = 2;
    hero.y = 1;
    hero.z = 2;
    
    doot.x = 14;
    doot.y = 1;
    doot.z = 2;
    
    for (var x = 0; x < mapW; x++)
    {
        map[x] = new Array();
        for (var y = 0; y < mapH; y++)
        {
            map[x][y] = new Array();
            for (var z = 0; z < mapL; z++)
            {
                if (y === 0)
                {
                    if (x === 10) map[x][y][z] = 2;
                    else map[x][y][z] = 1;
                }
                else map[x][y][z] = 0;
            }
        }
    }
    
    loop();
}

function loop()
{
    step();
    render();
    
    setTimeout(loop, 1000 / 60);
}

function step()
{
    if (imp.is('q'))
    {
        imp.off('q');
        
        following = !following;
        if (!following) lens.set(mapW - 1, 2, mapL - 1, 0, 0, 0);
    }
    
    if (following)
    {
        if (imp.is('e'))
        {
            imp.off('e');
            examining = !examining;
        }
        
        hero.tick(imp);
        doot.tick();
        
        var closestID = 0;
        var closeDist = Number.MAX_VALUE;
        for (var i = 0; i < viewPointX.length; i++)
        {
            var dist = (hero.x - viewPointX[i] - 0.5) * (hero.x - viewPointX[i] - 0.5) + (hero.z - viewPointZ[i] - 0.5) * (hero.z - viewPointZ[i] - 0.5);
            
            if (dist < closeDist)
            {
                closestID = i;
                closeDist = dist;
            }
        }
        
        lens.set(viewPointX[closestID] + 0.5, viewPointY[closestID] + 0.5, viewPointZ[closestID] + 0.5, 0, 0, 0);
        lens.lookAt(hero.x, hero.y + 1, hero.z);
    }
    else
    {
        edit.tick(imp);
        
        var gridX = Math.floor(edit.x);
        var gridY = Math.floor(edit.y);
        var gridZ = Math.floor(edit.z);
        
        if (gridY >= 0 && gridX >= 0 && gridX < mapW && gridZ >= 0 && gridX < mapL)
        {
            while (gridY < mapH && map[gridX][gridY][gridZ] > 0)
            {
                gridY++;
            }
            
            edit.y = gridY;
            edit.dy = 0;
        }
        
        lens.set(edit.x, edit.y + edit.height, edit.z, edit.rx, edit.ry, 0);
        
        var step = 0.1;
        var lim = 4 / step;
        var iterations = 4;
        
        var rayX = lens.x;
        var rayY = lens.y;
        var rayZ = lens.z;
        var ray0 = lens.pitch * 0.017453292519943;
        var ray1 = lens.yaw   * 0.017453292519943;
        var side = 0;
        
        edit.useX = Number.MAX_VALUE;
        
        for (var i = 0; i < lim; i++)
        {
            rayX += Math.sin(ray1) * step;
            rayY -= Math.sin(ray0) * step;
            rayZ -= Math.cos(ray1) * step;
            
            var cellX = Math.floor(rayX);
            var cellY = Math.floor(rayY);
            var cellZ = Math.floor(rayZ);
            
            if (cellX < 0 || cellX >= mapW) continue;
            if (cellY < 0 || cellY >= mapH) continue;
            if (cellZ < 0 || cellZ >= mapL) continue;
            
            if (map[cellX][cellY][cellZ] > 0)
            {
                if (iterations > 1)
                {
                    iterations--;
                    i = i - 2;
                    
                    rayX -= Math.sin(ray1) * step;
                    rayY += Math.sin(ray0) * step;
                    rayZ += Math.cos(ray1) * step;
                    
                    step *= 0.5;
                }
                else
                {
                    edit.useX = cellX;
                    edit.useY = cellY;
                    edit.useZ = cellZ;
                    
                    var dx = rayX - cellX;
                    var dy = rayY - cellY;
                    var dz = rayZ - cellZ;
                    
                    var min = dx;
                    var minID = 0;
                    if (min > dy) {min = dy; minID = 1;}
                    if (min > dz) {min = dz; minID = 2;}
                    
                    var max = dx;
                    var maxID = 0;
                    if (max < dy) {max = dy; maxID = 1;}
                    if (max < dz) {max = dz; maxID = 2;}
                    
                    if (min < 1.0 - max)
                    {
                        if (minID === 0) side = 1;
                        else if (minID === 1) side = 3;
                        else if (minID === 2) side = 5;
                    }
                    else
                    {
                        if (maxID === 0) side = 0;
                        else if (maxID === 1) side = 2;
                        else if (maxID === 2) side = 4;
                    }
                    
                    break;
                }
            }
        }
        
        if ((imp.click(0) || imp.is('space')) && edit.useX !== Number.MAX_VALUE)
        {
            imp.clicked(0);
            imp.off('space');
            
            var dx = 0;
            var dy = 0;
            var dz = 0;
            
            switch (side)
            {
                case 0: dx =  1; break; // right
                case 1: dx = -1; break; // left
                case 2: dy =  1; break; // top
                case 3: dy = -1; break; // bottom
                case 4: dz =  1; break; // back
                case 5: dz = -1; break; // front
            }
            
            edit.useX += dx;
            edit.useY += dy;
            edit.useZ += dz;
            
            if (edit.useX >= 0 && edit.useX < mapW && edit.useY >= 0 && edit.useY < mapH && edit.useZ >= 0 && edit.useZ < mapL)
            {
                map[edit.useX][edit.useY][edit.useZ] = edit.paint;
                
                if (edit.paint === 4)
                {
                    viewPointX.push(edit.useX);
                    viewPointY.push(edit.useY);
                    viewPointZ.push(edit.useZ);
                }
            }
        }
        else if (imp.click(1) && edit.useX !== Number.MAX_VALUE)
        {
            imp.clicked(1);
            
            if (map[edit.useX][edit.useY][edit.useZ] === 4)
            {
                for (var i = 0; i < viewPointX.length; i++)
                {
                    if (viewPointX[i] === edit.useX && viewPointY[i] === edit.useY && viewPointZ[i] === edit.useZ)
                    {
                        viewPointX.splice(i, 1);
                        viewPointY.splice(i, 1);
                        viewPointZ.splice(i, 1);
                        break;
                    }
                }
            }
            
            map[edit.useX][edit.useY][edit.useZ] = 0;
        }
    }
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    shd.set(gl, 'pre-texture');
    
    gfx.useOrthographic(mat, 0, 0);
    gfx.load(gl, shd);
    gfx.start();
    var turn = canvas.width * 2;
    var sky = lens.yaw / 360.0 * turn;
    while (sky < 0) sky += turn;
    while (sky >= turn) sky -= turn;
    drw.rectangle(gfx, -sky, canvas.height - 512, turn * 2, 512, 1, 1, 1, 1, 1, 0, 0, 2, 1);
    shd.texture0(gl, 'sky');
    gfx.draw(gl);
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    
    gfx.usePerspective(mat, -lens.x, -lens.y, -lens.z, lens.pitch, lens.yaw, lens.roll);    
    gfx.load(gl, shd);
    
    var cubeimages = new Array(4);
    cubeimages[0] = 'grass';
    cubeimages[1] = 'plank';
    cubeimages[2] = 'stonebrick';
    cubeimages[3] = 'bookshelf';
    
    var cubelist = new Array(4);
    cubelist[0] = new Array();
    cubelist[1] = new Array();
    cubelist[2] = new Array();
    cubelist[3] = new Array();
    
    for (var y = 0; y < mapH; y++)
    {
        for (var x = 0; x < mapW; x++)
        {
            for (var z = 0; z < mapL; z++)
            {
                var cell = map[x][y][z];
                
                if (cell === 0) continue;
                
                cubelist[cell - 1].push({x:x, y:y, z:z});
            }
        }
    }
    
    for (var i = 0; i < 4; i++)
    {
        gfx.start();
        
        var list = cubelist[i];
        if (list.length > 0)
        {
            for (var j = 0; j < list.length; j++)
            {
                var loc = list[j];
                drw.cube(gfx, loc.x, loc.y, loc.z, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1);
            }
            
            shd.texture0(gl, cubeimages[i]);
            gfx.draw(gl);
        }
    }
    
    gfx.start();
    drw.body(gfx, hero.x, hero.y, hero.z, -hero.ry * 0.017453292519943, hero.walk, 0, -hero.ry * 0.017453292519943);
    drw.body(gfx, doot.x, doot.y, doot.z, -doot.ry * 0.017453292519943, doot.walk, -doot.head_rx * 0.017453292519943, -doot.head_ry * 0.017453292519943);
    shd.texture0(gl, 'you');
    gfx.draw(gl);
    
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    
    shd.set(gl, 'pre-texture');
    gfx.useOrthographic(mat, 0, 0);
    gfx.load(gl, shd);
    gfx.start();
    drw.rectangle(gfx, 10.0, 10.0, 20.0, 20.0, 1, 1, 1, 1, 1, 0, 0, 1, 1);
    switch (edit.paint)
    {
        case 1: shd.texture0(gl, 'grass'); break;
        case 2: shd.texture0(gl, 'plank'); break;
        case 3: shd.texture0(gl, 'stonebrick'); break;
        case 4: shd.texture0(gl, 'bookshelf'); break;
    }
    gfx.draw(gl);
    
    if (examining)
    {
        gfx.start();
        var cent = canvas.width / 2;
        var diaW = canvas.width / 2;
        var diaH = canvas.height / 4;
        var staX = cent - diaW / 2;
        var staY = 32;
        var diaS = 10;
        
        drw.rectangle(gfx, staX       , staY + diaH, diaS       , diaS       , 1, 1, 1, 1, 5.0/16.0, 0, 0, 1, 1);
        drw.rectangle(gfx, staX + diaS, staY + diaH, diaW - diaS, diaS       , 1, 1, 1, 1, 5.0/16.0, 1, 0, 2, 1);
        drw.rectangle(gfx, staX + diaW, staY + diaH, diaS       , diaS       , 1, 1, 1, 1, 5.0/16.0, 2, 0, 3, 1);
        
        drw.rectangle(gfx, staX       , staY + diaS, diaS       , diaH - diaS, 1, 1, 1, 1, 5.0/16.0, 0, 1, 1, 2);
        drw.rectangle(gfx, staX + diaW, staY + diaS, diaS       , diaH - diaS, 1, 1, 1, 1, 5.0/16.0, 2, 1, 3, 2);
        
        drw.rectangle(gfx, staX       , staY       , diaS       , diaS       , 1, 1, 1, 1, 5.0/16.0, 0, 2, 1, 3);
        drw.rectangle(gfx, staX + diaS, staY       , diaW - diaS, diaS       , 1, 1, 1, 1, 5.0/16.0, 1, 2, 2, 3);
        drw.rectangle(gfx, staX + diaW, staY       , diaS       , diaS       , 1, 1, 1, 1, 5.0/16.0, 2, 2, 3, 3);
        shd.texture0(gl, 'dialogue');
        gfx.draw(gl);
    }
    
    shd.set(gl, 'pre-color');
    gfx.load(gl, shd);
    gfx.start();
    if (!following)
    {
        drw.rectangle(gfx, Math.floor(canvas.width / 2) - 4, Math.floor(canvas.height / 2), 9, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0);
        drw.rectangle(gfx, Math.floor(canvas.width / 2), Math.floor(canvas.height / 2) - 4, 1, 9, 1, 1, 1, 1, 0, 0, 0, 0, 0);
    }
    else if (examining) drw.rectangle(gfx, staX + diaS, staY + diaS, diaW - diaS, diaH - diaS, 0, 0, 0, 1, 0, 0, 0, 0, 0);
    gfx.draw(gl);
}