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
    this.uid = _.guid();

    this.state = {
      expandKeys: [],
    }
  }

  _getD3UnitData(item) {
    const imgSrc = item.context && item.context.replace(/\"/g, '');
    const isValidImg = imgSrc && imgSrc.toLowerCase() !== '[undefined]';
    return {
      text: _.autoWrapText(item.title),
      image: isValidImg ? imgSrc : null
    };
  }

  // handle single-layer cases: describle -> it
  _transtromOneTree(suite) {
    suite.name = suite.title;
    suite.tests.forEach(test => {
      test.id = _.guid();
      test.data = this._getD3UnitData(test);
    })
    suite.children = suite.tests;
    return suite;
  }

  // handle muti-layer cases: describle -> describl -> it
  _transtromTree(suites) {
    if (suites.length > this.maxD3Height) {
      this.maxD3Height = suites.length;
    }
    suites.forEach((suite, index) => {
      suite.name = suite.title;
      suite.children = suite.tests;
      suite.id = _.guid();
      suite.data = this._getD3UnitData(suite);

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

  componentDidMount() {
    this.maxD3Height = 1;
    let suites;
    const suite = this.props.suite;
    const d3Data = {
      data: {
        image: null,
        text: _.autoWrapText(suite.title)
      },
    }

    if (suite.tests.length) {
      suites = this._transtromOneTree(suite);
      d3Data.children = suites.children;
    } else {
      suites = this._transtromTree(suite.suites);
      d3Data.children = suites;
      suites = this._deleteNullTest(suites);
    }

    const selector = `.d3-tree-${this.uid}`;

    const d3tree = new D3Tree({
      selector: selector,
      data: d3Data,
      width: document.querySelector('ul.head').clientWidth,
      height: this.maxD3Height * 300,
      duration: 500,
      imageHeight: 200,
      imageWidth: 200,
      imageMargin: 10,
      itemConfigHandle: () => {
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
      return <span style={{color:'#df5869'}}><Icon type="close" style={{ verticalAlign: 'sub' }} />failed</span>;
    } else if (state.pending) {
      return <span style={{color:'rgb(234, 187, 56)'}}><Icon type="pause" />pending</span>;
    } else if (state.skipped) {
      return <span style={{color:'#898989'}}><Icon type="inbox" />skipped</span>;
    }
  }

  handleExpand(expanded, record) {
    const expandKeys = [...this.state.expandKeys]
    if (!~expandKeys.indexOf(record.key)) {
      expandKeys.push(record.key);
    } else {
      expandKeys.splice(expandKeys.indexOf(record.key), 1);
    }
    this.setState({
      expandKeys,
    });
  }

  render() {
    const allTest = [];
    const suite = this.props.suite;
    const allStats = {
      totalFailures: 0,
      totalPasses: 0,
      totalPending: 0,
      totalSkipped: 0,
      totalTests: 0,
      duration: 0,
      title: suite.title,
      file: suite.file
    };

    const handleTest = suite => {
      suite.tests.forEach(test => {
        // save test images
        if (test.context && !_.find(images, item => item.src.replace(/"/g, '') === test.context.replace(/"/g, ''))) {
          images.push({
            src: test.context.replace(/"/g, ''),
            text: test.fullTitle,
          });
        }

        if ((this.props.showError && test.fail) || !this.props.showError) {
          test.key = test.uuid;
          test.state = this.getCaseState(test);

          if (test.duration && !~(test.duration + '').indexOf('ms')) {
            test.duration = `${test.duration}ms`;
          }

          allTest.push(test);
        }
      });
      allStats.totalFailures += suite.totalFailures;
      allStats.totalPasses += suite.totalPasses;
      allStats.totalPending += suite.totalPending;
      allStats.totalSkipped += suite.totalSkipped;
      allStats.totalTests += suite.totalTests;
      allStats.duration += suite.duration;
    }

    if (suite.tests.length) {
      handleTest(suite);
    } else {
      suite.suites.forEach(suite => {
        handleTest(suite);
      });
    }

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

    const showSvg = this.props.showSvg;
    let showSuite = this.props.showSuite;
    if (this.props.showError) {
      showSuite = allStats.totalFailures > 0;
    }

    return (
      <div className="suite" style={{ display: showSuite ? 'block' : 'none' }}>
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

        <div style={{ display: showSvg ? 'block' : 'none' }} className={ `ani-box d3-tree-${this.uid}` }></div>
        <Table
          pagination={ !this.props.showSvg }
          columns={ columns }
          expandedRowKeys={ this.state.expandKeys }
          onExpand={this.handleExpand.bind(this)}
          expandedRowRender={ record =>
            <div>
              <SyntaxHighlighter
                language='javascript'
                showLineNumbers
                style={ xcode }
              >
                { record.code }
              </SyntaxHighlighter>
              { record.context && !~record.context.indexOf('undefined') && <img data-title={ record.fullTitle } src={ record.context.replace(/\"/g, '') } />}
            </div>
          }
          dataSource={ allTest }
        />
      </div>
    );
  }
}
