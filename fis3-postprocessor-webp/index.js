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
		len = imgs.length,
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
                html = "<picture><source srcset=\"" + name + ".webp\" src=\"" + name + ".webp\" type=\"image/webp\"><img srcset=\"" + src + "\" src=\"" + src + "\" alt=\"" + alt + "\" title=\"" + title + "\"></picture>"
            img.after(html);
            img.remove();
        }
    }
    isRewrite && (ctn = $.html());
    return ctn;
}

module.exports = function (content, file, settings) {
	console.log(file)
	let ctn = content;
	if(utils.isHtml(file.rExt)){
		ctn = parseHtml(content, file, settings);
	}else if(utils.isScss(file.rExt)){
		console.log('scss...')
	}
	return ctn;
}