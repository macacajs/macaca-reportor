import React from 'react';
import D3Tree from 'd3-tree';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {
  xcode
} from 'react-syntax-highlighter/dist/styles';

import {
  Table,
  Icon
} from 'antd';

import _ from '../common/helper';

const {
  remove
} = _;

require('./Suite.less');

export default class Suite extends React.Component {

  constructor(props) {
    super(props);
    this.uid = this._guid();
  }

  _guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  }

  _transtromTree(suites) {
    if (suites.length > this.maxD3Height) {
      this.maxD3Height = suites.length;
    }
    suites.forEach((suite, index) => {
      suite.name = suite.title;
      suite.children = suite.tests;
      suite.id = this._guid();
      const imgSrc = suite.context && suite.context.replace(/\"/g, '');
      const isVilidImg = imgSrc && imgSrc.toLowerCase() !== '[undefined]';
      suite.data = {
        text: this.autoWrapText(suite.title),
        image: isVilidImg ? imgSrc : null
      };

      if (suite.suites && suite.suites.length) {
        suite.children = suite.children.concat(suite.suites);
      }

      if (suite.children) {
        this._transtromTree(suite.children);
      }
    });
    return suites;
  }

  _deleteNullTest(suites) {
    remove(suites, suite => {
      const willDelete = suite.children && !suite.children.length && !suite.suites.length;
      return willDelete;
    });
    suites.forEach(suite => {
      this._deleteNullTest(suite.suites);
    });
    return suites;
  }

  autoWrapText(text) {
    let res = '';
    let number = 15;
    let flag = 0;

    for (let i = 0; i < text.length; i++) {
      const current = text[i]
      res += current;
      flag++;
      if (escape(current).length > 4) {
        flag++;
      }

      if (flag >= number) {
        res += '\n';
        flag = 0;
      }
    }
    return res;
  }

  componentDidMount() {
    this.maxD3Height = 0;
    var suite = this.props.suite;
    var title = suite.title;
    var suites = this._transtromTree(suite.suites);
    suites = this._deleteNullTest(suites);

    var data = {
      image: null,
      text: this.autoWrapText(title)
    };

    var selector = `.d3-tree-${this.uid}`;

    var d3tree = new D3Tree({
      selector: selector,
      data: {
        data: data,
        children: suites,
      },
      width: document.querySelector('ul.head').clientWidth,
      height: this.maxD3Height * 300,
      duration: 500,
      imageHeight: 200,
      imageWidth: 200,
      imageMargin: 10,
      itemConfigHandle: img => {
        return {
          isVertical: false
        };
      }
    });
    d3tree.init();
  }

  getCaseState(state) {
    if (state.pass) {
      return <span style={{color:'#a5d86e'}}><Icon type="check" />passed</span>;
    } else if (state.fail) {
      return <span style={{color:'#df5869'}}><Icon type="close" />failed</span>;
    } else if (state.pending) {
      return <span style={{color:'rgb(234, 187, 56)'}}><Icon type="pause" />pending</span>;
    } else if (state.skipped) {
      return <span style={{color:'#898989'}}><Icon type="inbox" />skipped</span>;
    }
  }

  render() {
    let allTest = [];
    let failKeys = [];
    let allStats = {
      totalFailures: 0,
      totalPasses: 0,
      totalPending: 0,
      totalSkipped: 0,
      totalTests: 0,
      duration: 0,
      title: this.props.suite.title,
      file: this.props.suite.file
    };

    const getTest = suites => {
      suites.forEach(suite => {
        suite.tests.forEach(test => {
          test.key = this._guid();
          test.state = this.getCaseState(test);
          test.duration = `${test.duration}ms`;

          if (!test.pass) {
            failKeys.push(test.key);
          }
          allTest.push(test);

          if (test.context && !_.find(images, item => item.src.replace(/"/g, '') === test.context.replace(/"/g, ''))) {
            images.push({
              src: test.context.replace(/"/g, ''),
              text: test.title,
            });
          }
        });
        allStats.totalFailures += suite.totalFailures;
        allStats.totalPasses += suite.totalPasses;
        allStats.totalPending += suite.totalPending;
        allStats.totalSkipped += suite.totalSkipped;
        allStats.totalTests += suite.totalTests;
        allStats.duration += suite.duration;
        getTest(suite.suites);
      });
    }
    getTest(this.props.suite.suites);

    const columns = [
      {
        title: 'case',
        dataIndex: 'fullTitle',
        key: 'fullTitle'
      },
      {
        title: 'duration',
        dataIndex: 'duration',
        key: 'duration',
        width: 88
      },
      {
        title: 'state',
        dataIndex: 'state',
        key: 'state',
        width: 100
      }
    ];

    let percent = 0;
    if (allStats.totalTests > 0) {
      percent = parseInt(allStats.totalPasses / allStats.totalTests * 100, 10);
    }

    return (
      <div className="suite" style={{ display: this.props.showSuite ? 'block' : 'none' }}>
        <div className="file-head">
          <div className="file-head-top">
            <h1>{ allStats.title }</h1>
            <p>{ allStats.file }</p>
          </div>
          <ul>
            <li><Icon type="clock-circle-o" /><span><span>Time:</span><span> { allStats.duration }ms</span></span></li>
            <li><Icon type="inbox" /><span><span>Tests:</span><span> { allStats.totalTests }</span></span></li>
            <li style={{color: '#a5d86e'}}><Icon type="check" /><span><span>Passes:</span><span> { allStats.totalPasses }</span></span></li>
            <li style={{color: '#df5869'}}><Icon type="close" /><span><span>Failures:</span><span>  { allStats.totalFailures }</span></span></li>
            <li style={{color: 'rgb(234, 187, 56)'}}><Icon type="pause" /><span><span>Pending:</span><span>  { allStats.totalPending }</span></span></li>
            <li style={{color: '#898989'}}><Icon type="inbox" /><span><span>Skipped:</span><span>  { allStats.totalSkipped }</span></span></li>
            { percent >= 90
              ? <li style={{color: '#39a854'}}><Icon type="pie-chart" /><span><span>rate:</span><span> { percent }%</span></span></li>
              : <li style={{color: '#df5869'}}><Icon type="pie-chart" /><span><span>rate:</span><span>  { percent }%</span></span></li>
            }
          </ul>
        </div>

        <div style={{ display: this.props.showSvg ? 'block' : 'none' }} className={ `ani-box d3-tree-${this.uid}` }></div>
        <Table
          columns={ columns }
          defaultExpandedRowKeys={ failKeys }
          expandedRowRender={ record =>
            <div>
              <SyntaxHighlighter
                language='javascript'
                showLineNumbers
                style={ xcode }
              >
                { record.code }
              </SyntaxHighlighter>
              { record.context && <a href={ record.context.replace(/\"/g, '') } target="_blank"><img src={ record.context.replace(/\"/g, '') } /></a>}
            </div>
          }
          dataSource={ allTest }
        />
      </div>
    );
  }
}
