let fs          = require('fs');

let cheerio     = require('cheerio'),
    exec        = require('child_process').exec;

const utils = {
    state:{
        regxHtml: /^\.html/i,
        regxScss: /^\.css/i,
        regxWebp: /\?__webp$/i
    },

    isHtml: function(str){
        return this.state.regxHtml.test(str);
    },

    isScss: function(str){
        return this.state.regxScss.test(str);
    },

    isWebp: function(str){
        return this.state.regxWebp.test(str);
    },

    webper: function(settings, fileSrc, dest){
        let args = ['-quiet', '-mt'];

        if (settings.preset) {
            args.push('-preset', settings.preset);
        }

        if (settings.quality) {
            args.push('-q', settings.quality);
        }

        if (settings.alphaQuality) {
            args.push('-alpha_q', settings.alphaQuality);
        }

        if (settings.method) {
            args.push('-m', settings.method);
        }

        if (settings.size) {
            args.push('-size', settings.size);
        }

        if (settings.sns) {
            args.push('-sns', settings.sns);
        }

        if (settings.filter) {
            args.push('-f', settings.filter);
        }

        if (settings.autoFilter) {
            args.push('-af');
        }

        if (settings.sharpness) {
            args.push('-sharpness', settings.sharpness);
        }

        if (settings.lossless) {
            args.push('-lossless');
        }

        exec('cwebp ' + args.concat([fileSrc, '-o', dest]).join(' '), function(err) {
            if (err) throw err;
        });
    },

    rewriteHtml: function($){
        let imgs = $('img'),
        len = imgs.length;
    }
}

// 解析html模板
const parseHtml = function(content, file, settings){
    let _root = file.dirname.split('/static')[0];
    let ctn = content,
        $ = cheerio.load(ctn),
        imgs = $('img'),
        len = imgs.length;
        isRewrite = false;

    for(let i=0; i<len; i++){
        let img = $(imgs[i]),
            src = img.attr('src'),
            fullsrc = utils.isWebp(src) ? (_root + src.split('?__webp')[0]) : null;
        if(fullsrc && fs.existsSync(fullsrc)){
            isRewrite = true;
            let dest = fullsrc + ".webp";
            utils.webper(settings,fullsrc,dest);

            let alt = img.prop('alt') || '',
                title = img.prop('title') || '',
                name = src.split('?__webp')[0],
                html = "<picture><source srcset=\"" + name + ".webp\" type=\"image/webp\"><img srcset=\"" + name + "\" src=\"" + name + "\" alt=\"" + alt + "\" title=\"" + title + "\"></picture>"
            img.after(html);
            img.remove();
        }
    }
    isRewrite && (ctn = $.html());
    return ctn;
}

const parseCss = function(content, file, settings){
    let html = '',
        ctn = content.toString("utf8");  // buffer转utf8;

    // 已经注入过webps类，先要剔除
    let rmStart = ctn.indexOf('.webps'),
        isRemove = rmStart != '-1' && ctn.indexOf('.webp') != -1;  // 后一个判断表示图片后缀
    if(isRemove){
        ctn = ctn.slice(0,rmStart);
    }

    ctn.replace(/url\([\'\"](\S+)[\'\"]\)/gi,function(str,src,index){
        src = src.split(')')[0];
        let _root = file.dirname.split('/static')[0],
            name = src.slice(0,src.lastIndexOf('?')),
            start = ctn.lastIndexOf('{',index),
            end = ctn.indexOf('}',start) + 1,
            styleCtn = ctn.slice(start,end),
            // 获取类名
            clssEnd = start,
            cs1 = ctn.lastIndexOf('}',clssEnd),
            cs2 = ctn.lastIndexOf(',',clssEnd),

            // 区分多个类名之间以','连接的情况
            clssStart = cs1 < cs2 ? (cs1+1) : ctn.lastIndexOf('.',clssEnd),
            clsses = ctn.slice(clssStart,clssEnd).split(','),             

            // 获取bg背景属性
            proEnd = ctn.lastIndexOf(':',index),
            case1 = ctn.lastIndexOf(';',index),
            case2 = ctn.lastIndexOf('{',index), // bg属性作为类中的第一个属性
            proStart = case1 < case2 ? case2+1 : case1+1,
            pro = ctn.slice(proStart,proEnd);

        // 判断是否有webp标识
        let fullsrc = utils.isWebp(src) ? (_root + src.split('?__webp')[0]) : null;
        if(fullsrc){
            let dest = fullsrc + ".webp";

            // 生成webp图片
            utils.webper(settings,fullsrc,dest);

            let clss = '';
            for(let i=0,l=clsses.length; i<l; i++){
                clss += '.webps ' + clsses[i] + ','
            }
            clss = clss.slice(0,clss.length-1); // 提出最后一个类中的符号','

            // background的属性值（除去url）
            let bgVal = '';
            if(pro === 'background'){
                let bgValStart = styleCtn.indexOf(')')+2,
                    bgValEnd = styleCtn.indexOf(';',bgValStart);
                bgValEnd = bgValEnd !== -1 ? bgValEnd : styleCtn.length-1;

                bgVal = styleCtn.slice(bgValStart,bgValEnd); // repeat top ...
            }

            // 获取bg-size属性
            let bsStart = styleCtn.indexOf('background-size:') + 16,
                bgSize = '';

            if(bsStart !== 15) {
                let bsEnd = styleCtn.indexOf(';',bsStart);
                bsEnd = bsEnd === -1 ? styleCtn.indexOf('}') : bsEnd;
                bgSize = styleCtn.slice(bsStart,bsEnd);
            }

            html += clss + "{" + pro + ":url(" + name + ".webp)";
            bgVal && (html += " "+bgVal);
            html += " !important;";
            bgSize && (html += "background-size:"+bgSize+" !important;");
            html += "}";
        }

    });
    ctn += html;

    return ctn;
}

module.exports = function (content, file, settings) {
    let ctn = content;
    if(utils.isHtml(file.rExt)){
        ctn = parseHtml(content, file, settings);
    }else if(utils.isScss(file.rExt)){
        ctn = parseCss(content, file, settings);
    }
    return ctn;
}