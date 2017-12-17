import React from 'react';
import D3Tree from 'd3-tree';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {
  xcode
} from 'react-syntax-highlighter/dist/styles';

import {
  Table,
  Icon,
  Progress
} from 'antd';

import _ from '../common/helper';

const {
  remove
} = _;

let maxD3Height = 0

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
    if (suites.length > maxD3Height) {
      maxD3Height = suites.length;
    }
    suites.forEach((suite, index) => {
      suite.name = suite.title;
      suite.children = suite.tests;
      suite.id = this._guid();
      const imgSrc = suite.context && suite.context.replace(/\"/g, '');
      const isVilidImg = imgSrc && imgSrc.toLowerCase() !== '[undefined]';
      suite.data = {
        text: suite.title,
        image: isVilidImg ? imgSrc : null
      };

      if (suite.children) {
        this._transtromTree(suite.children);
      }
    });
    return suites;
  }

  _deleteNullTest(suites) {
    remove(suites, suite => {
      const willDelete = !suite.children.length && !suite.suites.length;
      return willDelete;
    });
    suites.forEach(suite => {
      this._deleteNullTest(suite.suites);
    });
    return suites;
  }

  componentDidMount() {

    var suite = this.props.suite;
    var title = suite.title;
    var suites = this._transtromTree(suite.suites);
    suites = this._deleteNullTest(suites);

    var data = {
      image: null,
      text: title
    };

    var selector = `.d3-tree-${this.uid}`;

    var d3tree = new D3Tree({
      selector: selector,
      data: {
        data: data,
        children: suites,
      },
      width: window.innerWidth,
      height: maxD3Height * 200,
      duration: 1000,
      marginRight: 300,
      itemConfigHandle: img => {
        return {
          imageMaxHeight: 170,
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
          test.duration += 'ms';

          if (!test.pass) {
            failKeys.push(test.key);
          }
          allTest.push(test);
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

    const percent = parseInt(allStats.totalPasses / allStats.totalTests * 100, 10);

    return (
      <div className="suite">
        <div className="file-head">
          <div className="file-head-top">
            <h1>{ allStats.title }</h1>
            <p>{ allStats.file }</p>
          </div>
          <ul>
            <li><Icon type="clock-circle-o" /><span>Time: { allStats.duration }ms</span></li>
            <li><Icon type="inbox" /><span>Tests: { allStats.totalTests }</span></li>
            <li style={{color: '#a5d86e'}}><Icon type="check" /><span>Passes: { allStats.totalPasses }</span></li>
            <li style={{color: '#df5869'}}><Icon type="close" /><span>Failures: { allStats.totalFailures }</span></li>
            <li style={{color: 'rgb(234, 187, 56)'}}><Icon type="pause" /><span>Pending: { allStats.totalPending }</span></li>
            <li style={{color: '#898989'}}><Icon type="inbox" /><span>Skipped: { allStats.totalSkipped }</span></li>
            { percent >= 90
              ? <li style={{color: '#39a854'}}><Icon type="pie-chart" /><span>rate: { percent }%</span></li>
              : <li style={{color: '#df5869'}}><Icon type="pie-chart" /><span>rate: { percent }%</span></li>
            }
          </ul>
        </div>

        <div className={ `ani-box d3-tree-${this.uid}` }></div>
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
