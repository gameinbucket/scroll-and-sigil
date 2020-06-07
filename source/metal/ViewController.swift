import Metal

var device: MTLDevice!
var metalLayer: CAMetalLayer!

override func viewDidLoad() {
  super.viewDidLoad()
  device = MTLCreateSystemDefaultDevice()
}
