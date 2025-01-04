# package.json

```package.json
  name: 项目名
  version: 项目版本号，（通常主版本号：大功能性改造，次版本号：新增新的工程，修订号：修订bug）
  description: 项目描述信息，便于用户理解项目的用途
  keywords: 是一个字符串组成的数组，便于用户在npm上搜索到我们的项目
  license: 项目许可证
  files:
  dependencies: ~修订号，^次版本号

  

  script: 脚本命令
  config: 脚本配制

  bin: 命令行工具入口
  main: 对应commonjs引入方式的程序入口文件
  module: 对应esmodule引入方式的程序入口文件
  types: 描述了程序中所有组件以及变量的类型定义
  exports: 
  unpkg:
  buildOptions: 
    name:
    formats

```

```常见命令
npm init 或npm init -y 默认生成package.json文件
npm view 包名  查看模块名是否重复，不重复提示404

```
