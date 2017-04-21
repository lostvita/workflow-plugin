let cheerio     = require('cheerio'),
    he          = require('he');

const utils = {
    state:{
        regxHtml: /^\.html/i,
        lintMap:{
        	"errors": "//events.gm99.com/static/scss/common/csslint/errors.css",
        	"warns": "//events.gm99.com/static/scss/common/csslint/warns.css",
            "advices": "//events.gm99.com/static/scss/common/csslint/advices.css",
        	"obsoletes": "//events.gm99.com/static/scss/common/csslint/obsoletes.css"
        }
    },

    isHtml: function(str){
        return this.state.regxHtml.test(str);
    },

    linter: function(settings){
        let rst = '',
        	types = settings.type,
        	lints = settings.lint || [];

        for(let i=0,l=types.length; i<l; i++){
        	if(types[i]){
        		let url = lints[i] ? lints[i] : utils.state.lintMap[types[i]];
        		rst += url ? "<link rel=\"stylesheet\" type=\"text/css\" href=\""+ url +"\">" : '';
        	}
        }

        return rst;
    }
}

// 解析html模板
const parseHtml = function(content, file, settings){
    let _root = file.dirname.split('/static')[0];
    let ctn = content,
        $ = cheerio.load(ctn),
        headEl = $('head');

    let css = utils.linter(settings);
    headEl.append(css);

    ctn = he.decode($.html());
    return ctn;
}


module.exports = function (content, file, settings) {
	let ctn = content;

    if(settings.useCssLint && utils.isHtml(file.rExt)){
        ctn = parseHtml(content, file, settings);
    }
    return ctn;
}