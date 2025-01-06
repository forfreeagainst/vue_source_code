# 未分类

定义： 将源代码用树状结构来表示

## 阅读思路

1. 看package.json

2. monorepo项目的package/包

```md
compiler-core: !imporant,将字符串转换为抽象语法树
compiler-dom:Dom的实现
compiler-sfc: .vue文件的实现
compiler-ssr:
dts-test
reactivity: 负责Vue3中响应式的实现
reactivity-transform:
runtime-core: 运行的核心流程，包括初始化流程和更新流程
runtime-dom:Vue3靠虚拟DOM实现跨平台能力，runtime-dom提供一个渲染器，可渲染虚拟dom节点到指定容器
runtime-test:
server-renderer:服务端渲染实现
sfc-playground:
shared: package之间共享的工具库
size-check:
template-explorer:
vue:
vue-compat:
```

compiler-core和runtime-core区别？

* compile time我的理解是把写好的源代码转换成浏览器能识别的.html文件。
* run time： 程序编译之后，打开程序到程序关闭这段时间的系列处理。

3. 
