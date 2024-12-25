#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

git pull origin main
git add .
git commit -m "docs: 修改Vue源码阅读文档"
git push origin main
