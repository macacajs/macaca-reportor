# 简介

Macaca Reporter 是具备较多实用功能的报告器，在测试过程中帮助组织和展示测试结果。展示模式支持链路树模式、脑图模式、全图模式和列表模式，下面依次介绍各模式的设计原则。

## 链路树模式

链路树模式是最常用的也是默认的展示模式，将用例的组织结构按照树来展示，通过 Macaca 的截图 API 能够在用例结束前自动产生截图，链路树模式方便还原业务产品的测试执行路径。

![](/macaca-reporter/assets/6d308bd9gy1g03hp2j3bwj21950u0h58.jpg)

## 脑图模式

脑图模式可以认为是全部用例的概览，这个视图更方便用户整理和组织用例，在改进、补充新用例前可作为分析依据。

![](/macaca-reporter/assets/6d308bd9gy1g03hp2nibhj21950u0wyf.jpg)

## 全图模式

全图模式提取了测试过程中的全部截图，更适用于偏渲染展示型的功能测试。在交付下一阶段前可以用做质量依据从而降低成本。但不建议每次通过人工看报告的形式来避免问题，推荐使用 [像素判断](https://macacajs.github.io/zh/guide/computer-vision.html#%E5%85%B6%E5%AE%83%E6%96%B9%E6%A1%88) 和异常捕获等自动化手段辅助断言当前渲染是否正常。

![](/macaca-reporter/assets/6d308bd9gy1g03hp2lea4j21950u0wyx.jpg)

![](/macaca-reporter/assets/6d308bd9gy1g03hp2kkh3j21950u0wyg.jpg)

## 列表模式

全部用例的列表展示。

![](/macaca-reporter/assets/6d308bd9gy1g03hp46lhpj21950u07pl.jpg)


