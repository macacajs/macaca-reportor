# Introduction

Macaca Reporter is a more useful reporter that helps organize and present test results during the testing process. The display mode supports link tree-mode, mind-mode, image-mode, and list-mode. The design principles of each mode are described in turn below.

## tree-mode

The tree-mode is the most common and default display mode. The organization structure of the use case is displayed in a tree. The screenshot API of Macaca can automatically generate screenshots before the end of the use case. The link tree mode is convenient for restoring the test execution path of the business product.

![](/macaca-reporter/assets/6d308bd9gy1g03hp2j3bwj21950u0h58.jpg)

## mind-mode

The mind-mode can be considered as an overview of all use cases. This view is more convenient for users to organize and organize use cases, and can be used as an analysis basis before improving and supplementing new use cases.

![](/macaca-reporter/assets/6d308bd9gy1g03hp2nibhj21950u0wyf.jpg)

## image-mode

The image-mode extracts all the screenshots during the test, and is more suitable for the functional test of the partial rendering display. It can be used as a quality basis to reduce costs before the next stage of delivery. However, it is not recommended to avoid the problem by manually looking at the reporter. It is recommended to use [Pixel Diff] (https://macacajs.github.io/guide/computer-vision.html#other-solutions) and exception capture help to assert whether the current rendering is passed.

![](/macaca-reporter/assets/6d308bd9gy1g03hp2lea4j21950u0wyx.jpg)

![](/macaca-reporter/assets/6d308bd9gy1g03hp2kkh3j21950u0wyg.jpg)

## list-mode

The list-mode give all the test case list.

![](/macaca-reporter/assets/6d308bd9gy1g03hp46lhpj21950u07pl.jpg)
