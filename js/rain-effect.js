!function() {
    //封装方法，压缩之后减少文件大小
    function get_attribute(node, attr, default_value) {
        return node.getAttribute(attr) || default_value;
    }
    //封装方法，压缩之后减少文件大小
    function get_by_tagname(name) {
        return document.getElementsByTagName(name);
    }
    //获取配置参数
    function get_config_option() {
        var scripts = get_by_tagname("script"),
            script_len = scripts.length,
            script = scripts[script_len - 1]; //当前加载的script
        return {
            l: script_len, //长度，用于生成id用
            z: get_attribute(script, "zIndex", -1), //z-index
            o: get_attribute(script, "opacity", 0.7), //opacity
            c: get_attribute(script, "color", "174,194,224"), //color
            n: get_attribute(script, "count", 200), //雨滴数量
            s: get_attribute(script, "speed", 5), //速度
            l: get_attribute(script, "length", 20) //雨滴长度
        };
    }
    //设置canvas的高宽
    function set_canvas_size() {
        canvas_width = the_canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth, 
        canvas_height = the_canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    }

    //绘制下雨效果
    function draw_rain() {
        context.clearRect(0, 0, canvas_width, canvas_height);
        
        //绘制雨滴
        context.strokeStyle = "rgba(" + config.c + "," + config.o + ")";
        context.lineWidth = 1;
        context.lineCap = "round";
        
        raindrops.forEach(function(drop) {
            //更新雨滴位置
            drop.y += drop.speed;
            drop.x += drop.wind;
            
            //如果雨滴落到底部，重新从顶部开始
            if (drop.y > canvas_height) {
                reset_drop(drop);
            }
            
            //如果雨滴飘出左右边界，重新设置位置
            if (drop.x > canvas_width || drop.x < 0) {
                drop.x = Math.random() * canvas_width;
            }
            
            //绘制雨滴
            context.beginPath();
            context.moveTo(drop.x, drop.y);
            context.lineTo(drop.x - drop.wind * 2, drop.y - drop.length);
            context.stroke();
            
            //绘制雨滴尾迹（可选）
            if (drop.speed > 8) {
                context.beginPath();
                context.moveTo(drop.x, drop.y);
                context.lineTo(drop.x - drop.wind, drop.y - drop.length * 0.3);
                context.strokeStyle = "rgba(" + config.c + "," + (config.o * 0.3) + ")";
                context.stroke();
            }
        });
        
        //绘制涟漪效果（雨滴落地时）
        context.fillStyle = "rgba(" + config.c + ", 0.2)";
        ripples.forEach(function(ripple, index) {
            ripple.radius += 1;
            ripple.opacity -= 0.02;
            
            if (ripple.opacity > 0) {
                context.beginPath();
                context.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
                context.fillStyle = "rgba(" + config.c + "," + ripple.opacity + ")";
                context.fill();
            } else {
                ripples.splice(index, 1);
            }
        });
        
        //检查是否需要创建涟漪
        raindrops.forEach(function(drop, index) {
            if (drop.y > canvas_height - 10 && drop.y < canvas_height + 10) {
                ripples.push({
                    x: drop.x,
                    y: canvas_height,
                    radius: 0,
                    opacity: 0.3
                });
            }
        });

        frame_func(draw_rain);
    }
    
    //重置雨滴位置
    function reset_drop(drop) {
        drop.x = Math.random() * canvas_width * 1.2;
        drop.y = Math.random() * -100;
        drop.speed = Math.random() * config.s + 3;
        drop.length = Math.random() * config.l + 10;
        drop.wind = (Math.random() - 0.5) * 1.5; //风力效果
        drop.opacity = Math.random() * 0.3 + 0.4;
    }

    //创建画布，并添加到body中
    var the_canvas = document.createElement("canvas"), //画布
        config = get_config_option(), //配置
        canvas_id = "rain_" + config.l, //canvas id
        context = the_canvas.getContext("2d"), 
        canvas_width, 
        canvas_height, 
        frame_func = window.requestAnimationFrame || 
                    window.webkitRequestAnimationFrame || 
                    window.mozRequestAnimationFrame || 
                    window.oRequestAnimationFrame || 
                    window.msRequestAnimationFrame || 
                    function(func) {
                        window.setTimeout(func, 1000 / 60);
                    }, 
        random = Math.random,
        raindrops = [],
        ripples = [];

    the_canvas.id = canvas_id;
    the_canvas.style.cssText = "position:fixed;top:0;left:0;z-index:" + config.z + ";opacity:" + config.o + ";pointer-events:none;";
    get_by_tagname("body")[0].appendChild(the_canvas);

    //初始化画布大小
    set_canvas_size(); 
    window.onresize = set_canvas_size;

    //生成雨滴
    for (var i = 0; i < config.n; i++) {
        raindrops.push({
            x: Math.random() * canvas_width,
            y: Math.random() * canvas_height,
            speed: Math.random() * config.s + 3,
            length: Math.random() * config.l + 10,
            wind: (Math.random() - 0.5) * 1.5,
            opacity: Math.random() * 0.3 + 0.4
        });
    }

    //开始动画
    setTimeout(function() {
        draw_rain();
    }, 100);
}();