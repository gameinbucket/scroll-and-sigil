class Input
{
    constructor()
    {
        this.keys = new Array(256);
        this.mouse = [false, false];
        this.movement = [0, 0];
        this.map = [];
        
        this.One = 49;
        this.Two = 50;
        this.Three = 51;
        this.Four = 52;
        this.W = 87;
        this.A = 65;
        this.S = 83;
        this.D = 68;
        this.Q = 81;
        this.E = 69;
        this.Space = 32;
        this.Up = 38;
        this.Down = 40;
        this.Left = 37;
        this.Right = 39;
        
        document.onkeyup = this.KeyUp;
        document.onkeydown = this.KeyDown;
        document.onmouseup = this.MouseUp;
        document.onmousedown = this.MouseDown;
    }
    static Is(input, key)
    {
        return input.keys[key];
    }
    static Off(input, key)
    {
        input.keys[key] = false;
    }
    static Click(input, id)
    {
        return input.mouse[id];
    }
    static MovementX(input)
    {
        return input.movement[0];
    }
    static MovementY(input)
    {
        return input.movement[1];
    }
    static Moved(input)
    {
        input.movement[0] = 0;
        input.movement[1] = 0;
    }
    static Clicked(input, id)
    {
        input.mouse[id] = false;
    }
    static KeyUp(input, event)
    {
        input.keys[event.keyCode] = false;
    }
    static KeyDown(input, event)
    {
        input.keys[event.keyCode] = true;
    }
    static MouseUp(input, event)
    {
        if (event.button === 0) input.mouse[0] = false;
        else if (event.button === 2) input.mouse[1] = false;
    }
    static MouseDown(input, event)
    {
        if (event.button === 0) input.mouse[0] = true;
        else if (event.button === 2) input.mouse[1] = true;
    }
    static MouseMove(input, event)
    {
        input.movement[0] = event.movementX;
        input.movement[1] = event.movementY;
    }
}