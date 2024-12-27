# 文件介绍

## codeframe方法：传入字符串，开始位置，结束位置

```返回结果
1 | abcde
  |  ^^
2 | 234242
3 | adsfasd
```

## domAttrConfig:dom的属性配制

## domTagConfig: dom的标签配制

## escapeHTML: 转义html (eg:去除html注释、特殊符号&等转字符串、css等)

## general: 通用的方法或变量

```ts
export const def = (
  obj: object,
  key: string | symbol,
  value: any,
  writable = false,
): void => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable,
    value,
  })
}
```

## globalsAllowList: 全局允许的变量

## index.ts 将所有的工具库，全都于此暴露

## looseEqual: 不严格相等

## makeMap: 返回匿名函数：传入一个字符串，判断字符串是否在对象里

```ts
function makeMap(str: string): (key: string) => boolean {
  const map = Object.create(null)
  console.log(map);
  for (const key of str.split(',')) map[key] = 1
  return val => val in map
}

console.log(makeMap('do,you,have,adateforthispartyyet')('do'));
```

`返回一个匿名函数。调用匿名函数，传入字符串，得到布尔值。do是逗号分隔的其中一个。map是一个对象，属性 in 对象`

```md
解析：
const obj = {a: 33};
'a' in obj;
//为true

Object.create(null); 已现有对象为原型，创建一个新的对象
```

```ts
const person = {
  isHuman: false,
  printIntroduction: function () {
    console.log(`My name is ${this.name}. Am I human? ${this.isHuman}`);
  },
};

const me = Object.create(person);

me.name = 'Matthew'; // "name" is a property set on "me", but not on "person"
me.isHuman = true; // Inherited properties can be overwritten

me.printIntroduction();
// Expected output: "My name is Matthew. Am I human? true"
```

## normalizeProp: 跟style有关

```md
hyphenate: 连字符
```

## patchFlags: 写了一个策略模式的对象

## shapeFlags: 一个枚举类

## slotFlags: 一个写了策略模式的对象

## toDisplayString

## typeUtils: 定义数据类型
