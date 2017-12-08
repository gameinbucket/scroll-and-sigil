var keys = new Array(256);
var mouse = [false, false];
var movement = [0, 0];
var map = [];

function input(c)
{
    map['one'] = 49;
    map['two'] = 50;
    map['three'] = 51;
    map['four'] = 52;
    
    map['w'] = 87;
    map['a'] = 65;
    map['s'] = 83;
    map['d'] = 68;
    map['q'] = 81;
    map['e'] = 69;
    
    map['space'] = 32;
    map['up'] = 38;
    map['down'] = 40;
    map['left'] = 37;
    map['right'] = 39;
    
    document.onkeyup = this.keyUp;
    document.onkeydown = this.keyDown;
    document.onmouseup = this.mouseUp;
    document.onmousedown = this.mouseDown;
}

input.prototype.is = function(c)
{
    return keys[map[c]];
};

input.prototype.off = function(c)
{
    keys[map[c]] = false;
};

input.prototype.click = function(c)
{
    return mouse[c];
};

input.prototype.movementX = function()
{
    return movement[0];
};

input.prototype.movementY = function()
{
    return movement[1];
};

input.prototype.moved = function()
{
    movement[0] = 0;
    movement[1] = 0;
};

input.prototype.clicked = function(c)
{
    mouse[c] = false;
};

input.prototype.keyUp = function(e)
{
    keys[e.keyCode] = false;
};

input.prototype.keyDown = function(e)
{
    keys[e.keyCode] = true;
};

input.prototype.mouseUp = function(e)
{
    if (e.button === 0) mouse[0] = false;
    else if (e.button === 2) mouse[1] = false;
};

input.prototype.mouseDown = function(e)
{
    if (e.button === 0) mouse[0] = true;
    else if (e.button === 2) mouse[1] = true;
};

input.prototype.mouseMove = function(e)
{
    movement[0] = e.movementX;
    movement[1] = e.movementY;
};