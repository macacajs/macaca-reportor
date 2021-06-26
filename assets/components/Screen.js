'use strict';

import React from 'react';
import {
  Row,
  Col
} from 'antd';
import './Screen.less';

export default class NavBar extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const current = this.props.current;

    if (!current) {
      return null;
    }

    return (
      <div className="screen">
        <Row
          gutter={24}
          type="flex"
          justify="space-around"
        >
          <Col span={16}>
            <div className="imagecon">
              <h1>Current Screen</h1>
              <img src={ current.image } />
            </div>
          </Col>
          <Col span={6}>
            <div>
              <h1>Current status</h1>
              {
                current.list.map((item, key) => {
                  return (
                    <p key={ key }>{ item.title }: { item.value }</p>
                  );
                })
              }
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}
