# Vue源码实现

npm install pnpm -g 

pnpm init

当 shamefully-hoist 设置为 true 时，pnpm 会尝试模仿传统的 npm 和 yarn 行为，将所有依赖项都安装在项目的根 node_modules 文件夹中，而不是将它们分散到各个子文件夹中。 这通常是为了解决某些与路径解析或特定工具集成相关的问题。 然而，需要注意的是，使用 shamefully-hoist 可能会失去 pnpm 的主要优势之一，即节省磁盘空间。

pnpm install vue@3.4.0 -w
-w根目录

minimist 解析命令行参数 

 pnpm install typescript esbuild minimist -D -w

配制workspace （pnpm-workspace.yaml）
packages:
  - "packages/*"

pnpm tsc --init 或者npx tsc --init 找到node_modules的.bin下的tsc

```md
{
  "compilerOptions": {
    "outDir": "dist",//输出的目录
    "sourceMap": true,//采用sourcemap
    "target": "es2016",//目标语法
    "module": "esnext",//模块格式
    "moduleResolution": "node",//模块解析方式
    "strict": false,//严格模式
    "resolveJsonModule": true,//解析json模块
    "esModuleInterop": true,//允许通过es6语法引入commonjs模块
    "jsx": "preserve",//jsx 不转义
    "lib": ["esnext", "dom"] //支持的类库 esnext及dom
  }
}
```

不能再node环境使用esModule语法
package.json 添加 type: "module"

```md
//以这个文件为基准，定义包的路径
"baseUrl": ".",
"paths": {
  "@vue/*": ["packages/*/src"]
}
```

```
加workspace不让它以为第三方的包
pnpm install @vue/shared --workspace --filter @vue/reactivity
```

reactivity :
不能被重复代用，已经代理过了
eg: 重复代用
const obj = {name:'durant', age: 35}
const state1 = reactive(obj);
const state2 = reactive(obj);
eg: 已经代理过了。需要重新理解
const song = {song:'沦陷'};
const state1 = reactive(song);
const state2 = reactive(state1);
