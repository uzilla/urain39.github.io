---
title: repo命令的使用
date: 2017-10-13
layout: post
guid: urn:uuid:095ce415-9a57-4396-9144-16aefc14e734
tag:
    - repo
    - android
    - github
    - 随手笔记
---

# 前言废话

> 手里的m3s最近被大神移植了aosp，所以现在想试试用patchrom适配miui。但是完事总有不如意的时候，repo命令不能使用……奇怪的是git命令能用，而且repo是基于git写的Python脚本的啊！当我打开repo看见REPO\_URL的时候瞬间明白了……  

在REPO_URL的前十行代码里REPO\_URL的地址依然使用的是谷歌的地址，不过好处是他会检测你是否设置了环境变量，如果有那么就不会使用默认的。

````python
#!/usr/bin/env python2

# repo default configuration
#
import os
REPO_URL = os.environ.get('REPO_URL', None)
if not REPO_URL:
  REPO_URL = 'https://gerrit.googlesource.com/git-repo'
REPO_REV = 'stable'
````

参考网上的教程我们可以设置一个全局变量：

````bash
export REPO_URL='https://aosp.tuna.tsinghua.edu.cn/git-repo'
````

当然你经常使用的话记得放到~/.bashrc里方便下次自动加载。

参考：http://blog.csdn.net/shenlan18446744/article/details/51490560
