﻿// config.js和config.ts 有差别。用config.js，import这个不认识，忒奇怪了
// lang:配制了，依然繁体字，删除文件，重新再写内容
// 首页.md配制home: true,就能把侧边栏消掉。选择导航栏的内容，才会把侧边栏显示出来。
// bash命令要从node环境切到bash环境才能使用
// 自动化脚本（bash有npm run docs:build，package.json的docs:build的用处），
// 是把打包后的产物提交到仓库。
// 代码和打包后的代码是两个分支。
import { defineConfig4CustomTheme, UserPlugins } from 'vuepress/config';

export default defineConfig4CustomTheme({
  locales: {
    '/': {
      lang: 'zh-CN',
      title: '***文档说明',
      description: 'VuePress静态资源站点模板',
    },
  },
  base: '/vue_source_code/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/README.md' },
      {
        //导航栏和侧边栏的字段属性不一样
        text: '模板目录',
        items: [{ text: '测试用例', link: '/demo/test.md' }]
      }
    ],
    sidebar: [
      {
        title: '模板目录',
        children: [{ title: '测试用例', path: '/demo/test.md' }]
      },
    ],
    logo: '/img/logo.png',
    repo: 'forfreeagainst/vue_source_code',
    searchMaxSuggestions: 10,
    docsDir: 'docs',
    footer: {
      createYear: 2024,
      copyrightInfo:
        'vue_source_code | <a href="https://github.com/forfreeagainst/vue_source_code" target="_blank">github</a>',
    },
    extendFrontmatter: {
      author: {
        name: 'durant',
        link: 'https://github.com/forfreeagainst/vue_source_code',
      },
    },
  },
  head: [
    ['link', { rel: 'icon', href: '/img/logo.png' }],
    [
      'meta',
      {
        name: 'keywords',
        content: 'VuePress静态资源站点模板',
      },
    ],
  ],
  plugins: <UserPlugins>[
    [
      'one-click-copy',
      {
        copySelector: ['div[class*="language-"] pre', 'div[class*="aside-code"] aside'],
        copyMessage: '复制成功',
        duration: 1000,
        showInMobile: false,
      },
    ],
    [
      'vuepress-plugin-zooming',
      {
        selector: '.theme-vdoing-content img:not(.no-zoom)',
        options: {
          bgColor: 'rgba(0,0,0,0.6)',
        },
      },
    ],
  ],
  extraWatchFiles: ['.vuepress/config.ts'],
});