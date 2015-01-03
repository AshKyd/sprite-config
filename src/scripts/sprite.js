var fs = require('fs');
var modal = fs.readFileSync(__dirname+'/../templates/modal.html', 'utf8');
var properties = fs.readFileSync(__dirname+'/../templates/properties.html', 'utf8');
var di = require('./dataimages');

// http://stackoverflow.com/questions/1489486/jquery-plugin-to-serialize-a-form-and-also-restore-populate-the-form/1490431#1490431
$.fn.values = function(data) {
    var els = $(this).find(':input').get();

    if(typeof data != 'object') {
        // return all data
        data = {};

        $.each(els, function() {
            if (this.name && !this.disabled && (this.checked
                || /select|textarea/i.test(this.nodeName)
                || /text|hidden|password/i.test(this.type))) {
                data[this.name] = $(this).val();
            }
        });
        return data;
    } else {
        $.each(els, function() {
            if (this.name && data[this.name]) {
                if(this.type == 'checkbox' || this.type == 'radio') {
                    $(this).attr("checked", (data[this.name] == $(this).val()));
                } else {
                    $(this).val(data[this.name]);
                }
            }
        });
        return $(this);
    }
};

$.fn.setPosition = function(position){
    $(this).css({
        left: position.left+'px',
        top: position.top+'px',
    });
}

var Sprite = function(opts){
    var _this = this;
    this.itemContainer = opts.container;
    this.id = opts.id;

    if(opts.config){
        this.config = opts.config;
        this.file = this.config.file;
        delete this.config.file;
        this.setupPreview(function(){
            _this.save();
        });
    } else {
        this.showModal();
    }
}

Sprite.prototype.showModal = function(){
    this.modal = $(modal);
    var _this = this;
    this.setupPreview();
    $('.modal-title',this.modal).text('Sprite');
    $('.modal-body',this.modal).append(this.ele).append(properties);
    if(_this.config){
        $('form', _this.modal).values(_this.config.props);
    }
    this.modal.on('hide.bs.modal', function(){
        _this.save();
        _this.modal.remove();
    });
    $('body').append(this.modal);
    $(this.modal).modal();
}

Sprite.prototype.save = function(){
    var _this = this;
    _this.config = _this.getConfig();
    $('#s'+_this.id, _this.itemContainer).remove();
    var thumb = _this.ele.clone()
        .removeClass('ui-resizable')
        .find('div')
            .not('.sprite-img,.marker')
                .remove()
            .end()
        .end()
        .click(function(){
            _this.showModal();
        });
    $('<div class="thumb">')
        .attr('id','s'+_this.id)
        .append($('<span class="id">').text(_this.id))
        .append(thumb)
        .appendTo(this.itemContainer);
}

Sprite.prototype.setupPreview = function(cb){
    var _this = this;
    this.ele =  $('<div class="sprite"><div class="marker"></div><div class="sprite-img"></div></div>')
        .width(100).height(100);
    this.sprite = $('.sprite-img', this.ele)
        .droppable(function(dropped, file){
            _this.file = {
                name: file.name,
                content: dropped,
                type: file.type
            }
            _this.loadImage();
        })
        .draggable();

    this.marker = $('.marker', this.ele).draggable();
    this.ele.resizable();
    if(_this.config){
        this.sprite.setPosition(_this.config.imgOffset);
        this.marker.setPosition(_this.config.center);
        this.ele.width(_this.config.dims.w).height(_this.config.dims.h)
        this.loadImage(cb);
    }
}

Sprite.prototype.loadImage = function(cb){
    var _this = this;
    var dims = {};
    di.createImage(this.file.type, this.file.content, function(img, width, height){
        _this.sprite.css({
            'background-image': 'url("'+img+'")',
            'background-repeat': 'no-repeat'
        }).width(width).height(height);
        cb && cb();
    });
}

Sprite.prototype.getConfig = function(){
    var props;
    if(this.config){
        props = this.config.props;
    }
    if(this.modal){
        props = $('form',this.modal).values();
    }
    var center = this.marker.position();
    var imgOffset = this.sprite.position();
    if(!this.marker.is(':visible')){
        // Dont try if we're not visible, it alwaysreturns 0.
        center = this.config.center;
        imgOffset = this.config.imgOffset;
    }
    return {
        center: center,
        imgOffset: imgOffset,
        dims: {
            w: this.ele.width(),
            h: this.ele.height()
        },
        props: props,
        file: this.file
    }
}

module.exports = Sprite;
