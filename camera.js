function camera()
{
    this.x;
    this.y;
    this.z;
    
    this.pitch;
    this.yaw;
    this.roll;
}

camera.prototype.set = function(x, y, z, pitch, yaw, roll)
{
    this.x = x;
    this.y = y;
    this.z = z;
    
    this.pitch = pitch;
    this.yaw = yaw;
    this.roll = roll;
};

camera.prototype.lookAt = function(x, y, z)
{
    var dx = x - this.x;
    var dy = y - this.y;
    var dz = z - this.z;
    
    var ph = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));
    var yw = Math.atan2(-dz, -dx);
    
    this.pitch = ph * 57.29577951;
    this.yaw   = yw * 57.29577951 - 90;
};