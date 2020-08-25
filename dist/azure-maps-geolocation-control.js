/*
MIT License

    Copyright (c) Microsoft Corporation.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE
*/

(function (exports, azmaps) {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    /**
     * Helper class for merging namespaces.
     */
    var Namespace = /** @class */ (function () {
        function Namespace() {
        }
        Namespace.merge = function (namespace, base) {
            var context = window || global;
            var parts = namespace.split(".");
            for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
                var part = parts_1[_i];
                if (context[part]) {
                    context = context[part];
                }
                else {
                    return base;
                }
            }
            return __assign(__assign({}, context), base);
        };
        return Namespace;
    }());

    var Utils = /** @class */ (function () {
        function Utils() {
        }
        /**
         * Checks to see if the map is in high contrast mode, and if so, which high contrast style to align with.
         * @param map The map instance.
         */
        Utils.getHclStyle = function (map) {
            //Check to see if style is high contrast.
            if (map.getMapContainer().classList.contains("high-contrast-dark")) {
                return azmaps.ControlStyle.dark;
            }
            else if (map.getMapContainer().classList.contains("high-contrast-light")) {
                return azmaps.ControlStyle.light;
            }
            return null;
        };
        /**
         * Gets the control style based on the map style when control style set to auto.
         * @param map The map instance.
         */
        Utils.getAutoStyle = function (map) {
            switch (map.getStyle().style) {
                //When the style is dark (i.e. satellite, night), show the dark colored theme.
                case 'satellite':
                case 'satellite_road_labels':
                case 'grayscale_dark':
                case 'night':
                case 'night':
                case 'high_contrast_dark':
                    return azmaps.ControlStyle.dark;
            }
            return azmaps.ControlStyle.light;
        };
        return Utils;
    }());

    /** A control that uses the browser's geolocation API to locate the user on the map. */
    var GeolocationControl = /** @class */ (function (_super) {
        __extends(GeolocationControl, _super);
        /****************************
         * Constructor
         ***************************/
        /**
         * A control that uses the browser's geolocation API to locate the user on the map.
         * @param options Options for defining how the control is rendered and functions.
         */
        function GeolocationControl(options) {
            var _this = _super.call(this) || this;
            _this._options = {
                style: 'light',
                positionOptions: {
                    enableHighAccuracy: false,
                    maximumAge: 0,
                    timeout: 6000
                },
                showUserLocation: true,
                trackUserLocation: false,
                markerColor: 'DodgerBlue',
                maxZoom: 15,
                calculateMissingValues: false,
                updateMapCamera: true
            };
            _this._darkColor = '#011c2c';
            _this._hclStyle = null;
            _this._isActive = false;
            _this._updateMapCamera = true;
            _this._gpsArrowIcon = '<div style="{transform}"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><g transform="translate(2 2)"><polygon points="12,0 0,24 12,17 24,24" stroke-width="2" stroke="white" fill="{color}"/></g></svg></div>';
            _this._gpsDotIcon = '<div class="azmaps-map-gpsPulseIcon" style="background-color:{color}"></div>';
            _this._iconTemplate = "data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' x='0' y='0' viewBox='0 0 561 561' xml:space='preserve'><g fill='{color}'><path d='M280.5,178.5c-56.1,0-102,45.9-102,102c0,56.1,45.9,102,102,102c56.1,0,102-45.9,102-102C382.5,224.4,336.6,178.5,280.5,178.5z M507.45,255C494.7,147.9,410.55,63.75,306,53.55V0h-51v53.55C147.9,63.75,63.75,147.9,53.55,255H0v51h53.55C66.3,413.1,150.45,497.25,255,507.45V561h51v-53.55C413.1,494.7,497.25,410.55,507.45,306H561v-51H507.45z M280.5,459C181.05,459,102,379.95,102,280.5S181.05,102,280.5,102S459,181.05,459,280.5S379.95,459,280.5,459z'/></g></svg>";
            _this._gpsBtnCss = '.azmaps-map-gpsBtn{margin:0;padding:0;border:none;border-collapse:collapse;width:32px;height:32px;text-align:center;cursor:pointer;line-height:32px;background-repeat:no-repeat;background-size:20px;background-position:center center;z-index:200;box-shadow:0px 0px 4px rgba(0,0,0,0.16);}' +
                '.azmaps-map-gpsDisabled{background-image:url("{grayIcon}");}' +
                '.azmaps-map-gpsDisabled:hover{background-image:url("{blueIcon}");filter:brightness(90%);}' +
                '.azmaps-map-gpsEnabled{background-image:url("{blueIcon}");}' +
                '.azmaps-map-gpsEnabled:hover{background-image:url("{blueIcon}");filter:brightness(90%);}' +
                '.azmaps-map-gpsPulseIcon{display:block;width:15px;height:15px;border-radius:50%;background:orange;border:2px solid white;cursor:pointer;box-shadow:0 0 0 rgba(0, 204, 255, 0.6);animation:pulse 2s infinite;}@keyframes pulse {0% {box-shadow:0 0 0 0 rgba(0, 204, 255, 0.6);}70% {box-shadow:0 0 0 20px rgba(0, 204, 255, 0);}100% {box-shadow:0 0 0 0 rgba(0, 204, 255, 0);}}';
            /****************************
             * Private Methods
             ***************************/
            /** Toggles the state of the control. */
            _this._toggleBtn = function () {
                _this.toggle();
            };
            /**
             * An event handler for when the map style changes. Used when control style is set to auto.
             */
            _this._mapStyleChanged = function () {
                if (_this._button && !_this._hclStyle) {
                    _this._button.style.backgroundColor = _this._getColorFromMapStyle();
                }
            };
            /**
            * An event handler for when the map starts to move.
            * When this happens, we don't want the map camera to automatically move if tracking.
            */
            _this._mapMoveStarted = function () {
                _this._updateMapCamera = false;
            };
            /**
             * Callback for when an error occurs when getting the users location.
             * @param position The GPS position information.
             */
            _this._onGpsSuccess = function (position) {
                var pos;
                if (position) {
                    pos = [position.coords.longitude, position.coords.latitude];
                    //@ts-ignore
                    var geopos = {
                        timestamp: new Date(position.timestamp),
                        _timestamp: position.timestamp
                    };
                    Object.assign(geopos, position.coords);
                    if (_this._options.calculateMissingValues && _this._lastKnownPosition) {
                        if (typeof position.coords.speed !== 'number') {
                            var dt = position.timestamp - _this._lastKnownPosition.properties._timestamp;
                            var dx = azmaps.math.getDistanceTo(_this._lastKnownPosition.geometry.coordinates, pos);
                            geopos.speed = dx / (dt * 0.001);
                        }
                        if (typeof position.coords.heading !== 'number') {
                            geopos.heading = azmaps.math.getHeading(_this._lastKnownPosition.geometry.coordinates, pos);
                        }
                    }
                    _this._lastKnownPosition = new azmaps.data.Feature(new azmaps.data.Point(pos), geopos);
                }
                if (_this._lastKnownPosition) {
                    if (!pos) {
                        pos = _this._lastKnownPosition.geometry.coordinates;
                    }
                    if (_this._isActive) {
                        var icon = _this._getMarkerIcon();
                        if (_this._options.showUserLocation) {
                            if (!_this._gpsMarker) {
                                _this._gpsMarker = new azmaps.HtmlMarker({
                                    position: pos,
                                    htmlContent: icon,
                                    color: _this._options.markerColor
                                });
                                _this._map.markers.add(_this._gpsMarker);
                            }
                            else {
                                _this._gpsMarker.setOptions({
                                    position: pos,
                                    htmlContent: icon,
                                    visible: _this._isActive && _this._options.showUserLocation
                                });
                            }
                        }
                        else {
                            _this._gpsMarker.setOptions({
                                visible: false
                            });
                        }
                        if (_this._updateMapCamera) {
                            var opt = {
                                center: pos
                            };
                            //Only adjust zoom if the user is zoomed out too much.
                            if (_this._map.getCamera().zoom < 15) {
                                opt.zoom = 15;
                            }
                            _this._map.setCamera(opt);
                        }
                    }
                    _this._invokeEvent('geolocationsuccess', _this._lastKnownPosition);
                }
            };
            /**
             * Callback for when an error occurs when getting the users location.
             * @param error The error that occured.
             */
            _this._onGpsError = function (error) {
                _this._watchId = null;
                _this._isActive = false;
                _this._updateState();
                _this._invokeEvent('geolocationerror', error);
            };
            if (options) {
                if (options.positionOptions) {
                    _this._options.positionOptions = Object.assign(_this._options.positionOptions, options.positionOptions);
                }
                if (options.style) {
                    _this._options.style = options.style;
                }
                if (options.markerColor) {
                    _this._options.markerColor = options.markerColor;
                }
                if (typeof options.showUserLocation === 'boolean') {
                    _this._options.showUserLocation = options.showUserLocation;
                }
                if (typeof options.trackUserLocation === 'boolean') {
                    _this._options.trackUserLocation = options.trackUserLocation;
                }
                if (typeof options.maxZoom === 'number') {
                    _this._options.maxZoom = Math.min(Math.max(options.maxZoom, 0), 24);
                }
                if (typeof options.calculateMissingValues === 'boolean') {
                    _this._options.calculateMissingValues = options.calculateMissingValues;
                }
                if (typeof options.updateMapCamera === 'boolean') {
                    _this._options.updateMapCamera = options.updateMapCamera;
                    _this._updateMapCamera = options.updateMapCamera;
                }
            }
            return _this;
        }
        /****************************
         * Public Methods
         ***************************/
        /** Disposes the control. */
        GeolocationControl.prototype.dispose = function () {
            var _this = this;
            if (this._map) {
                this._map.controls.remove(this);
            }
            Object.keys(this).forEach(function (key) {
                _this[key] = null;
            });
        };
        /** Get sthe last known position from the geolocation control. */
        GeolocationControl.prototype.getLastKnownPosition = function () {
            return this._lastKnownPosition;
        };
        /**
         * Action to perform when the control is added to the map.
         * @param map The map the control was added to.
         * @param options The control options used when adding the control to the map.
         * @returns The HTML Element that represents the control.
         */
        GeolocationControl.prototype.onAdd = function (map, options) {
            var _this = this;
            this._map = map;
            this._hclStyle = Utils.getHclStyle(map);
            this._resource = GeolocationControl._getTranslations(this._map.getStyle().language);
            //Create different color icons and merge into CSS.
            var grayIcon = this._iconTemplate.replace('{color}', 'Gray');
            var blueIcon = this._iconTemplate.replace('{color}', 'DeepSkyBlue');
            var css = this._gpsBtnCss.replace(/{grayIcon}/g, grayIcon).replace(/{blueIcon}/g, blueIcon);
            //Add the CSS style for the control to the DOM.
            var style = document.createElement('style');
            style.innerHTML = css;
            document.body.appendChild(style);
            //Create the button.
            this._container = document.createElement('div');
            this._container.classList.add('azure-maps-control-container');
            this._container.setAttribute('aria-label', this._resource.title);
            this._container.style.flexDirection = 'column';
            //Hide the button by default. 
            this._container.style.display = 'none';
            this._button = document.createElement("button");
            this._button.classList.add('azmaps-map-gpsBtn');
            this._button.classList.add('azmaps-map-gpsDisabled');
            this._button.setAttribute('title', this._resource.enableTracking);
            this._button.setAttribute('alt', this._resource.enableTracking);
            this._button.setAttribute('type', 'button');
            this._button.addEventListener('click', this._toggleBtn);
            this._updateState();
            this.setOptions(this._options);
            this._container.appendChild(this._button);
            //Check that geolocation is supported.
            GeolocationControl.isSupported().then(function (supported) {
                if (supported) {
                    //Show the button when we know geolocation is supported.
                    _this._container.style.display = '';
                }
                else {
                    //Device doesn't support getting position.
                    //@ts-ignore
                    _this._invokeEvent('geolocationerror', {
                        code: 2,
                        message: 'Geolocation API not supported by device.'
                    });
                }
            });
            this._map.events.add('movestart', this._mapMoveStarted);
            this.setOptions(this._options);
            return this._container;
        };
        /**
         * Action to perform when control is removed from the map.
         */
        GeolocationControl.prototype.onRemove = function () {
            if (this._container) {
                this._container.remove();
            }
            if (this._options.style === 'auto') {
                this._map.events.remove('styledata', this._mapStyleChanged);
            }
            this._map.events.remove('movestart', this._mapMoveStarted);
            if (typeof this._watchId !== 'undefined') {
                navigator.geolocation.clearWatch(this._watchId);
            }
            if (this._gpsMarker) {
                this._map.markers.remove(this._gpsMarker);
            }
            this._map = null;
        };
        /** Gets the options of the geolocation control. */
        GeolocationControl.prototype.getOptions = function () {
            return Object.assign({}, this._options);
        };
        /**
         * Sets the options of the geolocation control.
         * @param options The options.
         */
        GeolocationControl.prototype.setOptions = function (options) {
            if (options) {
                var color = 'white';
                if (this._hclStyle) {
                    if (Utils.getAutoStyle(this._map) === azmaps.ControlStyle.dark) {
                        color = this._darkColor;
                    }
                }
                else {
                    if (this._options.style === 'auto') {
                        this._map.events.remove('styledata', this._mapStyleChanged);
                    }
                    this._options.style = options.style;
                    var color = options.style || 'light';
                    switch (options.style) {
                        case 'dark':
                            color = this._darkColor;
                            break;
                        case 'auto':
                            //Color will change between light and dark depending on map style.
                            this._map.events.add('styledata', this._mapStyleChanged);
                            color = this._getColorFromMapStyle();
                            break;
                    }
                }
                this._button.style.backgroundColor = color;
                if (options.markerColor) {
                    this._options.markerColor = options.markerColor;
                    if (this._gpsMarker) {
                        this._gpsMarker.setOptions({
                            color: options.markerColor
                        });
                    }
                }
                if (typeof options.maxZoom === 'number') {
                    this._options.maxZoom = Math.min(Math.max(options.maxZoom, 0), 24);
                }
                if (typeof options.calculateMissingValues === 'boolean') {
                    this._options.calculateMissingValues = options.calculateMissingValues;
                }
                if (typeof options.updateMapCamera === 'boolean') {
                    this._options.updateMapCamera = options.updateMapCamera;
                    this._updateMapCamera = options.updateMapCamera;
                }
                if (typeof options.showUserLocation === 'boolean') {
                    this._options.showUserLocation = options.showUserLocation;
                    if (this._gpsMarker) {
                        this._gpsMarker.setOptions({
                            visible: this._isActive && this._options.showUserLocation
                        });
                    }
                    else if (this._lastKnownPosition) {
                        this._onGpsSuccess();
                    }
                }
                if (typeof options.trackUserLocation === 'boolean') {
                    this._options.trackUserLocation = options.trackUserLocation;
                }
                if (options.positionOptions) {
                    var opt = {};
                    if (options.positionOptions.enableHighAccuracy) {
                        opt.enableHighAccuracy = options.positionOptions.enableHighAccuracy;
                    }
                    if (typeof options.positionOptions.maximumAge === 'number') {
                        opt.maximumAge = options.positionOptions.maximumAge;
                    }
                    if (typeof options.positionOptions.timeout === 'number') {
                        opt.timeout = options.positionOptions.timeout;
                    }
                    if (Object.keys(opt).length > 0) {
                        this._options.positionOptions = Object.assign(this._options.positionOptions, opt);
                        this._stopTracking();
                        this._updateState();
                    }
                }
            }
        };
        /**
         * Toggles the state of the Geolocation control button. If a boolean state is not passed in, will toggle to opposite of current state.
         * @param isActive The state to toggle to. If not specified, will toggle to opposite of current state.
         */
        GeolocationControl.prototype.toggle = function (isActive) {
            this._isActive = (typeof isActive === 'boolean') ? isActive : !this._isActive;
            if (this._isActive && this._options.trackUserLocation && this._lastKnownPosition) {
                this._onGpsSuccess();
            }
            this._updateMapCamera = this._options.updateMapCamera;
            this._updateState();
        };
        /** Checks to see if the geolocation API is supported in the browser. */
        GeolocationControl.isSupported = function () {
            return __awaiter(this, void 0, void 0, function () {
                var p;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!window.navigator['permissions']) return [3 /*break*/, 2];
                            return [4 /*yield*/, window.navigator['permissions'].query({ name: 'geolocation' })];
                        case 1:
                            p = _a.sent();
                            return [2 /*return*/, p.state !== 'denied'];
                        case 2: return [2 /*return*/, !!window.navigator.geolocation];
                    }
                });
            });
        };
        /**
         * Retrieves the background color for the button based on the map style. This is used when style is set to auto.
         */
        GeolocationControl.prototype._getColorFromMapStyle = function () {
            return Utils.getAutoStyle(this._map) === azmaps.ControlStyle.dark ? this._darkColor : 'white';
        };
        /** Removes the geolocation watcher used for tracking. */
        GeolocationControl.prototype._stopTracking = function () {
            if (typeof this._watchId === 'number') {
                navigator.geolocation.clearWatch(this._watchId);
                this._watchId = null;
            }
        };
        /**
         * Updates the state of the button.
         */
        GeolocationControl.prototype._updateState = function () {
            if (!this._isActive || this._options.trackUserLocation) {
                this._stopTracking();
            }
            if (this._gpsMarker) {
                this._gpsMarker.setOptions({
                    visible: this._isActive && this._options.showUserLocation
                });
            }
            var ariaLabel = this._resource.myLocation;
            var removeClass = 'azmaps-map-gpsEnabled';
            var addClass = 'azmaps-map-gpsDisabled';
            if (this._isActive) {
                removeClass = 'azmaps-map-gpsDisabled';
                addClass = 'azmaps-map-gpsEnabled';
                if (this._options.trackUserLocation) {
                    if (typeof this._watchId !== 'number') {
                        this._watchId = navigator.geolocation.watchPosition(this._onGpsSuccess, this._onGpsError, this._options.positionOptions);
                    }
                    ariaLabel = this._resource.disableTracking;
                }
                else {
                    navigator.geolocation.getCurrentPosition(this._onGpsSuccess, this._onGpsError, this._options.positionOptions);
                }
            }
            else {
                if (this._options.trackUserLocation) {
                    ariaLabel = this._resource.enableTracking;
                }
            }
            this._button.setAttribute('title', ariaLabel);
            this._button.setAttribute('alt', ariaLabel);
            this._button.classList.remove(removeClass);
            this._button.classList.add(addClass);
        };
        /** Generates the mark icon HTML */
        GeolocationControl.prototype._getMarkerIcon = function () {
            var icon = this._gpsDotIcon;
            var h = this._lastKnownPosition.properties.heading;
            if (this._options.trackUserLocation && h !== null && !isNaN(h)) {
                h = Math.round(h);
                //TODO: update when markers support rotation.
                var transform = "-webkit-transform:rotate(" + h + "deg);transform:rotate(" + h + "deg)";
                icon = this._gpsArrowIcon.replace('{transform}', transform);
            }
            return icon;
        };
        /**
         * Returns the set of translation text resources needed for the control for a given language.
         * @param lang The language code to retrieve the text resources for.
         * @returns An object containing text resources in the specified language.
         */
        GeolocationControl._getTranslations = function (lang) {
            if (lang && lang.indexOf('-') > 0) {
                lang = lang.substring(0, lang.indexOf('-'));
            }
            switch (lang.toLowerCase()) {
                //Afrikaans
                case 'af':
                    return { enableTracking: 'begin dop', disableTracking: 'stop die dop', myLocation: 'my plek', title: 'ligginggewing beheer' };
                //Arabic
                case 'ar':
                    return { enableTracking: 'بدء تتبع', disableTracking: 'تتبع توقف', myLocation: 'موقعي', title: 'السيطرة تحديد الموقع الجغرافي' };
                //Basque
                case 'eu':
                    return { enableTracking: 'Hasi segimendua', disableTracking: 'Stop jarraipena', myLocation: 'Nire kokapena', title: 'Geokokapen kontrol' };
                //Bulgarian
                case 'bg':
                    return { enableTracking: 'Започнете да проследявате', disableTracking: 'Спиране на проследяването', myLocation: 'Моето място', title: 'контрол за геолокация' };
                //Chinese
                case 'zh':
                    return { enableTracking: '开始跟踪', disableTracking: '停止追踪', myLocation: '我的位置', title: '地理位置控制' };
                //Croatian
                case 'hr':
                    return { enableTracking: 'Započnite praćenje', disableTracking: 'zaustavljanje praćenje', myLocation: 'Moja lokacija', title: 'kontrola Geolocation' };
                //Czech
                case 'cs':
                    return { enableTracking: 'začít sledovat', disableTracking: 'Zastavit sledování', myLocation: 'Moje lokace', title: 'ovládání Geolocation' };
                //Danish
                case 'da':
                    return { enableTracking: 'Start sporing', disableTracking: 'Stop sporing', myLocation: 'min placering', title: 'Geolocation kontrol' };
                //Dutch
                case 'nl':
                    return { enableTracking: 'beginnen met het bijhouden', disableTracking: 'stop volgen', myLocation: 'Mijn locatie', title: 'Geolocation controle' };
                //Estonian
                case 'et':
                    return { enableTracking: 'Alusta jälgimist', disableTracking: 'Stopp jälgimise', myLocation: 'Minu asukoht', title: 'Geolocation kontrolli' };
                //Finnish
                case 'fi':
                    return { enableTracking: 'Aloita seuranta', disableTracking: 'Lopeta seuranta', myLocation: 'Minun sijaintini', title: 'Geolocation ohjaus' };
                //French
                case 'fr':
                    return { enableTracking: 'Démarrer le suivi', disableTracking: "suivi d'arrêt", myLocation: 'Ma position', title: 'le contrôle de géolocalisation' };
                //Galician
                case 'gl':
                    return { enableTracking: 'comezar a controlar', disableTracking: 'seguimento parada', myLocation: 'A miña localización', title: 'control de xeolocalización' };
                //German
                case 'de':
                    return { enableTracking: 'starten Sie Tracking', disableTracking: 'Stop-Tracking', myLocation: 'Mein Standort', title: 'Geolokalisierung Steuer' };
                //Greek
                case 'el':
                    return { enableTracking: 'Ξεκινήστε την παρακολούθηση', disableTracking: 'Διακοπή παρακολούθησης', myLocation: 'Η τοποθεσία μου', title: 'ελέγχου geolocation' };
                //Hindi
                case 'hi':
                    return { enableTracking: 'ट्रैक करना शुरू', disableTracking: 'बंद करो ट्रैकिंग', myLocation: 'मेरा स्थान', title: 'जियोलोकेशन नियंत्रण' };
                //Hungarian
                case 'hu':
                    return { enableTracking: 'követés indítása', disableTracking: 'követés leállítása', myLocation: 'Saját hely', title: 'Geolocation ellenőrzés' };
                //Indonesian
                case 'id':
                    return { enableTracking: 'Mulai pelacakan', disableTracking: 'berhenti pelacakan', myLocation: 'Lokasi saya', title: 'kontrol geolocation' };
                //Italian
                case 'it':
                    return { enableTracking: 'Inizia il monitoraggio', disableTracking: 'monitoraggio arresto', myLocation: 'La mia posizione', title: 'controllo geolocalizzazione' };
                //Japanese
                case 'ja':
                    return { enableTracking: '追跡を開始', disableTracking: '追跡を停止', myLocation: '私の場所', title: 'ジオロケーション制御' };
                //Kazakh
                case 'kk':
                    return { enableTracking: 'қадағалау бастау', disableTracking: 'қадағалау тоқтату', myLocation: 'Менің орналасуы', title: 'геоорын бақылау' };
                //Korean
                case 'ko':
                    return { enableTracking: '추적 시작', disableTracking: '정지 추적', myLocation: '내 위치', title: '위치 정보 제어' };
                //Spanish
                case 'es':
                    return { enableTracking: 'iniciar el seguimiento', disableTracking: 'Detener el seguimiento', myLocation: 'Mi ubicacion', title: 'control de geolocalización' };
                //Latvian
                case 'lv':
                    return { enableTracking: 'Sākt izsekošana', disableTracking: 'Stop izsekošana', myLocation: 'Mana atrašanās vieta', title: 'Geolocation kontrole' };
                //Lithuanian
                case 'lt':
                    return { enableTracking: 'pradėti stebėti', disableTracking: 'Sustabdyti sekimo', myLocation: 'Mano vieta', title: 'Geografinė padėtis kontrolė' };
                //Malay
                case 'ms':
                    return { enableTracking: 'mula menjejaki', disableTracking: 'Stop pengesanan', myLocation: 'Lokasi saya', title: 'kawalan geolokasi' };
                //Norwegian
                case 'nb':
                    return { enableTracking: 'begynne å spore', disableTracking: 'stopp sporing', myLocation: 'Min posisjon', title: 'geolocation kontroll' };
                //Polish
                case 'pl':
                    return { enableTracking: 'rozpocząć śledzenie', disableTracking: 'Zatrzymaj śledzenie', myLocation: 'Moja lokacja', title: 'kontrola Geolokalizacja' };
                //Portuguese
                case 'pt':
                    return { enableTracking: 'começar a controlar', disableTracking: 'rastreamento parada', myLocation: 'Minha localização', title: 'controle de geolocalização' };
                //Romanian
                case 'ro':
                    return { enableTracking: 'Pornire urmărire', disableTracking: 'Oprire urmărire', myLocation: 'Locatia mea', title: 'controlul de geolocalizare' };
                //Russian
                case 'ru':
                    return { enableTracking: 'Начать отслеживание', disableTracking: 'остановка отслеживания', myLocation: 'Мое местонахождение', title: 'контроль геолокации' };
                //Serbian
                case 'sr':
                    return { enableTracking: 'Старт трацкинг', disableTracking: 'стоп праћење', myLocation: 'Моја локација', title: 'kontrola геолоцатион' };
                //Slovak
                case 'sk':
                    return { enableTracking: 'začať sledovať', disableTracking: 'zastaviť sledovanie', myLocation: 'moja poloha', title: 'ovládanie Geolocation' };
                //Slovenian
                case 'sl':
                    return { enableTracking: 'Začni sledenje', disableTracking: 'Stop za sledenje', myLocation: 'moja lokacija', title: 'nadzor Geolocation' };
                //Swedish
                case 'sv':
                    return { enableTracking: 'börja spåra', disableTracking: 'Stoppa spårning', myLocation: 'Min plats', title: 'geolocation kontroll' };
                //Thai
                case 'th':
                    return { enableTracking: 'เริ่มการติดตาม', disableTracking: 'ติดตามหยุด', myLocation: 'ตำแหน่งของฉัน', title: 'ควบคุม Geolocation' };
                //Turkish
                case 'tr':
                    return { enableTracking: 'izlemeyi başlat', disableTracking: 'Dur izleme', myLocation: 'Benim konumum', title: 'Coğrafi Konum kontrolü' };
                //Ukrainian
                case 'uk':
                    return { enableTracking: 'почати відстеження', disableTracking: 'зупинка відстеження', myLocation: 'моє місце розташування', title: 'контроль геолокації' };
                //Vietnamese
                case 'vi':
                    return { enableTracking: 'Bắt đầu theo dõi', disableTracking: 'dừng theo dõi', myLocation: 'vị trí của tôi', title: 'kiểm soát định vị' };
                //English
                case 'en':
                default:
                    return { enableTracking: 'Start tracking', disableTracking: 'Stop tracking', myLocation: 'My location', title: 'Geolocation control' };
            }
        };
        return GeolocationControl;
    }(azmaps.internal.EventEmitter));



    var baseControl = /*#__PURE__*/Object.freeze({
        __proto__: null,
        GeolocationControl: GeolocationControl
    });

    var control = Namespace.merge("atlas.control", baseControl);

    exports.control = control;

}(this.atlas = this.atlas || {}, atlas));
