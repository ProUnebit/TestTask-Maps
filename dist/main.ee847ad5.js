// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"js\\main.js":[function(require,module,exports) {
var controlPanelLoadingText = document.querySelector('.control-panel-box__loading-text');
var controlPanelSwitcherButton = document.querySelector('.control-panel-box__switcher-button');
var controlPanelSelect = document.querySelector('.control-panel-box__form-select');
var controlPanelLogo = document.querySelector('.control-panel-box__logo');
var mapBoxYandex = document.getElementById('map-1');
var mapBox2gis = document.getElementById('map-2');

var dataM24 = void 0;
var displaySwitcher = false;

controlPanelSwitcherButton.addEventListener('click', function () {
    if (!displaySwitcher) {
        mapBox2gis.style.visibility = 'visible';
        controlPanelSelect.setAttribute('disabled', true);
        controlPanelSelect.style.cursor = 'not-allowed';
        mapBoxYandex.style.display = 'none';
        mapBox2gis.style.display = 'block';
        controlPanelLogo.src = 'https://upload.wikimedia.org/wikipedia/commons/c/c1/2GIS_logo.svg';
        displaySwitcher = true;
        return;
    } else if (displaySwitcher) {
        mapBox2gis.style.visibility = 'hidden';
        controlPanelSelect.removeAttribute('disabled');
        controlPanelSelect.style.cursor = '';
        mapBoxYandex.style.display = 'block';
        mapBox2gis.style.display = 'none';
        controlPanelLogo.src = 'https://upload.wikimedia.org/wikipedia/commons/9/91/Yandex_logo_en.svg';
        displaySwitcher = false;
    }
});

ymaps.ready(init);

function init() {

    var myMap = new ymaps.Map("map-1", {
        center: [55.76, 37.64],
        zoom: 12
    });

    fetch('https://raw.githubusercontent.com/ProUnebit/Reminder_ToMe_Reminder/master/src/data.json').then(function (res) {
        controlPanelLoadingText.textContent = 'Обработка данных... ⏳';
        return res.json();
    }).then(function (data) {
        dataM24 = data;
        showMapPointsYandex(data, 'orange');
        return data;
    }).then(function (data) {
        controlPanelLoadingText.textContent = 'Yandex карта загружена ✔️';
        showMapPoints2gis(data);
    }).catch(function (err) {
        return console.error(err);
    });

    var showMapPointsYandex = function showMapPointsYandex(dataM24, color) {

        var myGeoObjects = new ymaps.GeoObjectCollection({}, {
            preset: 'islands#' + color + 'CircleIcon',
            strokeWidth: 4,
            geodesic: true
        });

        dataM24.map(function (district) {
            return district.points.map(function (point) {
                myGeoObjects.add(new ymaps.Placemark([point.address.lon, point.address.lat], {
                    hintContent: '<div class="hintContent">\n                <span>' + district.header + '</span>\n                </div>',
                    balloonContent: '<div class="balloonContent">\n                <p>' + district.header + '</p>\n                <p>' + point.address.address + '</p>\n                </div>'
                }));
            });
        });

        myMap.geoObjects.add(myGeoObjects);
    };

    var showMapPoints2gis = function showMapPoints2gis(dataM24) {

        DG.then(function () {

            var map = void 0,
                markers = DG.featureGroup(),
                coordinates = [],
                myIcon = DG.icon({
                iconUrl: 'https://mbtskoudsalg.com/images/map-marker-icons-png-3.png',
                iconSize: [26, 30]
            });

            map = DG.map('map-2', {
                center: [55.76, 37.64],
                zoom: 12
            });

            dataM24.map(function (district) {
                for (var i = 0; i < district.points.length; i++) {
                    coordinates[0] = district.points[i].address.lon;
                    coordinates[1] = district.points[i].address.lat;
                    DG.marker(coordinates, {
                        icon: myIcon,
                        label: '\n                     <div class="hintContent">\n                        <span style="font-size: 17px">' + district.header + '</span>\n                     </div>'
                    }).addTo(markers).bindPopup('\n                        <di class="balloonContent">\n                        <p style="margin-bottom: 5px;">' + district.header + '</p>\n                        <p>' + district.points[i].address.address + '</p>\n                        </di>');
                }
            });

            markers.addTo(map);

            setTimeout(function () {
                return controlPanelLoadingText.textContent = '2GIS карта загружена ✔️';
            }, 1200);
            setTimeout(function () {
                return controlPanelLoadingText.textContent = 'Карты готовы 👌';
            }, 1800);
        });
    };

    controlPanelSelect.addEventListener('change', function (e) {
        if (e.target.value === 'Все') {
            myMap.geoObjects.removeAll();
            showMapPointsYandex(dataM24, 'orange');
        } else {
            var separatedTargetDistrict = dataM24.filter(function (district) {
                return district.header === e.target.value;
            });
            myMap.geoObjects.removeAll();
            showMapPointsYandex(separatedTargetDistrict, 'violet');
        }
    });
}
},{}],"C:\\Users\\Алексей\\AppData\\Roaming\\npm\\node_modules\\parcel-bundler\\src\\builtins\\hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';

var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };

  module.bundle.hotData = null;
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '14562' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();

      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');

      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);

      removeErrorOverlay();

      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;

  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';

  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["C:\\Users\\Алексей\\AppData\\Roaming\\npm\\node_modules\\parcel-bundler\\src\\builtins\\hmr-runtime.js","js\\main.js"], null)
//# sourceMappingURL=/main.ee847ad5.map