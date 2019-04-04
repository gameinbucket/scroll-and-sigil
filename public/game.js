class Game {
    constructor() {}
    async init(app) {
        let player = app.world.netLookup.get(app.world.PID)
        app.camera = new Camera(player, 10.0, 0.0, 0.0)
        player.camera = app.camera
        console.log(player)
    }
}

let game = new Game()
let app = new App(game)

app.run()

function loop() {
    app.loop()
}
