import React from 'react';

import Editor from '@antv/g6-editor';

import _ from '../common/helper';

require('./Mind.less');

const {
  remove
} = _;

export default class Mind extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    }
  }

  _transtromTree(suites) {
    suites.forEach((suite, index) => {
      suite.name = suite.title;
      suite.children = suite.tests;
      suite.id = _.guid();
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
      const willDelete = suite.children
        && !suite.children.length
        && !suite.suites.length;
      return willDelete;
    });
    suites.forEach(suite => {
      this._deleteNullTest(suite.suites);
    });
    return suites;
  }

  componentDidMount() {
    var suites = this.props.suites;
    suites = this._transtromTree(suites);
    suites = this._deleteNullTest(suites);

    const adaptor = (listData, isRoot) => {
      const midNum = parseInt(listData.length / 2, 10);
      return listData.map((item, index) => {
        item.label = item.title;
        if (isRoot) {
          item.side = index > midNum ? 'left' : 'right';
        }
        if (item.children && item.children.length) {
          item.children = adaptor(item.children);
        }
        return item;
      });
    };

    const mindSuite = {
      roots: [{
        label: 'Macaca Mind',
        children: adaptor(suites, true),
      }],
    };

    Editor.track(false);

    new Editor.Mind({
      defaultData: mindSuite,
      labelEditable: false,
      mode: 'readOnly',
      graph: {
        container: 'mind-node',
        height: window.innerHeight - 100,
        width: window.innerWidth,
      },
    });
  }

  render() {
    return (
      <div id="mind-node" className="mind-node"></div>
    );
  }
}
