'use strict';

const fs = require('fs');
const path = require('path');

const pkg = require('../package');
const _ = require('./common/helper');
const logger = require('./common/logger');

const {
  chalk,
  microtemplate,
  copyfile
} = _;

/**
 * data Object
 *
 * options {
 *  name,
 *  fileName,
 *  assetsInline,
 *  dataAttr,
 *  distDir
 * }
 */

module.exports = (data, opts) => {

  /*
   * mock data
   * data = require('../test/mock');
   *
   */

  const options = _.merge({
    name: pkg.name,
    fileName: 'index.html',
    assetsInline: true,
    dataAttr: 'data-output',
    configAttr: 'config-output',
    distDir: process.cwd()
  }, opts);

  let originHTML = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
  const originJS = fs.readFileSync(path.join(__dirname, '..', 'dist', `${options.name}.js`), 'utf8');
  const originCSS = fs.readFileSync(path.join(__dirname, '..', 'dist', `${options.name}.css`), 'utf8');

  originHTML = microtemplate.render(originHTML, {
    title: 'Macaca Reporter',
    script: options.assetsInline ? `<script>${originJS}</script>` : `<script src="./${options.name}.js"></script>`,
    style: options.assetsInline ? `<style>${originCSS}</style>` : `<link rel="stylesheet" href="./${options.name}.css" />`,
    element: `<div ${options.configAttr}="${encodeURI(JSON.stringify(options))}" ${options.dataAttr}="${encodeURI(JSON.stringify(data))}" id="${options.name}"></div>`
  }, {
    tagOpen: '<!--',
    tagClose: '-->'
  });

  const targetHTML = path.join(options.distDir, 'reports', options.fileName);

  copyfile(originHTML, targetHTML);

  if (!options.assetsInline) {
    const targetJS = path.join(options.distDir, 'reports', `${options.name}.js`);
    copyfile(originJS, targetJS);
    const targetCSS = path.join(options.distDir, 'reports', `${options.name}.css`);
    copyfile(originCSS, targetCSS);
  }

  logger.info(chalk.cyan(`html reporter generated: ${targetHTML}`));
};
