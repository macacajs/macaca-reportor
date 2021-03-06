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
import uniqBy from 'lodash/uniqBy';
import flatten from 'lodash/flatten';
import io from 'socket.io-client';

const Header = Layout.Header;
const Footer = Layout.Footer;
const Content = Layout.Content;
const { Meta } = Card;

import { guid } from '@/common/helper';
import Mind from './components/Mind';
import Suite from './components/Suite';
import NavBar from './components/NavBar';
import Screen from './components/Screen';
import pkg from '../package.json';

window.images = [];
import './app.less';
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

      const zoom = 0.6;
      if (tagName === 'IMAGE') {
        let index = 0;
        const items = [];
        document.querySelectorAll('image').forEach((item, key) => {
          const { width: imageWidth, height: imageHeight } = item.getBoundingClientRect();
          const ratio = (imageWidth / imageHeight).toFixed(2);
          const { width: screenWidth, height: screenHeight } = window.screen;
          if (item === target) {
            index = key;
          }
          let pos = {};
          // horizontal
          if (ratio > 1) {
            pos = {
              w: screenWidth * zoom,
              h: screenWidth * zoom / ratio,
            }
          } else {
            pos = {
              w: screenHeight * zoom * ratio,
              h: screenHeight * zoom,
            }
          }
          const href = item.getAttribute('href');
          const titleContainer = item.parentNode.querySelector('text');
          const textArray = [].slice.call(titleContainer && titleContainer.querySelectorAll('tspan') || []);
          const title = textArray.reduce((pre, current) => pre + current.innerHTML, '');
          items.push(Object.assign({
            src: href,
            title,
          }, pos));
        });
        openPhotoSwipe(items, index);
      } else if (tagName === 'IMG' && target.classList.contains('picture-item')) {
        const index = parseInt(target.getAttribute('data-index'), 10);
        const items = [];
        document.querySelectorAll('#display-items .display-item').forEach(item => {
          const src = item.getAttribute('src');
          const title = item.getAttribute('data-title');
          const { width: imageWidth, height: imageHeight } = item.getBoundingClientRect();
          const ratio = (imageWidth / imageHeight).toFixed(2);
          const { width: screenWidth, height: screenHeight } = window.screen;
          let pos = {};
          // horizontal
          if (ratio > 1) {
            pos = {
              w: screenWidth * zoom,
              h: screenWidth * zoom / ratio,
            }
          } else {
            pos = {
              w: screenHeight * zoom * ratio,
              h: screenHeight * zoom,
            }
          }
          items.push(Object.assign({
            src,
            title,
          }, pos));
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

  getImagesList(images) {
    let imagesList = [];
    let imgs = uniqBy(images, item => item.src);
    imgs = imgs.filter(img => img.src && !img.src.includes('undefined'));
    imgs.map(img => {
      if (img.src.includes('\n')) {
        const imgList = img.src.split(/\s+/).filter(i => i && i.includes('.'));
        imgList.map(item => {
          imagesList.push({
            text: img.text,
            src: item,
          });
        });
      } else {
        imagesList.push(img);
      }
    })
    return imagesList;
  }

  renderImages(images) {
    if (this.state.showType !== 'image') {
      return null;
    }
    const imagesList = this.getImagesList(images);

    let cards = imagesList.map((item, index) => {
      const title = item.text;
      const src = item.src;

      const isVideo = src.endsWith('.webm');
      return (
        <Col key={guid()} span={isVideo ? 8 : 4} style={{ padding: '5px' }}>
          <Card
            id="display-items"
            hoverable
            cover={
              isVideo
              ?
                <a href={src} target="_blank">
                  <video
                    data-index={index}
                    className="video-item display-item"
                    src={src}
                    data-title={title}
                    controls
                  />
                </a>
              :
                <img
                  data-index={index}
                  className="picture-item display-item"
                  src={src}
                  data-title={title}
                />
            }
          >
            <Meta
              description={ title.split(' -- ') && title.split(' -- ').reverse()[0] }
            />
          </Card>
        </Col>
      );
    });
    cards = flatten(cards);

    if (!imagesList.length) {
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
                  <Icon type="video-camera" />
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
