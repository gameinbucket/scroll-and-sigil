class Network {
    static Get(file, id, callback) {
        var request = new XMLHttpRequest()
        request.open('GET', file)
        request.responseType = 'text'
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                callback(id, request.responseText)
            }
        }
        request.send()
    }
}