// ==UserScript==
// @name           IITC plugin: Draw tools Enhancement
// @category       Draw
// @version        0.0.1
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

// //PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
// //(leaving them in place might break the 'About IITC' page or break update checks)
// plugin_info.buildName = 'release';
// plugin_info.dateTimeVersion = '2019-12-07-224110';
// plugin_info.pluginId = 'draw-tools';
// //END PLUGIN AUTHORS NOTE

// use own namespace for plugin
window.plugin.drawToolsEnhancement = function() {};

window.plugin.drawToolsEnhancement.optReadData = function() {
  function groupByKey(xs, key) {
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
  localStorage['plugin-draw-tools-enhancement'] = JSON.stringify(groupByKey(data, 'color'));
  window.plugin.drawToolsEnhancement.useSpectrum();
}

window.plugin.drawToolsEnhancement.restoreWith = function(f) {
  let data = JSON.parse(localStorage['plugin-draw-tools-enhancement']);
  
  window.plugin.drawTools.drawnItems.clearLayers();
  window.plugin.drawTools.import(f(data));
  window.plugin.drawTools.save();
}

window.plugin.drawToolsEnhancement.optRestoreByColor = function(color) {
  window.plugin.drawToolsEnhancement.restoreWith(x => x[window.plugin.drawToolsEnhancement.currentColor]);
}

window.plugin.drawToolsEnhancement.optRestoreAll = function() {
  window.plugin.drawToolsEnhancement.restoreWith(x => Object.values(x).flat());
}

window.plugin.drawToolsEnhancement.currentColor = '#a24ac3';


window.plugin.drawToolsEnhancement.useSpectrum = function() {
  const chunksBy = (xs, n) =>
    [...Array(Math.ceil(xs.length/n)).keys()]
      .map(x => xs.slice(x*n, Math.min(x*n+n,xs.length)));

  let colors = Object.keys(JSON.parse(localStorage['plugin-draw-tools-enhancement']));
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
//    move: function(color) { window.plugin.drawTools.setDrawColor(color.toHexString()); },
    color: window.plugin.drawToolsEnhancement.currentColor,
  });
}

window.plugin.drawToolsEnhancement.manualOpt = function() {
  var html = '<div class="drawtoolsStyles">'
           + '<input type="color" name="drawColor" id="drawtools_enhancement_color"></input>'
           + '</div>'
           + '<div class="drawtoolsSetbox">'
           + '<a onclick="window.plugin.drawToolsEnhancement.optReadData();return false;" tabindex="0">Read Data</a>'
           + '<a onclick="window.plugin.drawToolsEnhancement.optRestoreByColor();return false;" tabindex="0">Show By Color</a>'
           + '<a onclick="window.plugin.drawToolsEnhancement.optRestoreAll();return false;" tabindex="0">Show All</a>'
           + '</div>';

  dialog({
    html: html,
    id: 'plugin-drawtoolsenhancement-options',
    dialogClass: 'ui-dialog-drawtoolsSet',
    title: 'Draw Tools Enhancement Options'
  });

  // need to initialise the 'spectrum' colour picker
  window.plugin.drawToolsEnhancement.useSpectrum();
}

function setup() {
  $('#toolbox').append('<a onclick="window.plugin.drawToolsEnhancement.manualOpt();return false;" accesskey="x" title="[x]">DrawTools Enhancement Opt</a>');
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
