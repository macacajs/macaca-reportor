'use strict';

import React from 'react';
import ReactGA from 'react-ga';
import ReactDom from 'react-dom';
import CircularJson from 'macaca-circular-json';
import { openPhotoSwipe } from './components/PhotoSwipe';

import {
  Affix,
  Icon,
  Card,
  Col,
  Row,
  Layout,
  Radio,
  Empty,
  BackTop,
} from 'antd';

import io from 'socket.io-client';

const Header = Layout.Header;
const Footer = Layout.Footer;
const Content = Layout.Content;
const { Meta } = Card;

import _ from './common/helper';
import Mind from './components/Mind';
import Suite from './components/Suite';
import NavBar from './components/NavBar';
import Screen from './components/Screen';

const pkg = require('../package.json')

window.images = [];

require('./app.less');

let container;
const dataAttr = 'data-output';
const configAttr = 'config-output';

window.addEventListener('load', () => {
  ReactGA.initialize('UA-49226133-2');
  ReactGA.pageview(window.location.pathname + window.location.search);
  process.env.traceFragment;
});

class App extends React.Component {

  constructor(props) {
    super(props);
    container = document.querySelector(`#${pkg.name}`);

    const output = CircularJson.parse(decodeURI(container.getAttribute(dataAttr)));

    let showType = 'tree';
    const hashMode = location.hash.replace('#mode=', '');

    if (hashMode) {
      showType = hashMode;
    } else if (output.stats.failures) {
      showType = 'error';
    }

    this.state = {
      output,
      showType,
      hashError: output.stats.failures,
      images: [],
    };
  }

  componentDidMount() {
    this.addImageEvent();

    let timer = setInterval(() => {
      if (window.images) {
        clearInterval(timer)
        this.setState({
          images: window.images
        })
      }
    }, 100);
  }

  addImageEvent() {
    document.body.addEventListener('click', e => {
      const target = e.target;
      const tagName = target.tagName.toUpperCase();

      if (tagName === 'IMAGE') {
        let index = 0;
        const items = [];
        document.querySelectorAll('image').forEach((item, key) => {
          if (item === target) {
            index = key;
          }
          const href = item.getAttribute('href');
          const titleContainer = item.parentNode.querySelector('text');
          const textArray = [].slice.call(titleContainer && titleContainer.querySelectorAll('tspan') || []);
          const title = textArray.reduce((pre, current) => pre + current.innerHTML, '');
          items.push({
            src: href,
            w: 960,
            h: 720,
            title,
          });
        });
        openPhotoSwipe(items, index);
      } else if (tagName === 'IMG' && target.classList.contains('picture-item')) {
        const index = parseInt(target.getAttribute('data-index'), 10);
        const items = [];
        document.querySelectorAll('img.picture-item').forEach(item => {
          const src = item.getAttribute('src');
          const title = item.getAttribute('data-title');
          items.push({
            src,
            w: 960,
            h: 720,
            title,
          });
        });
        openPhotoSwipe(items, index);
      }
    }, false);
  }

  handleRadioChange(e) {
    const radio = e.target.value;
    location.hash = `mode=${radio}`;

    this.setState({
      showType: e.target.value,
    });
  }

  renderImages(images) {
    if (this.state.showType !== 'image') {
      return null;
    }

    let imgs = _.uniqBy(images, item => item.src);

    imgs = imgs.filter(img => img.src && !~img.src.indexOf('undefined'));

    let cards = imgs.map((img, index) => {
      const title = img.text
      const imgList = img.src.replace(/[\[\] "]/g,'').split('\n').filter(i => i); // handle multi image

      return imgList.map((item, key) => (
        <Col key={ _.guid() } span={4} style={{ padding: '5px' }}>
          <Card
            hoverable
            cover={<img data-index={index} className="picture-item" src={ item } data-title={ title } />}
          >
            <Meta
              description={ title.split(' -- ') && title.split(' -- ').reverse()[0] }
            />
          </Card>
        </Col>
      ));
    });
    cards =  _.flatten(cards);

    if (!imgs.length) {
      cards = <Empty description={null} />;
    }

    return (
      <Row style={{
        width: '1280px',
        margin: '30px auto'
      }}>
        {cards}
      </Row>
    );
  }

  render() {

    const stats = this.state.output && this.state.output.stats;
    const current = this.state.output && this.state.output.current;
    const originSuites = this.state.output && this.state.output.suites;
    const showType = this.state.showType;
    const imgs = this.state.images;

    return (
      <Layout>
        <Affix>
          <Header>
            <NavBar stats={ stats }/>
          </Header>
        </Affix>
        <Content>
          <div className="panel-container">
            <div className="case-show-panel">
              <Radio.Group className="case-show-radio" value={showType} onChange={this.handleRadioChange.bind(this)}>
                <Radio.Button value="tree">
                  <Icon type="eye-o" />
                </Radio.Button>
                <Radio.Button value="mind">
                  <Icon type="cluster" />
                </Radio.Button>
                <Radio.Button value="image">
                  <Icon type="picture" />
                </Radio.Button>
                <Radio.Button value="text">
                  <Icon type="table" />
                </Radio.Button>
                {this.state.hashError ? <Radio.Button value="error">
                  <Icon type="question-circle" theme="twoTone" twoToneColor="red" />
                </Radio.Button> : ''}
              </Radio.Group>
            </div>
          </div>
          <Screen current={ current } />
          { showType === 'mind' && <Mind suites={ originSuites.suites }/> }
          {
            showType !== 'mind' && originSuites.suites && originSuites.suites.map((suite, index) => {
              return (
                <Suite
                  showSuite={ showType !== 'image' }
                  showSvg={ showType !== 'text' && showType !== 'error' }
                  showError={ showType === 'error' }
                  suite={ suite }
                  key={ index }
                />
              )
            })
          }
          { this.renderImages(imgs) }
        </Content>
        {
          showType !== 'mind' && (
            <Footer>
              &copy;&nbsp;<a href={ pkg.homepage }>Macaca Team</a> { new Date().getFullYear() }
            </Footer>
          )
        }
        <BackTop />
      </Layout>
    )
  }
}

window._macaca_reportor = {

  _render: () => {
    console.log('reporter view render');
    ReactDom.render(<App />, container);
  },

  _update: data => {
    console.log('reporter view update');
    container.innerHTML = '';
    container.setAttribute(dataAttr, data);
    ReactDom.render(<App />, container);
  }

};

container = document.querySelector(`#${pkg.name}`);

if (container.getAttribute(configAttr)) {
  var config = CircularJson.parse(decodeURI(container.getAttribute(configAttr)));

  if (config && config.socket) {
    const socket = io(config.socket.server);
    socket.on('update reporter', function(data) {
      window._macaca_reportor._update(encodeURI(CircularJson.stringify(data)));
    });

    socket.on('disconnect', (data) => {
      socket.close();
    });
  }
}
