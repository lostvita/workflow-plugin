#### fis3-postprocessor-webp

> 标准化后处fis3理插件（postprocessor阶段），可以针对html和scss文件中带"?__webp"后缀的图片webp化.

该插件完成的工作主要有两点：

- 识别出文件中带?__webp后缀的图片链接并将其转化成webp格式图片
- 兼容代码的处理：

  1.在html中：一是在head标签内插入webp的script兼容检测脚本，二是替换img为picture标签

  2.在scss中（实际是在css中）：复写webp图片的引用类，使得样式表中优先加载webp格式图片

**该插件目前仅支持png和jpg格式图片的webp化**

#### Install

```
$ npm install fis3-postprocessor-webp -g --save-dev
```

#### Usage

```
// fis-conf.js 配置表
postprocessor: [
  fis.plugin('webp',{
  quality: 50
  })
]

// html中使用
<img src="/static/img/yhjy/btn-sign.png?__webp" alt="">

// scss中使用
background: url($imgURL + "btn-sign.png?__webp") no-repeat top center;
```

#### API

```
fis.plugin('webp',[options])
```

**Options**

- quality
- preset
- alphaQuality
- method
- size
- sns
- filter
- autoFilter
- sharpness

含义参考 [google cwebp api](https://developers.google.com/speed/webp/docs/cwebp)