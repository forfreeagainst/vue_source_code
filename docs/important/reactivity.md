```
function targetTypeMap(rawType) {
    switch (rawType) {
        case "Object":
        case "Array":
        return 1 /* COMMON */;
        case "Map":
        case "Set":
        case "WeakMap":
        case "WeakSet":
        return 2 /* COLLECTION */;
        default:
        return 0 /* INVALID */;
    }
}

关键词：
createReactiveObject
createRef、RefImpl
new Dep()
```

`data init` 是在生命周期 `created` 之前的操作，会对 `data` 绑定一个观察者 `Observer`，之后 `data` 中的字段更新都会通知依赖收集器`Dep`触发视图更新

- `Object.definedProperty` 是劫持对象的属性，新增元素需要再次 `definedProperty`。而 `Proxy` 劫持的是整个对象，不需要做特殊处理

自己的理解：
使用defineProperty，就可以在对象被读取或修改的时候，做一些事情。如通知视图更新等。（重写对象属性的修改和读取）
defineProperty是对对象的现有单个属性的改装，Proxy是通过创建一个代理对象，这个代理对象拥有原有对象的所有功能，还拥有一些独特改装。
Proxy不兼容IE,

```
const data = {name: '罗霜',age: 18};
const proxy = new Proxy(data, {
    set(val){
    },
    get(){
    }
})

说明Vue传入的data选项，其实是交给了一个代理对象，这个代理对象不仅拥有data的所有，甚至能做更多事情。
```

defineProperty不适合对数组的每一项进行监听，数组中的成员有很多（10000w条数据），就会浪费性能。

dep是类吧
target,
depend();//收集依赖
notify();//通知视图更新

校验器：
条件，结果（true/false）， 后续处理不放在这里

- 共同点：集合、字典都可以存储不重复的值
- 不同点：集合是以[值，值]的形式存储元素，字典是以[键，值]的形式存储

> 集合，是由一堆无序的、相关联的，且不重复的内存结构【数学中称为元素】组成的组合

-字典（dictionary）是一些元素的集合。每个元素有一个称作key 的域，不同元素的key 各不相同

createApp 返回的是一个应用实例
defineComponent像一个渲染函数
h 返回一个虚拟节点
虚拟节点vNode, vNode本质是一个对象。

$nextTick是一个异步任务。
`vue` 中我们改变数据时不会立即触发视图，如果需要实时获取到最新的`DOM`，这个时候可以手动调用 `nextTick`

- 编译时，就是将 xxx.vue 进行解析，解析生成对应 js 可运行代码
- 运行时，就是将编译时生成的代码进一步处理，关于生命周期的声明、watch

对外统一口径，设计一致化的API
策略模式处理多场景

```
function elementIsVisibleInViewport(el) {
    const { top, left, bottom, right } = el.getBoundingClientRect();
    const { innerHeight, innerWidth } = window;
    return (top > 0 && top < innerHeight || bottom > 0 && bottom < innerHeight) && (left > 0 && left < innerWidth || right > 0 && right < innerWidth);
}
```
