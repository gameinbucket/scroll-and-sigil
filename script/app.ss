import
  net
  bind/js
  graphics

object canvas
  element js.value
  width   int
  height  int

object app
  on     bool
  canvas canvas
  call   js.function
  gl     js.value
  g      graphics.renderSystem
  screen graphics.renderBuffer

func canvasInit() canvas
  width = dom.window.get("innerWidth").toInt()

func app.init()
  g = me.g
  gl = me.gl
  world = me.world

  wadRead(g gl net.get("wad"))

  socket = net.socket("websocket")
  close = func()
    console("socket closed!")
    me.on = false
    panic("lost connection to server")
    return nil
  socket.set("onclose" close)

  raw byte[]
  join = new sync.wait
  join.add(1)
  get = func(args js.value[])
    data = args[0].get("data")
    uint8data = js.global().get("Uint8Array").new(data)
    size = uint8data.get("byteLength").toInt()
    raw = new byte[size]
    typeArray = js.typeArrayOf(raw)
    typeArray.call("set" uint8data)
    typeArray.release()
    join.done()
    return nil
  socket.set("onmessage" get)
  join.wait()
  
  world.load(raw)

  me.camera = cameraInit(world player 10.0)