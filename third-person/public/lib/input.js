const INPUT_KEYS = {}
const INPUT_MOUSE = [false, false]
const INPUT_POS = [0, 0]

class Input {
    static Is(key) {
        return INPUT_KEYS[key]
    }
    static Off(key) {
        INPUT_KEYS[key] = false
    }
    static IsClick(id) {
        return INPUT_MOUSE[id]
    }
    static MovementY() {
        return INPUT_MOVEMENT[1]
    }
    static Moved() {
        INPUT_MOVEMENT[0] = 0
        INPUT_MOVEMENT[1] = 0
    }
    static Clicked(id) {
        INPUT_MOUSE[id] = false
    }
    static KeyUp(event) {
        INPUT_KEYS[event.key] = false
    }
    static KeyDown(event) {
        INPUT_KEYS[event.key] = true
    }
    static MouseUp(event) {
        if (event.button === 0) INPUT_MOUSE[0] = false
        else if (event.button === 2) INPUT_MOUSE[1] = false
    }
    static MouseDown(event) {
        if (event.button === 0) INPUT_MOUSE[0] = true
        else if (event.button === 2) INPUT_MOUSE[1] = true
    }
    static MouseMove(event) {
        INPUT_POS[0] = event.clientX
        INPUT_POS[1] = event.clientY
    }
}