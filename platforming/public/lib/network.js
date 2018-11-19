class Network {
    static Request(file) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest()
            request.open("GET", file)
            request.responseType = "text"
            request.onreadystatechange = function () {
                if (request.readyState === XMLHttpRequest.DONE)
                    resolve(request.responseText)
            }
            request.onerror = reject
            request.send()
        })
    }
    static Send(url, data) {
        const content_header = "Content-Type"
        const type_text = "text/plain"
        return new Promise(function (resolve, reject) {
            const request = new XMLHttpRequest()
            request.open("POST", url)
            request.setRequestHeader(content_header, type_text)
            request.responseType = type_text
            request.onreadystatechange = function () {
                if (request.readyState === XMLHttpRequest.DONE)
                    resolve(request.responseText)
            }
            request.onerror = reject
            request.send(data)
        })
    }
}