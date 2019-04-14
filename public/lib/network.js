class Net {
    static Request(file) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest()
            request.open("GET", file)
            request.onreadystatechange = function () {
                if (request.readyState === XMLHttpRequest.DONE)
                    resolve(request.responseText)
            }
            request.onerror = reject
            request.send()
        })
    }
    static RequestBinary(file) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest()
            request.open("GET", file)
            request.onreadystatechange = function () {
                if (request.readyState === XMLHttpRequest.DONE)
                    resolve(request.response)
            }
            request.onerror = reject
            request.responseType = "arraybuffer"
            request.send()
        })
    }
    static Send(url, data) {
        return new Promise(function (resolve, reject) {
            const request = new XMLHttpRequest()
            request.open("POST", url)
            request.onreadystatechange = function () {
                if (request.readyState === XMLHttpRequest.DONE)
                    resolve(request.responseText)
            }
            request.onerror = reject
            request.send(data)
        })
    }
    static Socket(url) {
        return new Promise(function (resolve, reject) {
            let socket
            if (location.protocol === "https:") {
                console.log("websocket secured with https")
                socket = new WebSocket("wss://" + url)
            } else {
                socket = new WebSocket("ws://" + url)
            }
            socket.onopen = function () {
                resolve(socket)
            }
            socket.onerror = function (err) {
                reject(err)
            }
        })
    }
}
