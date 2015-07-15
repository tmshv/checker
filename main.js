var Panel = (function(){
    var Panel = function(elem, vh){
        this.visibleHeight = vh | 0;
        this.element = elem;
        
        this.duration = 300;
//        this.easing = TWEEN.Easing.Cubic.Out;
        this.easing = TWEEN.Easing.Elastic.Out;
        this.easingDown = TWEEN.Easing.Exponential.In;
        this.easingUp = TWEEN.Easing.Cubic.Out;
        
        this.moveUp(true);
    }

    Panel.prototype.moveUp = function(noAnimOrCallback){
        if(this.stateUp){
            tryCall(noAnimOrCallback);
            return;
        }
        this.stateUp = true;
        var y = - (this.element.style.height + this.visibleHeight);
        setupMoving(this, 0, y, noAnimOrCallback, this.easingUp);
    }

    Panel.prototype.moveDown = function(noAnimOrCallback){
        if(!this.stateUp){
            tryCall(noAnimOrCallback);
            return;
        }
        this.stateUp = false;
        var y = - this.visibleHeight;
        setupMoving(this, y, 0, noAnimOrCallback, this.easingDown);
    }

    Panel.prototype.toggle = function(noAnimOrCallback){
//        this.stateUp = !this.stateUp;
//        this.update(noAnimOrCallback);
        if(this.stateUp) this.moveDown(noAnimOrCallback);
        else this.moveUp(noAnimOrCallback);
    }
    
    Panel.prototype.update = function(noAnimOrCallback){
        if(this.stateUp) this.moveUp(noAnimOrCallback);
        else this.moveDown(noAnimOrCallback);
    }
    return Panel;
    
    function setupMoving(panel, coord1, coord2, noAnimOrCallback, easing){
        var cb = typeof noAnimOrCallback == "function" ? noAnimOrCallback : null;
        var noAnim = typeof noAnimOrCallback == "function" ? false : Boolean(noAnimOrCallback);
        
//        console.log(noAnimOrCallback, anim, cb);
        if(noAnim) move(panel, coord2);
        else animate(panel, coord1, coord2, cb, easing);
    }
    
    function move(panel, coord){
        panel.element.style.top = coord + "px";
    }
    
    function  animate(panel, from, to, cb, easing){
        var tween = new TWEEN.Tween({x:0, y:from});
        tween.to({y: to}, panel.duration);
        tween.easing(easing ? easing : panel.easing);
        tween.onUpdate(function(){
            move(panel, this.y);
        });
        if(typeof cb == "function") tween.onComplete(cb)
        tween.start();
    }
    
    function tryCall(fun){
        if(typeof fun == "function") fun();
    }
})();

$(document).ready(function(){
    var panel = new Panel($("#main")[0], 150);
    
    function animate(){
        requestAnimationFrame(animate);
        TWEEN.update();
    }
    animate();

    window.onresize = function(){
        panel.update(true);
    }
    
    $("#buttonPresets").click(function(event){
        panel.toggle();
    });
    
    $(".panel .presets a:not(.dynamic)").click(function(event){
        event.preventDefault();
        $("#inputWidth").val($(this).data("width"));
        $("#inputHeight").val($(this).data("height"));
    });
    $(".panel .presets a.dynamic").click(function(event){
        event.preventDefault();
        
        try{
            var s = actions[$(this).data("action")]();
            $("#inputWidth").val(s.width);
            $("#inputHeight").val(s.height);
        }catch(error){
        }
    });
    
    $("#buttonMake").click(function(event){
        panel.moveUp(function(){
            var elem = $("#buttonMake")[0];
            var from = Number(elem.dataset.rotation) | 0;
            var to = from + 90;

            var tween = new TWEEN.Tween({rotation: from})
            .to({rotation: to}, 300)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(function(){
                rotateBox(elem, this);
            })
            .onComplete(function(){
                elem.dataset.rotation = to;
                make();    
    //            var height = $("#inputHeight").val();
    //            moveOutputDown(height);
            })
            .start();
        });
    });
    
    function  moveOutputDown(value){
        value = parseInt(value);
        var elem = $("#container")[0];
        var from = parseInt($("#container").css("top"), 10);    
        var to = from + value + 80;
        
        var tween = new TWEEN.Tween({y: from})
        .to({y: to}, 450)
        .easing(TWEEN.Easing.Cubic.In)
        .delay(50)
        .onUpdate(function(){
//            elem.style.top = this.y + "px";
            $("#container").css("top", this.y);
        })
        .start();    
    }
    
    function rotateBox( box, params ) {
        var s = box.style;
        var transform = 'rotate(' + Math.floor( params.rotation ) + 'deg)';
        s.webkitTransform = transform;
        s.mozTransform = transform;
        s.transform = transform;
    }
    
    function make(){
        var width = $("#inputWidth").val();
        var height = $("#inputHeight").val();
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");    
        render(ctx, width, height);
        var data = canvas.toDataURL();
        var image = new Image();
        image.src = data;
        
        if($(".out img").length){
            $(".out img").first().before(image);
        }else{
            $(".out").append(image);
        }
        
        var from = parseInt($("#container").css("top"), 10);
        $("#container").css("top", from - height - 80);
        moveOutputDown(height);
    }
    
    function render(context, width, height) {
        var s = 8;
        var columns = width / s;
        var rows = height / s;
        var colorEven = "#ffffff";
        var colorOdd = "#cccccc";

        for (var y = 0; y < rows; y++) {
            var i = y % 2;
            for (var x = 0; x < columns; x++) {
                var color = i % 2 ? colorEven : colorOdd;

                context.fillStyle = color;
                context.fillRect(x * s, y * s, s, s);

                i++;
            }
        }
    };
    
    const actions = {
        "yourdisplay": function(){
            return {
                width: screen.width,
                height: screen.height
            }
        }
    };
});