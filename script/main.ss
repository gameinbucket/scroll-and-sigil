import
  bind/js

object domJS
  doc     js.value
  window  js.value
  body    js.value
  console js.value

global
  dom domJS

func domInit() domJS
  dom = new domJs
  dom.doc = js.global().get("document")
  dom.window = js.global().get("window")
  dom.body = js.global().get("body")
  dom.console = js.global().get("console")
  return dom
  
func main()
  done = new channel
  dom = domInit()
  app = appInit()
  app.run()
  wait done

func console(s string)
  dom.console.call("log", s)