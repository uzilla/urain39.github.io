---
title: "Python使用中的一些坑"
date: 2018-10-28
layout: post
tags:
  - Python
  - 编程语言
  - 装饰器
  - Python继承
---

> 这几天因为想把KngetPy与KngetPyX模块化后实现最小化的维护成本倒是踩了不少坑。涉及到Python进阶编程的一些知识，好在最后大多数都完美解决或部分解决了。然后赶在10月末尾把这个月的的博客也补上吧。




## 装饰器 ##

前面讲过一些装饰器的基本原理与实现方法，但是因为比较懒的原因没有写完整。而正是因为我懒丢弃的一部分让我最近尝到了苦头——一个修饰方法的函数调试了一下午。今天正好配合今天遇到的关于继承相关的知识一起写进这篇博客里。



### 简单的装饰器 ###

回顾我们之前讲的不带参数的最简单的装饰器实现方法可以只使用两层函数(一层闭包)就可以实现

```python
def log(fn):
  def wrapped_fn(*args, **kwargs):
    print("Invoke {0}, with args: {1}, kwargs {2}".format(
          fn.__name__, args, kwargs))
    result = fn(*args, **kwargs)
    print("Result: {0}".format(result))
  return wrapped_fn

@log
def f(x): return x >> 2

# >>> f(3)
# Invoke f, with args: (3,), kwargs {}
# Result: 0
# >>>
```

当我们使用`@`修饰`f()`函数后直接调用函数f其实相当于`log(f)(x)`，其中`f()`作为回调函数传入装饰器`log()`中然后被闭包函数`wrapped_fn()`装饰以后返回给主线程调用。这个过程应该非常好理解，因为偶尔我们也会用到使用回调函数实现类似装饰器的一些用法。

**注意：但这并不是最简单的装饰器！**

下面这段话可能会对你深入了解装饰器有帮助

> 装饰器的本质是在不改变函数或方法的同时为方法添上新的功能，所以只要最终返回的结果是可调用对象(哪怕你只是直接返回回调本身好)即可被定义为装饰器。

```python
def log(fn):
    return fn

@log
def f(): pass
```
↑ 以上才是最简单的装饰器 ↑


### 较为复杂的装饰器 ###

上面的装饰器是最简单的装饰器实现，而通常我们见到的装饰器并非像上面这样的装饰器，而是更加复杂带参数的装饰器，比如我之前写的一个`@command.register()`装饰器：

```python
    def register(self, argtypes=r'M', help_msg=None):
        """Register a method to a command.
        NOTE: Method registered here is unbound method,
              e.g. registered `run` command -> `KngetShell.run`
              So we call it should add `self` at first.
            See also: KngetShell.execute()
        :param argtypes: a str of the command args type.
            M: Myself -> self
            S: String -> str
            I: Integer -> int
        :param help_msg: a short help string of commands.
        :return: a callable function or method.
        """

        def format_args(method):
            def wrapped_method(*args, **kwargs):
                if len(args) != len(argtypes):
                    raise KngetError("args count is not equals to argtypes count.")

                # NOTE: We cannot modify the args.
                argv = []
                for i in range(len(argtypes)):
                    if argtypes[i] in ('m', 'M'):
                        argv.append(args[i])
                    elif argtypes[i] in ('i', 'I'):
                        argv.append(int(args[i]))
                    elif argtypes[i] in ('s', 'S'):
                        argv.append(str(args[i]))

                return method(*argv, **kwargs)

            self._commands[method.__name__] = (
                wrapped_method, help_msg
            )
            return wrapped_method

        # format_args first touch the method
        return format_args
```

与其他装饰器不同的是我实现的装饰器并非使用函数实现而是使用方法单独实现的，但本质上两者并没有什么区别。使用类保存装饰器只是为了更好的管理装饰器，此外使用`@KngetCommand.register()`可读性会有很大的提升。

```python
        def format_args(method):
            self._commands[method.__name__] = (
                method, help_msg
            )
            ...
```



在方法`KngetCommand.register()`中我们可以看到其中有一个名为`format_args()`的闭包函数含有一个名为`method`的参数，这个参数其实就是我们传入的真实方法。外部的方法`@KngetCommand.register()`则只是用来处理外部调用传递给我们的参数返回一个合适的装饰器。而`format_args()`就是这个被返回真正的装饰器。


使用这个装饰器的方法只需`@KngetCommand.register(参数列表...)`即可。装饰器的调用过程与无参数装饰器类似，假设我们用来修饰一个名为`Knget.run()`的方法那么这个装饰器的执行过程应该为`KngetCommand.register`载入参数后返回`format_args()`装饰器装饰`Knget.run()`，并将装饰好的函数`wrapped_method`结果赋值于`Knget.run()`。

**注意：装饰器在函数或方法声明以后就已经装饰完毕了！**原有的方法被`wrapped_method`所代替，这一点可以在help函数时看到。但是从内存模型的角度来讲因为Python的无(标识符)引用则删除的GC机制，方法本身则在`wrapped_method`中找到类新的标识符，所以并不会真的被删除。

```
 |  ----------------------------------------------------------------------
 |  Methods inherited from knget.base.KngetShell:
 |  
 |  debug = wrapped_method(*args, **kwargs)
 |  
 |  execute(self, lineno, cmd_name, args)
 |  
 |  exit = wrapped_method(*args, **kwargs)
 |  
 |  help = wrapped_method(*args, **kwargs)
 |  
 |  login = wrapped_method(*args, **kwargs)
 |  
 |  reload = wrapped_method(*args, **kwargs)
 |  
 |  run = wrapped_method(*args, **kwargs)
 |  
 |  runcmd = wrapped_method(*args, **kwargs)
 |  
 |  session(self)
 |  
 |  ----------------------------------------------------------------------
```

此外如果不喜欢多层嵌套的闭包函数定义，也可以单独定义装饰器然后使用装饰器处理函数直接返回。


**WARNING: 以下内容如果你并没有遇到过或者看不懂请直接忽略，因为很大可能只是我个人造成的问题。**

值得注意的是如果你真的像我这样做了那么你可能会遇到一个问题，装饰后的方法可能会丢失掉`self`参数。这是理所当然的事，因为你可以在上面我写的英语文档里看到下面这样一句话：

> Method registered here is unbound method, e.g. registered \`run\` command -> \`KngetShell.run\`

注册的方法被保存在一个字典内，但实际上注册的方法依然是指向类方法本身即`KngetShell.run`所以调用时理所当然的就丢失了`self`参数。



## super()与继承 ##



Python中的`super()`可谓是神级的坑！在早期的版本中就不存在过`super()`这种操作！



以下内容引用自[jhao的博客](http://home.cnblogs.com/u/jhao/)

### 单继承时super()和__init__()实现的功能是类似的

```python
class Base(object):
    def __init__(self):
        print 'Base create'

class childA(Base):
    def __init__(self):
        print 'creat A ',
        Base.__init__(self)


class childB(Base):
    def __init__(self):
        print 'creat B ',
        super(childB, self).__init__()

base = Base()

a = childA()
b = childB()
```

输出结果：

```shell
Base create
creat A  Base create
creat B  Base create
```

区别是使用super()继承时不用显式引用基类。

 

### super不是父类，而是继承顺序的下一个类

在多重继承时会涉及继承顺序，super()相当于返回继承顺序的下一个类，而不是父类，类似于这样的功能：

```python
def super(class_name, self):
    mro = self.__class__.mro()
    return mro[mro.index(class_name) + 1]
```

mro()用来获得类的继承顺序。
例如：

```python
class Base(object):
    def __init__(self):
        print 'Base create'

class childA(Base):
    def __init__(self):
        print 'enter A '
        # Base.__init__(self)
        super(childA, self).__init__()
        print 'leave A'


class childB(Base):
    def __init__(self):
        print 'enter B '
        # Base.__init__(self)
        super(childB, self).__init__()
        print 'leave B'

class childC(childA, childB):
    pass

c = childC()
print c.__class__.__mro__
```

输出结果如下：

```shell
enter A 
enter B 
Base create
leave B
leave A
(<class '__main__.childC'>, <class '__main__.childA'>, <class '__main__.childB'>, <class '__main__.Base'>, <type 'object'>)
```

super和父类没有关联，因此执行顺序是A —> B—>—>Base

执行过程相当于：初始化childC()时，先会去调用childA的构造方法中的 super(childA, self).\_\_init\_\_()， super(childA, self)返回当前类的继承顺序中childA后的一个类childB；然后再执行childB().\_\_init()\_\_,这样顺序执行下去。

在多重继承里，如果把childA()中的 super(childA, self).\_\_init\_\_() 换成Base.\_\_init\_\_(self)，在执行时，继承childA后就会直接跳到Base类里，而略过了childB：

```shell
enter A 
Base create
leave A
(<class '__main__.childC'>, <class '__main__.childA'>, <class '__main__.childB'>, <class '__main__.Base'>, <type 'object'>)
```

从super()方法可以看出，super()的第一个参数可以是继承链中任意一个类的名字，

如果是本身就会依次继承下一个类；

如果是继承链里之前的类便会无限递归下去；

如果是继承链里之后的类便会忽略继承链汇总本身和传入类之间的类；

比如将childA()中的super改为：super(childC, self).\_\_init\_\_()，程序就会无限递归下去。

> 这是我今天遇到的问题，所以我才写了这么一篇博客

如：

```
  File "C:/Users/Administrator/Desktop/crawler/learn.py", line 10, in __init__
    super(childC, self).__init__()
  File "C:/Users/Administrator/Desktop/crawler/learn.py", line 10, in __init__
    super(childC, self).__init__()
  File "C:/Users/Administrator/Desktop/crawler/learn.py", line 10, in __init__
    super(childC, self).__init__()
  File "C:/Users/Administrator/Desktop/crawler/learn.py", line 10, in __init__
    super(childC, self).__init__()
  File "C:/Users/Administrator/Desktop/crawler/learn.py", line 10, in __init__
    super(childC, self).__init__()
  File "C:/Users/Administrator/Desktop/crawler/learn.py", line 10, in __init__
    super(childC, self).__init__()
  File "C:/Users/Administrator/Desktop/crawler/learn.py", line 10, in __init__
    super(childC, self).__init__()
  File "C:/Users/Administrator/Desktop/crawler/learn.py", line 10, in __init__
    super(childC, self).__init__()
  File "C:/Users/Administrator/Desktop/crawler/learn.py", line 10, in __init__
    super(childC, self).__init__()
  File "C:/Users/Administrator/Desktop/crawler/learn.py", line 10, in __init__
    super(childC, self).__init__()
  File "C:/Users/Administrator/Desktop/crawler/learn.py", line 10, in __init__
    super(childC, self).__init__()
  File "C:/Users/Administrator/Desktop/crawler/learn.py", line 10, in __init__
    super(childC, self).__init__()
  File "C:/Users/Administrator/Desktop/crawler/learn.py", line 10, in __init__
    super(childC, self).__init__()
RuntimeError: maximum recursion depth exceeded while calling a Python object
```

### super()可以避免重复调用

**NOTE: 与上面的问题无关**

如果childA基础Base, childB继承childA和Base，如果childB需要调用Base的\_\_init\_\_()方法时，就会导致\_\_init\_\_()被执行两次：

```python
class Base(object):
    def __init__(self):
        print 'Base create'

class childA(Base):
    def __init__(self):
        print 'enter A '
        Base.__init__(self)
        print 'leave A'


class childB(childA, Base):
    def __init__(self):
        childA.__init__(self)
        Base.__init__(self)

b = childB()
```

Base的\_\_init\_\_()方法被执行了两次

```shell
enter A 
Base create
leave A
Base create
```

使用super()是可避免重复调用

```python
class Base(object):
    def __init__(self):
        print 'Base create'

class childA(Base):
    def __init__(self):
        print 'enter A '
        super(childA, self).__init__()
        print 'leave A'


class childB(childA, Base):
    def __init__(self):
        super(childB, self).__init__()

b = childB()
print b.__class__.mro()
enter A 
Base create
leave A
[<class '__main__.childB'>, <class '__main__.childA'>, <class '__main__.Base'>, <type 'object'>]
```

### 参考与引用 ###

- https://www.cnblogs.com/jhao/p/5972914.html
