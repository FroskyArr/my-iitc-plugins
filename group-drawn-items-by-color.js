// ==UserScript==
// @name           IITC plugin: Draw tools Enhancement
// @category       Draw
// @version        0.0.3
// @author         FroskyArr
// @description    Can only group drawn items by color currently
// @id             draw-tools-enhancement
// @namespace      https://www.github.com/FroskyArr
// @license        ISC
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

// use own namespace for plugin
window.plugin.drawToolsEnhancement = function() {};

window.plugin.drawToolsEnhancement.optAddAvaliableItems = function() {
  const groupByKey = (xs, key) => {
    let obj = {};
    for (const x of xs) {
      if (Array.isArray(obj[x[key]]))
        obj[x[key]].push(x);
      else
        obj[x[key]] = [x];
    }
    return obj;
  }

  let data =
    localStorage['plugin-draw-tools-layer']
    ? JSON.parse(localStorage['plugin-draw-tools-layer'])
    : [];
  let olddata = 
    localStorage['plugin-draw-tools-enhancement']
    ? JSON.parse(localStorage['plugin-draw-tools-enhancement'])
    : {};
  localStorage['plugin-draw-tools-enhancement'] =
    JSON.stringify( {...olddata, ...groupByKey(data, 'color')} );
  window.plugin.drawToolsEnhancement.useSpectrum();
}

window.plugin.drawToolsEnhancement.modify = function(f) {
  let stored = JSON.parse(localStorage['plugin-draw-tools-enhancement']);
  let current = JSON.parse(localStorage['plugin-draw-tools-layer']);
  
  window.plugin.drawTools.drawnItems.clearLayers();
  window.plugin.drawTools.import(f(stored, current));
  window.plugin.drawTools.save();
}

window.plugin.drawToolsEnhancement.optShowByColor = function() {
  window.plugin.drawToolsEnhancement.modify((stor, cur) =>
    cur.filter(x => x.color !== window.plugin.drawToolsEnhancement.currentColor)
       .concat(stor[window.plugin.drawToolsEnhancement.currentColor])
  );
}

window.plugin.drawToolsEnhancement.optHideByColor = function() {
  window.plugin.drawToolsEnhancement.modify((_stor, cur) =>
    cur.filter(x => x.color !== window.plugin.drawToolsEnhancement.currentColor)
  );
}

window.plugin.drawToolsEnhancement.optClearByColor = function() {
  let data = JSON.parse(localStorage['plugin-draw-tools-enhancement']);
  delete data[window.plugin.drawToolsEnhancement.currentColor]
  localStorage['plugin-draw-tools-enhancement'] = JSON.stringify(data);
}

window.plugin.drawToolsEnhancement.optShowAll = function() {
  window.plugin.drawToolsEnhancement.modify((stor, _cur) =>
    Object.values(stor).flat()
  );
}

window.plugin.drawToolsEnhancement.optHideAll = function() {
  window.plugin.drawToolsEnhancement.modify((_stor, _cur) => []);
}

window.plugin.drawToolsEnhancement.optClearAll = function() {
  localStorage['plugin-draw-tools-enhancement'] = '{}';
}

window.plugin.drawToolsEnhancement.currentColor = '#a24ac3';

window.plugin.drawToolsEnhancement.useSpectrum = function() {
  const chunksBy = (xs, n) =>
    [...Array(Math.ceil(xs.length/n)).keys()]
      .map(x => xs.slice(x*n, Math.min(x*n+n,xs.length)));

  let colors = Object.keys(JSON.parse(localStorage['plugin-draw-tools-enhancement']));
  if (colors[0])
    window.plugin.drawToolsEnhancement.currentColor = colors[0];
  let palette = chunksBy(colors, 4)
  $('#drawtools_enhancement_color').spectrum({
    flat: false,
    showInput: false,
    showButtons: false,
    showPalette: true,
    showPaletteOnly: true,
    showSelectionPalette: false,
    palette: palette,
    change: function(color) { window.plugin.drawToolsEnhancement.currentColor = color.toHexString(); },
    color: window.plugin.drawToolsEnhancement.currentColor,
  });
}

window.plugin.drawToolsEnhancement.manualOpt = function() {
  var html = '<div class="drawtoolsStyles">'
           + '<input type="color" name="drawColor" id="drawtools_enhancement_color"></input>'
           + '</div>'
           + '<div class="drawtoolsSetbox">'
           + '<a onclick="window.plugin.drawToolsEnhancement.optAddAvaliableItems();return false;" title="Will overwrite previous stored items by color" tabindex="0">Add Avaliable Items To Storage</a>'
           + '<a onclick="window.plugin.drawToolsEnhancement.optShowByColor();return false;" tabindex="0">Show By Color</a>'
           + '<a onclick="window.plugin.drawToolsEnhancement.optHideByColor();return false;" tabindex="0">Hide By Color</a>'
           + '<a onclick="window.plugin.drawToolsEnhancement.optClearByColor();return false;" tabindex="0">Remove From Storage By Color</a>'
           + '<a onclick="window.plugin.drawToolsEnhancement.optShowAll();return false;" tabindex="0">Show All</a>'
           + '<a onclick="window.plugin.drawToolsEnhancement.optHideAll();return false;" tabindex="0">Hide All</a>'
           + '<a onclick="window.plugin.drawToolsEnhancement.optClearAll();return false;" tabindex="0">Remove All Stored Items</a>'
           + '</div>';

  dialog({
    html: html,
    id: 'plugin-drawtoolsenhancement-options',
    dialogClass: 'ui-dialog-drawtoolsenhancementSet',
    title: 'Draw Tools Enhancement Options'
  });

  // need to initialise the 'spectrum' colour picker
  window.plugin.drawToolsEnhancement.useSpectrum();
}

function setup() {
  $('#toolbox').append('<a onclick="window.plugin.drawToolsEnhancement.manualOpt();return false;">DrawTools Enhancement Opt</a>');
}

setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
