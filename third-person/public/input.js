const INPUT_KEYS = {};
const INPUT_MOUSE = [false, false];
const INPUT_POS = [0, 0];
const INPUT_ONE = 49;
const INPUT_TWO = 50;
const INPUT_THREE = 51;
const INPUT_FOUR = 52;
const INPUT_W = 87;
const INPUT_A = 65;
const INPUT_S = 83;
const INPUT_D = 68;
const INPUT_Q = 81;
const INPUT_E = 69;
const INPUT_SPACE = 32;
const INPUT_UP = 38;
const INPUT_DOWN = 40;
const INPUT_LEFT = 37;
const INPUT_RIGHT = 39;
class Input {
    static Is(key) {
        return INPUT_KEYS[key];
    }
    static Off(key) {
        INPUT_KEYS[key] = false;
    }
    static IsClick(id) {
        return INPUT_MOUSE[id];
    }
    static MovementY() {
        return INPUT_MOVEMENT[1];
    }
    static Moved() {
        INPUT_MOVEMENT[0] = 0;
        INPUT_MOVEMENT[1] = 0;
    }
    static Clicked(id) {
        INPUT_MOUSE[id] = false;
    }
    static KeyUp(event) {
        INPUT_KEYS[event.keyCode] = false;
    }
    static KeyDown(event) {
        INPUT_KEYS[event.keyCode] = true;
    }
    static MouseUp(event) {
        if (event.button === 0) INPUT_MOUSE[0] = false;
        else if (event.button === 2) INPUT_MOUSE[1] = false;
    }
    static MouseDown(event) {
        if (event.button === 0) INPUT_MOUSE[0] = true;
        else if (event.button === 2) INPUT_MOUSE[1] = true;
    }
    static MouseMove(event) {
        INPUT_POS[0] = event.clientX;
        INPUT_POS[1] = event.clientY;
    }
}