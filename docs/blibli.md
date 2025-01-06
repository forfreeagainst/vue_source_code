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

不能在node环境使用esModule语法
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
const song = {song:'进阶'};
const state1 = reactive(song);
const state2 = reactive(state1);

Proxy, Reflect（调取对象的基本方法，receiver改变this指向）

核心代码：effect类， 用于依赖收集，触发（页面）更新

```md
effect(函数，选项)
effect的函数本身调用一遍。effect是一个类。
{
  active: 
  fn: effect中的函数
  scheduler: 
}

html:
activeEffect: 当前执行上下文的effect。
effect(() => {
  app.innerHTML = `姓名${state.name}`;
  effect(() => {
    state.name = 'durant123'
    app.innerHTML = `姓名${state.name}`;
  })
})
```

关键代码，依赖收集（让响应式属性和effect映射起来）

```md
track: 一个大的WeackMap ，内含Map,又含Map
Map : {obj : {属性： Map: {effect, effect} } } 

effect自身调用，发现state.name/state.age, 进行依赖收集，
effect(() => {
  app.innerHTML = `姓名${state.name} 年龄${state.age}`;
})

// effect，才会被数据收集，trigger发现被收集了，触发更新。（数据变化了，触发更新/调用trigger）
setTimeout(() => {
  state.age = 999;
})
```

effect的延伸：不同条件依赖不同（重新收集依赖）,存在相同依赖， 依赖减少了

```md
// {obj: { flag: {effect}, {name: {effect} } }
// {obj: { flag: {effect}, {age: {effect} } }

effect(() => {
  app.innerHTML = state.flag ? state.name + state.name: state.age;
})
setTimeout(() => {
  state.flag = false;
  setTimeout(() => {
    state.name = 'james';//这里需要effect
  }, 1000)
}, 1000)

// {flag,name}
// {flag,age}
简易diff算法

_trackId 用于记录执行次数，防止一个属性在当前effect中多次依赖收集

// {flag,name,age,year}
// {flag}
```

effect的选项options

scheduler调用run,想晚点调用run(AOP编程/面向切面编程，在原有的逻辑，增加自己的逻辑)

```md
let runner = effect(
  () => {
    app.innerHTML = state.flag ? state.name : state.age;
  },
  {
    scheduler: () => {
      console.log("数据更新了，不直接渲染，走一下自己的逻辑先");
      runner(); //重新渲染
    }
  }
)
```

effect的优化：防止递归，深度代理

```md
//防止递归
effect(() => {
  app.innerHTML = state.name;
  state.name = Math.random();//更新了数据，不要再执行effect了。effect加个_running正在执行的逻辑
})
//深度代理
effect(() => {
  state.info.address = '北京天安门';
})
```

ref

```md
const flag = ref(false); //wrap,包了一层，因为对象在访问属性的时候，可以进行拦截
effect(() => {
  app.innerHTML = flag.value;
})
let flag1 : {
  _value: false,
  set() {},
  get() {}
}

class RefImpl {
  __v_isRef = true;//增加ref标识
  _value; //用来保存ref的值
  constructor(public rawValue) {} //public会在实例上增加一个属性
  set() {}
  get() {}
}
```