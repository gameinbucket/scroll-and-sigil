class Camera
{
    constructor(x, y, z, rx, ry) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.rx = rx;
        this.ry = ry;
    }
    static Ray(canvas, mouse, ipm, iv) {
        let clip_x = (2.0 * mouse[0]) / canvas.width - 1.0;
        let clip_y = (2.0 * mouse[1]) / canvas.height - 1.0;
        
        console.log("ray clip " + clip_x + ", " + clip_y);
        
        let eye_x = clip_x * ipm[0] + clip_y * ipm[4] - ipm[8] + ipm[12];
        let eye_y = clip_x * ipm[1] + clip_y * ipm[5] - ipm[9] + ipm[13];
        
        let world_x = eye_x * iv[0] + eye_y * iv[4] - iv[8];
        let world_y = eye_x * iv[1] + eye_y * iv[5] - iv[9];
        let world_z = eye_x * iv[2] + eye_y * iv[6] - iv[10];
        
        let mag = Math.sqrt(world_x * world_x + world_y * world_y + world_z * world_z);
        
        world_x /= mag;
        world_y /= mag;
        world_z /= mag;
        
        console.log("ray world " + world_x + ", " + world_y + ", " + world_z);
        
        return [world_x, world_y, world_z];
    }
}