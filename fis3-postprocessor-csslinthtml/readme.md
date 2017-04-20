### Fis3-postprocessor-csslinthtml

fis3-postprocessor-csslinthtml插件是通过css高级选择器去校验html代码的语义化和规范化，目前该插件支持3种规范程度的校验。分别为：errors、warns和advices。

### Install

```
npm install fis3-postprocessor-csslinthtml --save-dev
```

说明，该插件依赖于cheerio和he模块，安装插件的同时需要安装这两个模块：

```
npm install cheerio he --save-dev
```

### Usage

```javascript
fis.match('/html/**/*.html', {
    postprocessor:[fis.plugin('csslinthtml',{
        useCssLint: true,
        type:["errors"], // 类型：errors、warns、advices
        lint:["//www.example.com/static/css/csslint/errors.css"] // css检测规则样式表
      })
    ]
});
```

- useCssLint ：设置为false则关闭该功能
- type：设置检测的类型，目前支持errors、warns和advices
- lint：css检测样式表，插件默认为该三种检测类型映射了检测样式表，用户可以不再设置。如果用户想要使用自己的检测规则，则在这里填写样式表的超链接。

> 注意：type跟lint的位置要互相对应

### Role

> 这里的检测规则引用的是[a11y.css](http://ffoodd.github.io/a11y.css/index.html)，同时推荐html检测的chrome插件[可以检查html代码的chrome扩展](https://zhuanlan.zhihu.com/p/26268863)



