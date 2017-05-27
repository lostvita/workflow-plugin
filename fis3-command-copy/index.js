const fs          = require('fs');
const gulp        = require('gulp');

exports.name = 'copy';
exports.desc = '统一静态资源域到目的events域的文件复制程序';
exports.options = {
     '-h, --help': 'print this help message',
     '--conf'   : '复制程序依赖的配置文件'
};

const Util = {
    _root: __dirname.split('node_modules')[0],

    isExclude: function(id,excludes){
        let flag = false; 

        for(let i=0,l=excludes.length; i<l; i++){
            if(excludes[i] == id){
                flag = true;
                break;
            }
        }

        return flag;
    },

    // 读取某个目录
    readDirectory: function(path){
        return new Promise((resolve, reject) => {
            fs.readdir(path, (error, data) => {
                if (error) reject(error);
                resolve(data);
            });
        });
    },

    /**
     * 判断是否为目录
     * @param  {[type]}  path [description]
     * @return {Boolean}      [description]
     */
    isDirectory: function(path){

        return new Promise((resolve, reject) => {

                fs.stat(path, (err, stats) => {

                    if(stats && stats.isDirectory()){
                        resolve(true);
                    }else{
                        resolve(false);
                    }
                });

        });
    },

    copy: function(type, opts, aimPath){
        switch(type){
            case 'UNIQUE': {
                this.copyUnique(opts,aimPath);
                break;
            }
            case 'ONE': {
                this.copyOne(opts,aimPath);
                break;
            }
            case 'COMMON': {
                this.copyCommon(opts,aimPath);
                break;
            }
            case 'ALL': {
                this.copyAll(opts,aimPath);
                break;
            }
            default: {
                this.copyUnique(opts,aimPath);
            }
        }
    },

    /**
     * 根据位移标识进行复制
     * @param  {[type]} opts    [description]
     * @param  {[type]} aimPath [description]
     * @return {[type]}         [description]
     */
    copyUnique: function(opts,aimPath){
        if(!opts || !opts.gameId || !opts.eventId){
            throw new Error("配置文件「gameId或eventId」参数错误！");
        }

        let dirs = ['html', 'img', 'js', 'scss'];
        dirs.map((dir) => {
            let common = 'static/' + dir + '/' + opts.gameId + '/' + opts.eventId;
            let rSrc = this._root + common,
                target = aimPath + common;
            fis.log.info("[COPY] " + common + " >> " + target);
            gulp.src(rSrc + '/**/*')
                .pipe(gulp.dest(target));
        });
    },

    /**
     * 复制某个文件
     * @param  {[type]} opts    [description]
     * @param  {[type]} aimPath [description]
     * @return {[type]}         [description]
     */
    copyOne: function(opts,aimPath){
        let file = opts && opts.split('./').reverse()[0],
            last = file.lastIndexOf('/'),
            dir = null;

        let rSrc = this._root + file,
            target = aimPath;

        if(last != -1){
            dir = file.slice(0,last);
        }
        
        if(dir){
            target = aimPath + dir;
        }
        fis.log.info("[COPY] " + file + " >> " + target);
        gulp.src(rSrc)
            .pipe(gulp.dest(target));
    },

    /**
     * 全部复制
     * @param  {[type]} opts    [description]
     * @param  {[type]} aimPath [description]
     * @return {[type]}         [description]
     */
    copyAll: function(opts,aimPath){
        let excludes = opts.exclude;
        let dirs = [];
        this.readDirectory(this._root).then((res) => {
            let len = res.length - 1;
            var rst = res.map((item, index) => {
                if(!this.isExclude(item,excludes)) {
                    let path = this._root + item;

                    this.isDirectory(path).then((flag) => {
                        flag && dirs.push(item);
                        if(index == len){
                            dirs.map((dir) => {
                                let rSrc = this._root + dir + '/**/*',
                                    target = aimPath + dir;
                                gulp.src(rSrc)
                                    .pipe(gulp.dest(target));
                                fis.log.info("[COPY] " + dir + " >> " + target);
                            })
                        }
                    });
                }
            })
        });

        // 复制根目录
        let src = [this._root + '{,*}.*'];
        gulp.src(src)
            .pipe(gulp.dest(aimPath));
        fis.log.info("[COPY] " + src + " >> " + aimPath);
    },

    /**
     * 公共复制
     * @param  {[type]} opts    [description]
     * @param  {[type]} aimPath [description]
     * @return {[type]}         [description]
     */
    copyCommon: function(opts,aimPath){
        let files = opts.FILES;
        files.map((file) => {
            this.copyOne(file, aimPath);
        });

        let dirs = opts.DIRS;
        dirs.map((dir) => {
            let handDir = dir.split('./').reverse()[0];
            let path = this._root + handDir;
            this.isDirectory(path).then((flag) => {
                if(!flag) return;
                let rSrc = this._root + handDir + '/**/*',
                    target = aimPath + handDir;
                gulp.src(rSrc)
                    .pipe(gulp.dest(target));
                fis.log.info("[COPY] " + handDir + " >> " + target);
            });
        })
    }
}

exports.run = function(argv, cli) {
    // 如果输入为 fis3 foo -h
    // 或者 fis3 foo --help
    // 则输出帮助信息。
    if (argv.h || argv.help) {
        return cli.help(exports.name, exports.options);
    }
    if(!argv.c && !argv.conf || typeof argv.conf == 'boolean' || typeof argv.c == 'boolean'){
        throw new Error("请在命令行输入配置文件路径，fis3 copy -c 'path...'");
    }

    let _root = __dirname.split('node_modules')[0],
        conf = argv.c || argv.conf,
        confPath = _root + conf.split('./').reverse()[0];

    let config = null;
    try{
        config = require(confPath);
    }catch(err){
        let errMsg = "配置文件：" + confPath + "不存在！";
        fis.log.error("【错误】" + errMsg);
        throw new Error(err);
    }

    let gitPath = config.gitlabPath;
    if(!gitPath){
        throw new Error("缺少Gitlab Path！");
    }

    let types = config.use;
    types.map(function(val){
        Util.copy(val, config[val],gitPath);
    });
};