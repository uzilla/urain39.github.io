---
title: 'GNU tar与Busybox tar区别'
date: 2017-10-24
layout: post
guid: urn:uuid:c8ce4153-1f8b-4661-bcfe-178ed3f05633
tags:
    - 学习笔记
    - shell
    - Linux
    - tar
---

gnu tar与busybox tar不一样。gnu tar在带--exclude参数时目录必须放在最后，而busybox tar无限制。当然为了兼容二者推荐还是使用gnu tar的用法。难得一次我觉得精简的busybox工具里的命令比GNU的命令好用……

现在目录结构如下：

```sh
$ ls -R test
test:
a  b  c  d  e  f  g  h
$
```

我们现在的需求是tar打包排除掉g目录。


命令：tar -czvf test.tar.gz --exclude ./test/g test  
结果：失败，g依然被打包

命令：tar -czvf test.tar.gz --exclude test/g test  
结果：成功，g没有被打包 (2017.10.26修改)

命令：busybox -cvf test.tar.gz --exclude=./test/g test  
结果：失败，g依然被打包

命令：tar -czvf test.tar.gz --exclude=./test/g test  
结果：失败，g依然被打包

命令：tar -czvf test.tar.gz --exclude=test/g test  
结果：成功，g没有被打包

命令：tar -czvf test.tar.gz test --exclude=test/g  
结果：在busybox tar下成功，gnu tar下失败。

结论：在GNU tar下，目录必须放在最后，否则会忽略掉--exclude参数。不过如果第一个--exclude在目录前，那么目录后的---exclude参数不会被忽略掉。为兼容两者，推荐还是把目录放在最后一个参数。（迷の命令
