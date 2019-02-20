class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    render(context) {
        const radius = 4.0
        const tau = Math.PI * 2.0
        context.beginPath()
        context.arc(this.x, this.y, radius, 0, tau, false)
        context.fill()
    }
}

class Skeleton {
    constructor() {
        this.points = []
    }
    render(context) {
        let point = this.points[0]
        context.fillStyle = 'orange'
        point.render(context)
        context.fillStyle = 'red'
        for (let i = 1; i < this.points.length; i++) {
            this.points[i].render(context)
        }
    }
}