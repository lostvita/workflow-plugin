#### fis3-command-copy

该插件是对目录文件进行复制，复制的类型包含四种：全部文件（可配置排除目录）、公共目录&文件，单一文件、唯一性标识。

说明：唯一性标识的位置是结合三七互娱海外前端fis3自动化工作流的架构设计的，其他类型的架构不依赖该架构

#### Install

```shell
npm install fis3-comman-copy --save-dev
```

#### Usage

```json
{
	"use": ["COMMON"],

	"gitlabPath": "",

	"UNIQUE":{
		"gameId": "gm_platform",
		"eventId": "dwj_2017"
	},

	"COMMON":{
		"FILES":[
			"./static/readme.md"
		],
		"DIRS":[
			"./static/fonts/",
			"./static/js/libs"
		]
	},

	"ONE": "./package.json",

	"ALL": {
		"exclude": ["node_modules", "_temp", "output", "test", "widget"]
	}
}
```

说明：该插件依赖一份配置文件，配置文件格式（JSON）如上，其中：

- use：配置复制使用的类型，即UNIQUE、COMMON、ONE、ALL
- gitlabPath：复制文件的目标目录
- UNIQUE：根据标识做唯一性复制

执行命令进行复制：

```shell
fis3 copy --conf './yourCopyConfig.json'
```

