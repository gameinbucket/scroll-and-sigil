/* if ('serviceWorker' in navigator)
{
    window.addEventListener('load', function()
    {
        navigator.serviceWorker.register('/service.js').then(function(registration)
        {
            console.log('service worker registered');
        }).catch(function(error)
        {
            console.log('service worker registration failed: ', error);
        });
    });
} */

class Network
{
    static Get(file, id, callback)
    {
        var request = new XMLHttpRequest();
        request.open('GET', file);
        request.responseType = 'text';
        request.onreadystatechange = function()
        {
            if (request.readyState === 4 && request.status === 200)
            {
                callback(id, request.responseText);
            }
        }
        request.send();
    }
}