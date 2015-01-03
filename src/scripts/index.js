/// Quick 'n dirty jQuery plugin to handle drops.
$.fn.droppable = function(cb){

    function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    $(this).each(function(){
        var target = this;
        function handleFileSelect(evt) {
            evt.stopPropagation();
            evt.preventDefault();

            var files = evt.dataTransfer.files; // FileList object.

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function(theFile) {
                return function(e) {
                    droppedFile = e.target.result;
                    cb.call(target, droppedFile, files[0]);
                };
            })(files[0]);

            // Read in the image file as a data URL.
            reader.readAsText(files[0]);
        }

        // Setup the dnd listeners.
        var dropZone = this;
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileSelect, false);
    });
    return this;
}

var Sprite = require('./sprite');
var di = require('./dataimages');
var sprites = [];

function loadSprites(sheet){
    sprites = [];
    $('.items').empty();
    sheet.sprites.forEach(function(sprite, i){
        sprite.file = sheet.files[sprite.file];
        sprites.push(new Sprite({
            id: i,
            container:$('.items'),
            config: sprite
        }))
    });
}

$(document).ready(function(){
    $('body').droppable(function(dropped){
        try{
            loadSprites(JSON.parse(dropped));
        } catch(e){
            // Probably didn't want this.
            console.log('Drop error',e);
        }
    })

    $('.addSprite').click(function(){
        sprites.push(new Sprite({id: $('.items > *').length, container:$('.items')}));
    });

    $('.saveDb').click(function(){
        var files = {};
        var db = sprites.map(function(sprite){
            // Replace config.file with just the name to reduce duplication.
            files[sprite.config.file.name] = sprite.config.file;
            sprite.config.file = sprite.config.file.name;
            return sprite.config;
        });

        db = {
            sprites: db,
            files: files
        };

        $('<a download="db.json"></a>').attr('href', di.createDataUri('application/download', JSON.stringify(db,null,2)))[0].click();
    });


});

window.onbeforeunload = function(){
    return 'Are you super sure?';
}
