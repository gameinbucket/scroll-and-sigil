onmessage = function(event) {
    let units = new Int32Array(event.data);
    console.log('worker: ' + units.byteLength);
    units[0] = 333;
    postMessage(units.buffer, [units.buffer]);
    close();
};