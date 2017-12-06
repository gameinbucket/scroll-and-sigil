function draw()
{
    this.temp = new Array((3 + 4 + 2) * 4);
    this.stride = (3 + 4 + 2);
}

draw.prototype.translate = function(vertices, x, y, z)
{
    for (var i = 0; i < vertices.length; i += this.stride)
    {
        vertices[i]     += x;
        vertices[i + 1] += y;
        vertices[i + 2] += z;
    }
};

draw.prototype.rotate_x = function(vertices, radian)
{
    var sin = Math.sin(radian);
    var cos = Math.cos(radian);
    
    for (var i = 0; i < vertices.length; i += this.stride)
    {
        var y = vertices[i + 1] * cos - vertices[i + 2] * sin;
        var z = vertices[i + 1] * sin + vertices[i + 2] * cos;
        
        vertices[i + 1] = y;
        vertices[i + 2] = z;
    }
};

draw.prototype.rotate_y = function(vertices, radian)
{
    var sin = Math.sin(radian);
    var cos = Math.cos(radian);
    
    for (var i = 0; i < vertices.length; i += this.stride)
    {
        var x = vertices[i]     * cos + vertices[i + 2] * sin;
        var z = vertices[i + 2] * cos - vertices[i]     * sin;
        
        vertices[i]     = x;
        vertices[i + 2] = z;
    }
};

draw.prototype.texture = function(vertices, scale, left, top, right, bottom)
{
    left   = scale * left;
    top    = scale * top;
    right  = scale * right;
    bottom = scale * bottom;
    
    vertices[7] = left;
    vertices[8] = top;
    
    vertices[16] = left;
    vertices[17] = bottom;
    
    vertices[25] = right;
    vertices[26] = bottom;
    
    vertices[34] = right;
    vertices[35] = top;
};

draw.prototype.rectangle = function(gfx, x, y, width, height, red, green, blue, alpha, scale, left, top, right, bottom)
{
    left   = scale * left;
    top    = scale * top;
    right  = scale * right;
    bottom = scale * bottom;
    
    this.temp[0] = x;
    this.temp[1] = y;
    this.temp[2] = 0;
    this.temp[3] = red;
    this.temp[4] = green;
    this.temp[5] = blue;
    this.temp[6] = alpha;
    this.temp[7] = left;
    this.temp[8] = bottom;
    
    this.temp[9] = x + width;
    this.temp[10] = y;
    this.temp[11] = 0;
    this.temp[12] = red;
    this.temp[13] = green;
    this.temp[14] = blue;
    this.temp[15] = alpha;
    this.temp[16] = right;
    this.temp[17] = bottom;
    
    this.temp[18] = x + width;
    this.temp[19] = y + height;
    this.temp[20] = 0;
    this.temp[21] = red;
    this.temp[22] = green;
    this.temp[23] = blue;
    this.temp[24] = alpha;
    this.temp[25] = right;
    this.temp[26] = top;
    
    this.temp[27] = x;
    this.temp[28] = y + height;
    this.temp[29] = 0;
    this.temp[30] = red;
    this.temp[31] = green;
    this.temp[32] = blue;
    this.temp[33] = alpha;
    this.temp[34] = left;
    this.temp[35] = top;
    
    gfx.quad(this.temp);
};

draw.prototype.cube = function(gfx, x, y, z, width, height, length, red, green, blue, alpha, scale, left, top, right, bottom)
{
    left   = scale * left;
    top    = scale * top;
    right  = scale * right;
    bottom = scale * bottom;
    
    this.temp = [
        x + width, y         , z + length, red * 0.6, green * 0.6, blue * 0.6, alpha, right, bottom,
        x + width, y + height, z + length, red * 0.6, green * 0.6, blue * 0.6, alpha, right, top   ,
        x        , y + height, z + length, red * 0.6, green * 0.6, blue * 0.6, alpha, left , top   ,
        x        , y         , z + length, red * 0.6, green * 0.6, blue * 0.6, alpha, left , bottom];
    gfx.quad(this.temp);
    
    this.temp = [ 
        x        , y         , z, red * 0.6, green * 0.6, blue * 0.6, alpha, left , bottom,
        x        , y + height, z, red * 0.6, green * 0.6, blue * 0.6, alpha, left , top   ,
        x + width, y + height, z, red * 0.6, green * 0.6, blue * 0.6, alpha, right, top   ,
        x + width, y         , z, red * 0.6, green * 0.6, blue * 0.6, alpha, right, bottom];
    gfx.quad(this.temp);
    
    this.temp = [
        x, y         , z + length, red * 0.8, green * 0.8, blue * 0.8, alpha, right, bottom,
        x, y + height, z + length, red * 0.8, green * 0.8, blue * 0.8, alpha, right, top   ,
        x, y + height, z         , red * 0.8, green * 0.8, blue * 0.8, alpha, left , top   ,
        x, y         , z         , red * 0.8, green * 0.8, blue * 0.8, alpha, left , bottom];
    gfx.quad(this.temp);
    
    this.temp = [
        x + width, y         , z         , red * 0.8, green * 0.8, blue * 0.8, alpha, left , bottom,
        x + width, y + height, z         , red * 0.8, green * 0.8, blue * 0.8, alpha, left , top   ,
        x + width, y + height, z + length, red * 0.8, green * 0.8, blue * 0.8, alpha, right, top   ,
        x + width, y         , z + length, red * 0.8, green * 0.8, blue * 0.8, alpha, right, bottom];
    gfx.quad(this.temp);
    
    this.temp = [
        x + width, y + height, z + length, red * 1.0, green * 1.0, blue * 1.0, alpha, right, top   ,
        x + width, y + height, z         , red * 1.0, green * 1.0, blue * 1.0, alpha, right, bottom,
        x        , y + height, z         , red * 1.0, green * 1.0, blue * 1.0, alpha, left , bottom,
        x        , y + height, z + length, red * 1.0, green * 1.0, blue * 1.0, alpha, left , top   ];
    gfx.quad(this.temp);
    
    this.temp = [
        x + width, y, z         , red * 1.0, green * 1.0, blue * 1.0, alpha, right, bottom,
        x + width, y, z + length, red * 1.0, green * 1.0, blue * 1.0, alpha, right, top   ,
        x        , y, z + length, red * 1.0, green * 1.0, blue * 1.0, alpha, left , top   ,
        x        , y, z         , red * 1.0, green * 1.0, blue * 1.0, alpha, left , bottom];
    gfx.quad(this.temp);
};

draw.prototype.sprite = function(gfx, x, y, z, radian, width, height, red, green, blue, alpha, scale, left, top, right, bottom)
{
    left   = scale * left;
    top    = scale * top;
    right  = scale * right;
    bottom = scale * bottom;
    
    var sin = width * Math.sin(radian);
    var cos = width * Math.cos(radian);
    
    this.temp[0] = x - cos;
    this.temp[1] = y;
    this.temp[2] = z + sin;
    this.temp[3] = red;
    this.temp[4] = green;
    this.temp[5] = blue;
    this.temp[6] = alpha;
    this.temp[7] = left;
    this.temp[8] = bottom;
    
    this.temp[9] = x + cos;
    this.temp[10] = y;
    this.temp[11] = z - sin;
    this.temp[12] = red;
    this.temp[13] = green;
    this.temp[14] = blue;
    this.temp[15] = alpha;
    this.temp[16] = right;
    this.temp[17] = bottom;
    
    this.temp[18] = x + cos;
    this.temp[19] = y + height;
    this.temp[20] = z - sin;
    this.temp[21] = red;
    this.temp[22] = green;
    this.temp[23] = blue;
    this.temp[24] = alpha;
    this.temp[25] = right;
    this.temp[26] = top;
    
    this.temp[27] = x - cos;
    this.temp[28] = y + height;
    this.temp[29] = z + sin;
    this.temp[30] = red;
    this.temp[31] = green;
    this.temp[32] = blue;
    this.temp[33] = alpha;
    this.temp[34] = left;
    this.temp[35] = top;
    
    gfx.quad(this.temp);
};

draw.prototype.body = function(gfx, x, y, z, radian, tempo, headRX, headRY)
{
    var a;
    var s = 0.24;
    
    a = this.getCube(0.8 * s, 0.8 * s, 0.8 * s); // head
    this.texture(a[0], 16.0/256.0, 0, 0, 1, 1); // f
    this.texture(a[1], 16.0/256.0, 1, 0, 2, 1); // b
    this.texture(a[2], 16.0/256.0, 0, 1, 1, 2); // l
    this.texture(a[3], 16.0/256.0, 1, 1, 2, 2); // r
    this.texture(a[4], 16.0/256.0, 0, 2, 1, 3); // t
    this.texture(a[5], 16.0/256.0, 1, 2, 2, 3); // b
    for (var i = 0; i < 6; i++)
    {
        this.rotate_x(a[i], headRX);
        this.rotate_y(a[i], headRY);
        this.translate(a[i], x, y + 5.6 * s, z);
        gfx.quad(a[i]);
    }
    a = this.getCube(0.8 * s, 1.2 * s, 0.4 * s); // body
    this.texture(a[0], 16.0/256.0, 0, 0, 1, 1); // f
    this.texture(a[1], 16.0/256.0, 0, 0, 1, 1); // b
    this.texture(a[2], 16.0/256.0, 0, 0, 1, 1); // l
    this.texture(a[3], 16.0/256.0, 0, 0, 1, 1); // r
    this.texture(a[4], 16.0/256.0, 0, 0, 1, 1); // t
    this.texture(a[5], 16.0/256.0, 0, 0, 1, 1); // b
    for (var i = 0; i < 6; i++)
    {
        this.translate(a[i], 0, 3.6 * s, 0);
        this.rotate_y(a[i], radian);
        this.translate(a[i], x, y, z);
        gfx.quad(a[i]);
    }
    a = this.getCube(0.4 * s, 1.2 * s, 0.4 * s); // left arm
    this.texture(a[0], 16.0/256.0, 0, 0, 1, 1); // f
    this.texture(a[1], 16.0/256.0, 0, 0, 1, 1); // b
    this.texture(a[2], 16.0/256.0, 0, 0, 1, 1); // l
    this.texture(a[3], 16.0/256.0, 0, 0, 1, 1); // r
    this.texture(a[4], 16.0/256.0, 0, 0, 1, 1); // t
    this.texture(a[5], 16.0/256.0, 0, 0, 1, 1); // b
    for (var i = 0; i < 6; i++)
    {
        this.translate(a[i], 0, -1.2 * s, 0);
        this.rotate_x(a[i], Math.sin(tempo));
        this.translate(a[i], -1.2 * s, 4.8 * s, 0);
        this.rotate_y(a[i], radian);
        this.translate(a[i], x, y, z);
        gfx.quad(a[i]);
    }
    a = this.getCube(0.4 * s, 1.2 * s, 0.4 * s); // left leg
    this.texture(a[0], 16.0/256.0, 0, 0, 1, 1); // f
    this.texture(a[1], 16.0/256.0, 0, 0, 1, 1); // b
    this.texture(a[2], 16.0/256.0, 0, 0, 1, 1); // l
    this.texture(a[3], 16.0/256.0, 0, 0, 1, 1); // r
    this.texture(a[4], 16.0/256.0, 0, 0, 1, 1); // t
    this.texture(a[5], 16.0/256.0, 0, 0, 1, 1); // b
    for (var i = 0; i < 6; i++)
    {
        this.translate(a[i], 0, -1.2 * s, 0);
        this.rotate_x(a[i], Math.sin(tempo + Math.PI));
        this.translate(a[i], -0.4 * s, 2.4 * s, 0);
        this.rotate_y(a[i], radian);
        this.translate(a[i], x, y, z);
        gfx.quad(a[i]);
    }
    a = this.getCube(0.4 * s, 1.2 * s, 0.4 * s); // right arm
    this.texture(a[0], 16.0/256.0, 0, 0, 1, 1); // f
    this.texture(a[1], 16.0/256.0, 0, 0, 1, 1); // b
    this.texture(a[2], 16.0/256.0, 0, 0, 1, 1); // l
    this.texture(a[3], 16.0/256.0, 0, 0, 1, 1); // r
    this.texture(a[4], 16.0/256.0, 0, 0, 1, 1); // t
    this.texture(a[5], 16.0/256.0, 0, 0, 1, 1); // b
    for (var i = 0; i < 6; i++)
    {
        this.translate(a[i], 0, -1.2 * s, 0);
        this.rotate_x(a[i], Math.sin(tempo + Math.PI));
        this.translate(a[i], 1.2 * s, 4.8 * s, 0);
        this.rotate_y(a[i], radian);
        this.translate(a[i], x, y, z);
        gfx.quad(a[i]);
    }
    a = this.getCube(0.4 * s, 1.2 * s, 0.4 * s); // right leg
    this.texture(a[0], 16.0/256.0, 0, 0, 1, 1); // f
    this.texture(a[1], 16.0/256.0, 0, 0, 1, 1); // b
    this.texture(a[2], 16.0/256.0, 0, 0, 1, 1); // l
    this.texture(a[3], 16.0/256.0, 0, 0, 1, 1); // r
    this.texture(a[4], 16.0/256.0, 0, 0, 1, 1); // t
    this.texture(a[5], 16.0/256.0, 0, 0, 1, 1); // b
    for (var i = 0; i < 6; i++)
    {
        this.translate(a[i], 0, -1.2 * s, 0);
        this.rotate_x(a[i], Math.sin(tempo));
        this.translate(a[i], 0.4 * s, 2.4 * s, 0);
        this.rotate_y(a[i], radian);
        this.translate(a[i], x, y, z);
        gfx.quad(a[i]);
    }
};

draw.prototype.getCube = function(x, y, z)
{
    var a = [
        // front
        [
            -x,  y, z, 1, 1, 1, 1, 0, 0,
            -x, -y, z, 1, 1, 1, 1, 0, 0,
            +x, -y, z, 1, 1, 1, 1, 0, 0,
            +x,  y, z, 1, 1, 1, 1, 0, 0
        ],
        // back
        [
            +x,  y, -z, 1, 1, 1, 1, 0, 0,
            +x, -y, -z, 1, 1, 1, 1, 0, 0,
            -x, -y, -z, 1, 1, 1, 1, 0, 0,
            -x,  y, -z, 1, 1, 1, 1, 0, 0
        ],
        // left
        [
            -x,  y, -z, 1, 1, 1, 1, 0, 0,
            -x, -y, -z, 1, 1, 1, 1, 0, 0,
            -x, -y,  z, 1, 1, 1, 1, 0, 0,
            -x,  y,  z, 1, 1, 1, 1, 0, 0
        ],
        // right
        [
            x,  y,  z, 1, 1, 1, 1, 0, 0,
            x, -y,  z, 1, 1, 1, 1, 0, 0,
            x, -y, -z, 1, 1, 1, 1, 0, 0,
            x,  y, -z, 1, 1, 1, 1, 0, 0
        ],
        // top
        [
            -x, y, -z, 1, 1, 1, 1, 0, 0,
            -x, y,  z, 1, 1, 1, 1, 0, 0,
            +x, y,  z, 1, 1, 1, 1, 0, 0,
            +x, y, -z, 1, 1, 1, 1, 0, 0
        ],
        // bottom
        [
            -x, -y,  z, 1, 1, 1, 1, 0, 0,
            -x, -y, -z, 1, 1, 1, 1, 0, 0,
            +x, -y, -z, 1, 1, 1, 1, 0, 0,
            +x, -y,  z, 1, 1, 1, 1, 0, 0
        ]
    ];
    
    return a;
};