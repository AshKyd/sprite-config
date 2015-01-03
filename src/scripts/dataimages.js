function createImage(contentType, data, callback) {
    var src = createDataUri(contentType, data);
    var img = new Image();
    img.onload = function() {
        if (typeof callback != 'undefined') {
            callback(src, img.width, img.height);
        }
    };
    img.src = src;
}

function createDataUri(contentType, data){
    return 'data:'+contentType+';charset=utf-8,'+encodeURIComponent(data);
}

module.exports = {
    createImage: createImage,
    createDataUri: createDataUri
}
