class Network {
    static Request(file, call) {
        var request = new XMLHttpRequest()
        request.open("GET", file)
        request.responseType = "text"
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                call(request.responseText)
            }
        }
        request.send()
    }
    static Post(url, data, call) {
        const content_header = "Content-Type"
        const type_text = "text/plain"

        const request = new XMLHttpRequest()
        request.open("POST", url)
        request.setRequestHeader(content_header, type_text)
        request.responseType = type_text
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                call(request.responseText)
            }
        }
        request.send(data)
        console.log("sent")
    }
    static Get(file, id, call) {
        var request = new XMLHttpRequest()
        request.open("GET", file)
        request.responseType = "text"
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                call(id, request.responseText)
            }
        }
        request.send()
    }
}