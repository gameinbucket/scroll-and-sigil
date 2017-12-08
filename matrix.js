class Matrix
{
    static Make()
    {
        return new Array(16);
    }
    static Identity(m)
    {
        m[0] = 1.0;
        m[1] = 0.0;
        m[2] = 0.0;
        m[3] = 0.0;
        
        m[4] = 0.0;
        m[5] = 1.0;
        m[6] = 0.0;
        m[7] = 0.0;
        
        m[8] = 0.0;
        m[9] = 0.0;
        m[10] = 1.0;
        m[11] = 0.0;
        
        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = 0.0;
        m[15] = 1.0;
    }
    static Orthographic(m, left, right, bottom, top, near, far)
    {
        m[0] = 2.0 / (right - left);
        m[1] = 0.0;
        m[2] = 0.0;
        m[3] = 0.0;
        
        m[4] = 0.0;
        m[5] = 2.0 / (top - bottom);
        m[6] = 0.0;
        m[7] = 0.0;
        
        m[8] = 0.0;
        m[9] = 0.0;
        m[10] = -2.0 / (far - near);
        m[11] = 0.0;
        
        m[12] = -((right + left) / (right - left));
        m[13] = -((top + bottom) / (top - bottom));
        m[14] = -((far + near) / (far - near));
        m[15] = 1.0;
    }
    static Perspective(m, fov, near, far, ar)
    {
        var top = near * Math.tan(fov * Math.PI / 360.0);
        var bottom = -top;
        var left = bottom * ar;
        var right = top * ar;
        
        this.Frustum(m, left, right, bottom, top, near, far);
    }
    static Frustum(m, left, right, bottom, top, near, far)
    {
        m[0] = (2.0 * near) / (right - left);
        m[1] = 0.0;
        m[2] = 0.0;
        m[3] = 0.0;
        
        m[4] = 0.0;
        m[5] = (2.0 * near) / (top - bottom);
        m[6] = 0.0;
        m[7] = 0.0;
        
        m[8] = (right + left) / (right - left);
        m[9] = (top + bottom) / (top - bottom);
        m[10] = -(far + near) / (far - near);
        m[11] = -1.0;
        
        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = -(2.0 * far * near) / (far - near);
        m[15] = 0.0;
    }
    static Translate(m, x, y, z)
    {
        m[12] = x * m[0] + y * m[4] + z * m[8] + m[12];
        m[13] = x * m[1] + y * m[5] + z * m[9] + m[13];
        m[14] = x * m[2] + y * m[6] + z * m[10] + m[14];
        m[15] = x * m[3] + y * m[7] + z * m[11] + m[15];
    }
    static RotateX(m, r)
    {
        this.t[0] = 1.0;
        this.t[1] = 0.0;
        this.t[2] = 0.0;
        this.t[3] = 0.0;
        
        this.t[4] = 0.0;
        this.t[5] = Math.cos(r);
        this.t[6] = Math.sin(r);
        this.t[7] = 0.0;
        
        this.t[8] = 0.0;
        this.t[9] = -Math.sin(r);
        this.t[10] = Math.cos(r);
        this.t[11] = 0.0;
        
        this.t[12] = 0.0;
        this.t[13] = 0.0;
        this.t[14] = 0.0;
        this.t[15] = 1.0;
        
        this.Multiply(m, m.slice(), this.t);
    }
    static RotateY(m, r)
    {
        this.t[0] = Math.cos(r);
        this.t[1] = 0.0;
        this.t[2] = -Math.sin(r);
        this.t[3] = 0.0;
        
        this.t[4] = 0.0;
        this.t[5] = 1.0;
        this.t[6] = 0.0;
        this.t[7] = 0.0;
        
        this.t[8] = Math.sin(r);
        this.t[9] = 0.0;
        this.t[10] = Math.cos(r);
        this.t[11] = 0.0;
        
        this.t[12] = 0.0;
        this.t[13] = 0.0;
        this.t[14] = 0.0;
        this.t[15] = 1.0;
        
        this.Multiply(m, m.slice(), this.t);
    }
    static RotateZ(m, r)
    {
        this.t[0] = Math.cos(r);
        this.t[1] = Math.sin(r);
        this.t[2] = 0.0;
        this.t[3] = 0.0;
        
        this.t[4] = -Math.sin(r);
        this.t[5] = Math.cos(r);
        this.t[6] = 0.0;
        this.t[7] = 0.0;
        
        this.t[8] = 0.0;
        this.t[9] = 0.0;
        this.t[10] = 1.0;
        this.t[11] = 0.0;
        
        this.t[12] = 0.0;
        this.t[13] = 0.0;
        this.t[14] = 0.0;
        this.t[15] = 1.0;
        
        this.Multiply(m, m.slice(), this.t);
    }
    static Multiply(m, m1, m2)
    {
        m[0] = m1[0] * m2[0] + m1[4] * m2[1] + m1[8] * m2[2] + m1[12] * m2[3];
        m[1] = m1[1] * m2[0] + m1[5] * m2[1] + m1[9] * m2[2] + m1[13] * m2[3];
        m[2] = m1[2] * m2[0] + m1[6] * m2[1] + m1[10] * m2[2] + m1[14] * m2[3];
        m[3] = m1[3] * m2[0] + m1[7] * m2[1] + m1[11] * m2[2] + m1[15] * m2[3];
        
        m[4] = m1[0] * m2[4] + m1[4] * m2[5] + m1[8] * m2[6] + m1[12] * m2[7];
        m[5] = m1[1] * m2[4] + m1[5] * m2[5] + m1[9] * m2[6] + m1[13] * m2[7];
        m[6] = m1[2] * m2[4] + m1[6] * m2[5] + m1[10] * m2[6] + m1[14] * m2[7];
        m[7] = m1[3] * m2[4] + m1[7] * m2[5] + m1[11] * m2[6] + m1[15] * m2[7];
        
        m[8] = m1[0] * m2[8] + m1[4] * m2[9] + m1[8] * m2[10] + m1[12] * m2[11];
        m[9] = m1[1] * m2[8] + m1[5] * m2[9] + m1[9] * m2[10] + m1[13] * m2[11];
        m[10] = m1[2] * m2[8] + m1[6] * m2[9] + m1[10] * m2[10] + m1[14] * m2[11];
        m[11] = m1[3] * m2[8] + m1[7] * m2[9] + m1[11] * m2[10] + m1[15] * m2[11];
        
        m[12] = m1[0] * m2[12] + m1[4] * m2[13] + m1[8] * m2[14] + m1[12] * m2[15];
        m[13] = m1[1] * m2[12] + m1[5] * m2[13] + m1[9] * m2[14] + m1[13] * m2[15];
        m[14] = m1[2] * m2[12] + m1[6] * m2[13] + m1[10] * m2[14] + m1[14] * m2[15];
        m[15] = m1[3] * m2[12] + m1[7] * m2[13] + m1[11] * m2[14] + m1[15] * m2[15];
    }
}