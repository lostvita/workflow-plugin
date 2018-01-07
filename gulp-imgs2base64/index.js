/**
 * @func     gulp插件之base64图片处理
 * @author   寒影
 * @date     2016-07-19
 * @version  1.0
 */

'use strict';

const fs         = require('fs'),
    path         = require('path');

const cheerio      = require('cheerio'),

    // through2 是一个对 node 的 transform streams 简单封装
    through      = require('through2'),
    gutil        = require('gulp-util'),
    he           = require('he'),  // 解决cheerio中文被转码问题
    PluginError  = gutil.PluginError;

// 插件名定义
const PLUGIN_NAME = 'gulp-imgs2base64';

/**
 * 图片转化为base64格式
 * @param  {Object} options{
 *         size: 3000,
 *         baseUrl
 * }
 * @return {[type]}         [description]
 */
module.exports = function(options) {
    if (!options.baseUrl) throw new PluginError(PLUGIN_NAME, 'Missing baseUrl param!');
    if (!options.size) throw new PluginError(PLUGIN_NAME, 'Missing size param!');

    // 创建一个让每个文件通过的 stream 通道
    return through.obj(function(file, enc, done) {
        if (file.isNull()) {
            done(null, file);   // 返回空文件
        }

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return done();
        }
        if (file.isBuffer()) {
            var ext = path.parse(file.path).ext; // 获取文件格式
            if(ext == '.html' || ext == '.htm' || ext == '.tpl'){
                file.contents = Controler.parseHtml(file,options);
            }else if(ext == '.css' || ext == '.scss' || ext == '.js'){
                Controler.parseCss(file,options);
            }
        }

        // 确保文件进去下一个插件
        done(null, file, enc);
    });
}

var Controler = {
    /**
     * 解析html文件中的图片
     * @param  {[type]} file    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    parseHtml:function(file, options){
        var contents = file.contents.toString("utf8");  // buffer转utf8
        var $ = cheerio.load(contents);
        var $imgs = $("img");

        for (var i = 0; i < $imgs.length; i++) {
            var $img = $($imgs[i]);

            // 路径处理
            let prevSrc = $img.attr('src').split(':').reverse()[0];  // 切除协议端口等
            let src = prevSrc.slice(prevSrc.indexOf('/') + 1);

            if(!src) continue;
            src = path.join(options.baseUrl, src);

            // 获取本地要base64编码的图片信息
            var stat = fs.statSync(src);
            var ext = path.parse(src).ext; // 获取图片格式

            if (stat.size <= options.size) {
                var head = ext === ".png" ? "data:image/png;base64," : "data:image/jpeg;base64,";
                var datauri = fs.readFileSync(src).toString("base64");
                $img.attr("src", head + datauri)
            }
        }
        return new Buffer(he.decode($.html()));
    },

    /**
     * 解析css文件中的图片
     * @param  {[type]} file    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    parseCss:function(file, options){
        let me = this;
        var contents = file.contents.toString("utf8");  // buffer转utf8
        contents.replace(/url\([\'\"](\S+)[\'\"]\)/g,function(str,src){
            src = src.split(')')[0];

            // 路径处理
            let prevSrc = src.split(':').reverse()[0];  // 切除协议端口等
            let localSrc = prevSrc.slice(prevSrc.indexOf('/') + 1);

            localSrc = path.join(options.baseUrl, localSrc);
            fs.stat(localSrc, (err,stats) => {
                if(err) return;
                let ext = path.parse(localSrc).ext; // 获取图片格式
                if(stats.size <= options.size){
                    var head = ext === ".png" ? "data:image/png;base64," : "data:image/jpeg;base64,";
                    var datauri = fs.readFileSync(localSrc).toString("base64");
                    var srcReg = new RegExp(src, "g");
                    contents = contents.replace(srcReg,head+datauri);
                    file.contents = new Buffer(contents);   // 重新写回buffer
                }
            });
        });
    }
}
