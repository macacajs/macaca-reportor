# 项目集成

通过对 Mocha 生成的数据进行简单处理之后，可以调用 macaca-reporter/lib/render 方法生成报告器。

## 生成数据

通过在 Mocha 完成每个测试用例后，对数据进行处理，最终将数据输出在本地。

核心代码：

```javascript
const handleTestEnd = (isEnd) => {
  const obj = getSuiteData(isEnd);
  obj.stats.duration = obj.suites._totalTime || 0;
  this.output = obj;
};

this.done = (failures, exit) => done(this.output, this.config, failures, exit);

runner.on('start', () => {
  this._originSuiteData = runner.suite;
});

runner.on('test end', test => {
  test.uuid = uuid();
  handleTestEnd();
});

runner.once('end', () => {
  handleTestEnd(true);
  self.epilogue.bind(self);
});
```

具体代码可以参考 [uitest](https://github.com/macacajs/uitest)：
[开始](https://github.com/macacajs/uitest/blob/master/mocha.js#L3816) - [结束](https://github.com/macacajs/uitest/blob/master/mocha.js#L4083)

## 生成报告器

生成数据后，通过 render 方法渲染出报告器页面：

```javascript
  const render = require('macaca-reporter/lib/render');
  const data = require('./reports/json-final');
  render(data);
```

参考项目：[Hilo](https://github.com/hiloteam/Hilo/blob/dev/gulpfile.js#L287)

