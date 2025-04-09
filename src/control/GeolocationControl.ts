import * as azmaps from "azure-maps-control";
import { GeolocationControlOptions } from './GeolocationControlOptions';
import { GeolocationProperties } from './GeolocationProperties';

/** Event arg object for the Geolocation control. */
export interface GeolocationControlEventArgs {
    /** The type of event that fired. */
    type: 'geolocationerror' | 'geolocationsuccess' | 'compassheadingchanged';

    /** Error information from the Geolocation API. */
    error?: GeolocationPositionError;

    /** The position of the user. Set on geolocation success. Last known value will be included with the compass heading changed event. */
    feature?: azmaps.data.Feature<azmaps.data.Point, GeolocationProperties>;

    /** The compass heading. Set when the compass heading changes or when there is a last known compass heading when there is a geolocation success. */
    compassHeading?: number;
}

/** The events supported by the `GeolocationControl`. */
export interface GeolocationControlEvents {
    /** Event fired when user position is successful captured or updated. */
    geolocationsuccess: GeolocationControlEventArgs;

    /** Event fired when an error has occured. */
    geolocationerror: GeolocationControlEventArgs;

    /** Event fired when the compass heading changes. Returns a compass heading in degrees where North = 0, East = 90, South = 180, West = 270. This event may be fired a lot and is throttled by default at 100ms. */
    compassheadingchanged: GeolocationControlEventArgs;
}

 /** A control that uses the browser's geolocation API to locate the user on the map. */
export class GeolocationControl extends azmaps.internal.EventEmitter<GeolocationControlEvents> implements azmaps.Control {
    /****************************
    * Private Properties
    ***************************/

    private _container: HTMLElement;
    private _button: HTMLButtonElement;
    private _options: GeolocationControlOptions = {
        style: 'light',
        positionOptions: {
            enableHighAccuracy: true,
            maximumAge: Infinity,
            timeout: 10000 
        },
        showUserLocation: true,
        trackUserLocation: true,
        markerColor: 'DodgerBlue',
        maxZoom: 15,
        calculateMissingValues: false,
        updateMapCamera: true,
        enableCompass: true,
        compassEventThrottleDelay: 100
    };
    private _darkColor = '#011c2c';
    private _hclStyle:azmaps.ControlStyle = null;
    private _map: azmaps.Map;

    /** Resource array values: 0 - enableTracking, 1 - disableTracking, 2 - myLocation, 3 - title */
    private _resource: string[];
    private _gpsMarker: azmaps.HtmlMarker;

    private _watchId: number;
    private _isActive = false;
    private _updateMapCamera = true;
    private _lastKnownPosition: azmaps.data.Feature<azmaps.data.Point, GeolocationProperties>;
    
    private _lastCompassHeading: number = Number.NaN;
    private _compassEnabled = false;
    private _compassUpdateScheduled = false;
    private _compassEventUpdateScheduled = false;

    private static _gpsDotIcon = '<div class="gps-dot" style="background-color:{color}"></div><div class="gps-wedge"><div class="gps-pulse"></div></div>';

    private static _iconTemplate = "data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' x='0' y='0' viewBox='0 0 561 561' xml:space='preserve'><g fill='{color}'><path d='M280.5,178.5c-56.1,0-102,45.9-102,102c0,56.1,45.9,102,102,102c56.1,0,102-45.9,102-102C382.5,224.4,336.6,178.5,280.5,178.5z M507.45,255C494.7,147.9,410.55,63.75,306,53.55V0h-51v53.55C147.9,63.75,63.75,147.9,53.55,255H0v51h53.55C66.3,413.1,150.45,497.25,255,507.45V561h51v-53.55C413.1,494.7,497.25,410.55,507.45,306H561v-51H507.45z M280.5,459C181.05,459,102,379.95,102,280.5S181.05,102,280.5,102S459,181.05,459,280.5S379.95,459,280.5,459z'/></g></svg>";

    private static _gpsBtnCss = '.azmaps-gpsBtn{margin:0;padding:0;border:none;border-collapse:collapse;width:32px;height:32px;text-align:center;cursor:pointer;line-height:32px;background-repeat:no-repeat;background-size:20px;background-position:center center;z-index:200;box-shadow:0px 0px 4px rgba(0,0,0,0.16);}' +
        '.azmaps-gpsDisabled{background-image:url("{grayIcon}");}' +
        '.azmaps-gpsDisabled:hover{background-image:url("{blueIcon}");filter:brightness(90%);}' +
        '.azmaps-gpsEnabled{background-image:url("{blueIcon}");}' +
        '.azmaps-gpsEnabled:hover{background-image:url("{blueIcon}");filter:brightness(90%);}' +
        '.gps-container{position:relative;width:16px;height:16px;}' +
        '.gps-dot{width:12px;height:12px;background-color:dodgerBlue;border:2px white solid;border-radius:50%;position:absolute;top:50%;left:50%;transform: translate(-50%, -50%);z-index:100000;}' +
        '.gps-wedge{width:16px;height:16px;position:absolute;top:0;left:0;z-index:99999;}' +
        '.gps-pulse{width:100%;height:100%;border-radius:50%;background-image: radial-gradient(rgba(30,144,255,1),rgba(30,144,255,0.5));position:absolute;transform-origin:center;transform:scale(2.5);}' +
        '.gps-pulse-animation{animation:gps-pulse-animation-key 2s infinite ease-out;}' +
        '@keyframes gps-pulse-animation-key { 0% {transform:scale(0.5);opacity:1;} 100% {transform: scale(2.5);opacity:0.5;}}';    

    /****************************
     * Constructor
     ***************************/

    /**
     * A control that uses the browser's geolocation API to locate the user on the map.
     * @param options Options for defining how the control is rendered and functions.
     */
    constructor(options?: GeolocationControlOptions) {
        super();

        if (options) {
            const self = this;
            const opt = self._options;
            if (options.positionOptions) {
                opt.positionOptions = Object.assign(opt.positionOptions, options.positionOptions);
            }

            if (options.style) {
                opt.style = options.style;
            }

            if (options.markerColor) {
                opt.markerColor = options.markerColor;
            }

            if (typeof options.showUserLocation === 'boolean') {
                opt.showUserLocation = options.showUserLocation;
            }

            if (typeof options.trackUserLocation === 'boolean') {
                opt.trackUserLocation = options.trackUserLocation;
            }

            if(typeof options.maxZoom === 'number'){
                opt.maxZoom = Math.min(Math.max(options.maxZoom, 0), 24);
            }

            if (typeof options.calculateMissingValues === 'boolean') {
                opt.calculateMissingValues = options.calculateMissingValues;
            }            

            if (typeof options.updateMapCamera === 'boolean') {
                opt.updateMapCamera = options.updateMapCamera;
                self._updateMapCamera = options.updateMapCamera;
            }           

            if (typeof options.enableCompass === 'boolean') {
                opt.enableCompass = options.enableCompass;
                options.enableCompass ? self._enableCompass(): self._disableCompass();
            }

            if(typeof options.syncMapCompassHeading === 'boolean'){
                opt.syncMapCompassHeading = options.syncMapCompassHeading;                
            }

            if(typeof options.compassEventThrottleDelay === 'number' && options.compassEventThrottleDelay >= 100){
                opt.compassEventThrottleDelay = options.compassEventThrottleDelay;
            }
        }
    }

    /****************************
     * Public Methods
     ***************************/

    /** Disposes the control. */
    public dispose(): void {
        const self = this;
        if(self._map){
            self._map.controls.remove(self);
        }

        Object.keys(self).forEach(k => {
            self[k] = null;
        });
    }

    /** Get sthe last known position from the geolocation control. */
    public getLastKnownPosition(): azmaps.data.Feature<azmaps.data.Point, GeolocationProperties> {
        return JSON.parse(JSON.stringify(this._lastKnownPosition));
    }

    /**
     * Action to perform when the control is added to the map.
     * @param map The map the control was added to.
     * @param options The control options used when adding the control to the map.
     * @returns The HTML Element that represents the control.
     */
    public onAdd(map: azmaps.Map, options?: azmaps.ControlOptions): HTMLElement {
        const self = this;
        self._map = map;
        
        const mcl = map.getMapContainer().classList;
        if(mcl.contains("high-contrast-dark")){
            self._hclStyle = <azmaps.ControlStyle>'dark';
        }  else if (mcl.contains("high-contrast-light")){
            self._hclStyle = <azmaps.ControlStyle>'light';
        }

        self._resource = self._getTranslations(self._map.getStyle().language);

        //Create different color icons and merge into CSS.
        const gc = GeolocationControl;
        const grayIcon = gc._iconTemplate.replace('{color}', 'Gray');
        const blueIcon = gc._iconTemplate.replace('{color}', 'DeepSkyBlue');
        const css = gc._gpsBtnCss.replace(/{grayIcon}/g, grayIcon).replace(/{blueIcon}/g, blueIcon);

        //Add the CSS style for the control to the DOM.
        const style = document.createElement('style');
        style.innerHTML = css;
        document.body.appendChild(style);

        //Create the button.
        const c = document.createElement('div');
        c.classList.add('azure-maps-control-container');
        c.setAttribute('aria-label', self._resource[0]);
        c.style.flexDirection = 'column';

        //Hide the button by default. 
        c.style.display = 'none';
        self._container = c;

        const b = document.createElement("button");
        b.classList.add('azmaps-gpsBtn');
        b.classList.add('azmaps-gpsDisabled');
        b.setAttribute('title', self._resource[0]);
        b.setAttribute('alt', self._resource[0]);
        b.setAttribute('type', 'button');
        b.addEventListener('click', self._toggleBtn);
        self._button = b;

        self._updateState();
        self.setOptions(self._options);
        c.appendChild(b);

        //Check that geolocation is supported.
        gc.isSupported().then(supported => {
            if (supported) {
                //Show the button when we know geolocation is supported.
                self._container.style.display = '';
            } else {
                //Device doesn't support getting position.
                //@ts-ignore
                self._invokeEvent('geolocationerror', {
                    type: 'geolocationerror',
                    error: {
                        code: 2,
                        message: 'Geolocation API not supported by device.',
                        PERMISSION_DENIED: 1,
                        POSITION_UNAVAILABLE: 2,
                        TIMEOUT: 3
                    }
                });
            }
        });

        self._map.events.add('movestart', self._mapMoveStarted);
        self._map.events.add('moveend', self._mapMoveEnded);

        self.setOptions(self._options);

        addEventListener('beforeunload', self._pageUnload, false);        
        return c;
    }

    /**
     * Action to perform when control is removed from the map.
     */
    public onRemove(): void {
        const self = this;
        if (self._container) {
            self._container.remove();
        }

        if (self._options.style === 'auto') {
            self._map.events.remove('styledata', self._mapStyleChanged);
        }

        self._map.events.remove('movestart', self._mapMoveStarted);
        self._map.events.remove('moveend', self._mapMoveEnded);       
        
        self._disableCompass();

        if (typeof self._watchId !== 'undefined') {
            navigator.geolocation.clearWatch(self._watchId);
        }

        if (self._gpsMarker) {
            self._map.markers.remove(self._gpsMarker);
        }

        self._map = null;
        removeEventListener('beforeunload', self._pageUnload);
    }

    /** Gets the options of the geolocation control. */
    public getOptions(): GeolocationControlOptions {
        return Object.assign({}, this._options);
    }

    /**
     * Sets the options of the geolocation control.
     * @param options The options.
     */
    public setOptions(options: GeolocationControlOptions): void {
        const self = this;
        const o = self._options;

        if (options) {
            let color = 'white';

            if(self._hclStyle) {
                if(self._hclStyle === 'dark'){
                    color = self._darkColor;
                }
            } else {
                if (o.style === 'auto') {
                    self._map.events.remove('styledata', self._mapStyleChanged);
                }

                o.style = options.style;

                switch (options.style) {
                    case 'dark':
                        color = self._darkColor;
                        break;
                    case 'auto':
                        //Color will change between light and dark depending on map style.
                        self._map.events.add('styledata', self._mapStyleChanged);
                        color = self._getColorFromMapStyle();
                        break;
                    //case 'light':
                        //break;
                }
            }

            self._button.style.backgroundColor = color;           

            if (options.markerColor) {
                o.markerColor = options.markerColor;

                if (self._gpsMarker) {
                    //@ts-ignore
                    self._gpsMarker.getOptions().htmlContent.querySelector('.gps-dot').style.backgroundColor = options.markerColor;
                }
            }

            if(typeof options.maxZoom === 'number'){
                o.maxZoom = Math.min(Math.max(options.maxZoom, 0), 24);
            }

            if (typeof options.calculateMissingValues === 'boolean') {
                o.calculateMissingValues = options.calculateMissingValues;
            }

            if (typeof options.updateMapCamera === 'boolean') {
                o.updateMapCamera = options.updateMapCamera;
                self._updateMapCamera = options.updateMapCamera;
            }

            if (typeof options.showUserLocation === 'boolean') {
                o.showUserLocation = options.showUserLocation;

                if (self._gpsMarker) {
                    self._gpsMarker.setOptions({
                        visible: self._isActive && options.showUserLocation
                    });
                } else if (self._lastKnownPosition) {
                    self._onGpsSuccess();
                }
            }

            if (typeof options.trackUserLocation === 'boolean') {
                o.trackUserLocation = options.trackUserLocation;
            }

            if (options.positionOptions) {
                let opt: PositionOptions = {};

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
                    o.positionOptions = Object.assign(o.positionOptions, opt);
                    self._stopTracking();
                    self._updateState();
                }
            }

            if(typeof options.enableCompass === 'boolean'){
                o.enableCompass = options.enableCompass;
                options.enableCompass ? self._enableCompass(): self._disableCompass();

                //If the compass is not enabled, reset the map heading to 0.
                if(!o.enableCompass){
                    self._map.setCamera({ bearing: 0 });
                }
            }

            if(typeof options.syncMapCompassHeading === 'boolean'){
                o.syncMapCompassHeading = options.syncMapCompassHeading;  
                
                //If the compass heading syncing is not enabled, reset the map heading to 0.
                if(!o.syncMapCompassHeading){
                    self._map.setCamera({ bearing: 0 });
                }
            }

            if(typeof options.compassEventThrottleDelay === 'number' && options.compassEventThrottleDelay >= 100){
                o.compassEventThrottleDelay = options.compassEventThrottleDelay;
            }
        }
    }

    /**
     * Toggles the state of the Geolocation control button. If a boolean state is not passed in, will toggle to opposite of current state. 
     * @param isActive The state to toggle to. If not specified, will toggle to opposite of current state.
     */
    public toggle(isActive?: boolean): void {    
        const self = this;    
        self._isActive = (typeof isActive === 'boolean') ? isActive : !self._isActive;
        
        if (self._isActive && self._options.trackUserLocation && self._lastKnownPosition) {
            self._onGpsSuccess();
        }

        self._updateMapCamera = self._options.updateMapCamera;
        self._updateState();
    }

    /** Checks to see if the geolocation API is supported in the browser. */
    public static async isSupported(): Promise<boolean> {
        if (window.navigator.permissions) {
            // navigator.permissions has incomplete browser support
            // http://caniuse.com/#feat=permissions-api
            // Test for the case where a browser disables Geolocation because of an insecure origin.

            const p = await window.navigator.permissions.query({ name: 'geolocation' });            
            return p.state !== 'denied';
        } 

        return !!window.navigator.geolocation;
    }

    /****************************
     * Private Methods
     ***************************/

    /** Toggles the state of the control. */
    private _toggleBtn = () => {
        this.toggle();
    };

    /**
     * An event handler for when the map style changes. Used when control style is set to auto.
     */
    private _mapStyleChanged = () => {
        const self = this;    
        if (self._button && !self._hclStyle) {
            self._button.style.backgroundColor = self._getColorFromMapStyle();
        }
    };

    /**
    * An event handler for when the map starts to move.
    * When this happens, we don't want the map camera to automatically move if tracking.
    */
    private _mapMoveStarted = () => {
        this._updateMapCamera = false;
    };

    /**
    * An event handler for when the map stops to moving.
    * When this happens, we don't want the map camera to automatically move if tracking.
    */
      private _mapMoveEnded = () => {
        this._updateMapCamera = this._options.updateMapCamera;
    };

    /**
     * Retrieves the background color for the button based on the map style. This is used when style is set to auto.
     */
    private _getColorFromMapStyle(): string {
        //When the style is dark (i.e. satellite, night), show the dark colored theme.
        if(['satellite', 'satellite_road_labels', 'grayscale_dark','night'].indexOf(this._map.getStyle().style) > -1){
            return this._darkColor;
        }

        return 'white';
    }

    /** Removes the geolocation watcher used for tracking. */
    private _stopTracking(): void {
        const self = this;
        if (typeof self._watchId === 'number') {
            navigator.geolocation.clearWatch(self._watchId);
            self._watchId = null;
        }
    }

    /**
     * Updates the state of the button.
     */
    private _updateState(): void {
        const self = this;
        if (!self._isActive || self._options.trackUserLocation) {
            self._stopTracking();
        }

        if (self._gpsMarker) {
            self._gpsMarker.setOptions({
                visible: self._isActive && self._options.showUserLocation
            });
        }

        let ariaLabel = self._resource[2];
        let removeClass = 'azmaps-gpsEnabled';
        let addClass = 'azmaps-gpsDisabled';

        if (self._isActive) {
            removeClass = 'azmaps-gpsDisabled';
            addClass = 'azmaps-gpsEnabled';

            if (self._options.trackUserLocation) {
                if (typeof self._watchId !== 'number') {
                    self._watchId = navigator.geolocation.watchPosition(self._onGpsSuccess, self._onGpsError, self._options.positionOptions);
                }

                ariaLabel = self._resource[1];
            } else {
                //True high accuracy first then fall back if needed.
                navigator.geolocation.getCurrentPosition(self._onGpsSuccess, self._onGpsError, self._options.positionOptions);
            }           
        } else {
            if (self._options.trackUserLocation) {
                ariaLabel = self._resource[0];
            }
        }

        const b = self._button;
        b.setAttribute('title', ariaLabel);
        b.setAttribute('alt', ariaLabel);

        b.classList.remove(removeClass);
        b.classList.add(addClass);
    }

    /**
     * Callback for when an error occurs when getting the users location.
     * @param position The GPS position information.
     */
    private _onGpsSuccess = (position?: GeolocationPosition) => {
        const self = this;
        const options = self._options;
        const map = self._map;
        let lastKnownPosition = self._lastKnownPosition;
        let gpsMarker = self._gpsMarker;
        let pos: azmaps.data.Position;

        if(position){
            pos = [position.coords.longitude, position.coords.latitude];

            //@ts-ignore
            let geopos: GeolocationProperties = {
                timestamp: new Date(position.timestamp),
                _timestamp: position.timestamp
            };

            Object.assign(geopos, position.coords);

            if(options.calculateMissingValues && lastKnownPosition){
                if(typeof position.coords.speed !== 'number'){
                    let dt = position.timestamp - lastKnownPosition.properties._timestamp;
                    let dx = azmaps.math.getDistanceTo(lastKnownPosition.geometry.coordinates, pos);
                    geopos.speed = dx/(dt * 0.001);
                }

                if(typeof position.coords.heading !== 'number'){
                    geopos.heading = azmaps.math.getHeading(lastKnownPosition.geometry.coordinates, pos);
                    geopos.headingType = 'calculated';
                }
            } else if (!isNaN(geopos.heading)){
                geopos.headingType = 'geolocation';
            }

            if(!isNaN(self._lastCompassHeading)) {
                geopos.compassHeading = self._lastCompassHeading;
            }

            lastKnownPosition = new azmaps.data.Feature(new azmaps.data.Point(pos), geopos);
            self._lastKnownPosition = lastKnownPosition;
        } 
        
        if(lastKnownPosition){
            if(!pos){
                pos = lastKnownPosition.geometry.coordinates;
            }

            if (self._isActive) {
                if (options.showUserLocation) {
                    if (!gpsMarker) {
                        let icon = self._getMarkerIcon();

                        self._gpsMarker = new azmaps.HtmlMarker({
                            position: pos,
                            htmlContent: icon,
                            anchor: 'center'
                        });

                        //@ts-ignore
                        self._gpsMarker.marker.setPitchAlignment('map');
                        //@ts-ignore
                        self._gpsMarker.marker.setRotationAlignment('map');

                        map.markers.add(self._gpsMarker);
                    } else {
                        gpsMarker.setOptions({
                            position: pos,
                            visible: self._isActive && options.showUserLocation
                        });
                    }

                    self._updateMarkerHeading();
                } else {
                    gpsMarker.setOptions({
                        visible: false
                    });
                }

                if (self._updateMapCamera) {
                    const opt: any = {
                        center: pos
                    };

                    //Only adjust zoom if the user is zoomed out too much.
                    if (map.getCamera().zoom < 15) {
                        opt.zoom = 15;
                    }

                    //Rotate the map to align with the compass heading.
                    if(self._options.syncMapCompassHeading && !isNaN(self._lastCompassHeading)) {
                        opt.bearing = self._lastCompassHeading;
                    }

                    map.setCamera(opt);
                }
            }

            const args: GeolocationControlEventArgs = {
                type: 'geolocationsuccess',
                feature: lastKnownPosition,
            };

            if(!isNaN(self._lastCompassHeading)) {
                args.compassHeading = self._lastCompassHeading;
            }

            self._invokeEvent('geolocationsuccess', args);
        }
    };

    /**
     * Callback for when an error occurs when getting the users location.
     * @param error The error that occured.
     */
    private _onGpsError = (error: GeolocationPositionError) => {
        //Don't do anything other than report the error. Often it will be that there was a timeout when getting the users location.
        this._invokeEvent('geolocationerror', {
            type: 'geolocationerror',
            error: error
        });
    }

    /** Generates the mark icon HTML */
    private _getMarkerIcon(): HTMLDivElement {
        let icon = document.createElement('div');
        icon.className = 'gps-container';
        icon.innerHTML = GeolocationControl._gpsDotIcon.replace('{color}', this._options.markerColor);
        return icon;
    }

    /**
     * Updates the marker heading based on the last known compass heading.
     */
    private _updateMarkerHeading(): void {
        const self = this;

        if(self._gpsMarker){
            let h = self._lastCompassHeading;
            let clipPath = 'none';
            let animate = true;

            if(isNaN(h)){
                const props = self._lastKnownPosition.properties;
                const h2 = props.heading;

                //If a heading value is set and is either from the geolocation API, or calculated when in user tracking mode, use that.
                if(!isNaN(h2) && (props.headingType === 'geolocation' || (self._options.trackUserLocation && self._options.calculateMissingValues))){
                    h = h2;
                }
            }
            
            if (!isNaN(h)) {
                h = Math.round(h);
                //@ts-ignore
                self._gpsMarker.marker.setRotation(h);
                clipPath = 'polygon(50% 50%, 0% 0%, 100% 0%)';
                animate = false;
            }

            //@ts-ignore
            const gpsPluseElm = self._gpsMarker.getOptions().htmlContent.querySelector('.gps-pulse');

            gpsPluseElm.style.clipPath = clipPath;

            const animationClass = 'gps-pulse-animation';        
            const cl = gpsPluseElm.classList;
            const hasClass = cl.contains(animationClass);
            if(animate) {
                if(!hasClass){
                    cl.add(animationClass);
                }
            } else if(hasClass){
                cl.remove(animationClass);
            }
        }
    }

    /**
     * Enable the compass by adding the event listener for device orientation changes.
     */
    private _enableCompass(): void {
        const self = this;

        if(!self._compassEnabled) {
            if ('ondeviceorientationabsolute' in window) {
                window.addEventListener('deviceorientationabsolute', self._onOrientationChanged, false);
            } else if ('ondeviceorientation' in window &&
            ('DeviceOrientationEvent' in window && 'webkitCompassHeading' in DeviceOrientationEvent.prototype)) {
                //@ts-ignore
                window.addEventListener('deviceorientation', self._onOrientationChanged, false);
            }

            self._compassEnabled = true;
        }
    }

    /**
     * Disables the compass by removing the event listener for device orientation changes.
     */
    private _disableCompass(): void {
        const self = this;

        if(self._compassEnabled) {
            if ('ondeviceorientationabsolute' in window) {
                window.removeEventListener('deviceorientationabsolute', self._onOrientationChanged, false);
            } else if ('ondeviceorientation' in window &&
            ('DeviceOrientationEvent' in window && 'webkitCompassHeading' in DeviceOrientationEvent.prototype)) {
                //@ts-ignore
                window.removeEventListener('deviceorientation', self._onOrientationChanged, false);
            }
        }

        self._compassEnabled = false;
        self._lastCompassHeading = Number.NaN;
    }

    /**
     * An event handler for when the device orientation changes. This is used to update the compass heading.
     * @param e The device orientation event.
     */
    private _onOrientationChanged = (e: DeviceOrientationEvent) => {
        const self = this;

        //Check to see if there is an update already scheduled. If so, ignore this event (throttle).
        if(!self._compassEventUpdateScheduled || !self._compassUpdateScheduled){
            let h = null;

            if (e.absolute) {
                //Calculate the compass heading based on the device orientation using Euler angles.
                h = self._eulerAnglesToCompassHeading(e.alpha, e.beta, e.gamma);
            }             
            //@ts-ignore
            else if (e.webkitCompassHeading) {
                //@ts-ignore
                h = e.webkitCompassHeading;
            }

            if(!isNaN(h)) {                
                self._lastCompassHeading = h;
                
                if(!self._compassUpdateScheduled){
                    self._compassUpdateScheduled = true;

                    //Update the marker heading no faster than every 100ms.
                    setTimeout(() => {
                        //Rotate the map to align with the compass heading.
                        if(self._options.syncMapCompassHeading) {
                            self._map.setCamera({ bearing: self._lastCompassHeading });
                        }

                        self._updateMarkerHeading();
                        self._compassUpdateScheduled = false;
                    }, 100);
                }

                if(!self._compassEventUpdateScheduled){
                    self._compassEventUpdateScheduled = true;

                    //Throttle.
                    setTimeout(() => {
                        const args: GeolocationControlEventArgs = {
                            type: 'compassheadingchanged',
                            compassHeading: h
                        };
            
                        if(self._lastKnownPosition) {
                            args.feature = self._lastKnownPosition;
                        }

                        self._invokeEvent('compassheadingchanged', args);
                        self._compassEventUpdateScheduled = false;
                    }, self._options.compassEventThrottleDelay);
                }
            } 
        }
    }

    /**
     * Computes the compass-heading from the device-orientation euler-angles.
     * Source: https://w3c.github.io/deviceorientation/#example-cad08fa0
     */
    private _eulerAnglesToCompassHeading(alpha: number | null, beta: number | null, gamma: number | null): number {
        const degtorad = Math.PI / 180;

        const _x = beta  ? beta  * degtorad : 0; // beta value
        const _y = gamma ? gamma * degtorad : 0; // gamma value
        const _z = alpha ? alpha * degtorad : 0; // alpha value
    
        const cY = Math.cos(_y);
        const cZ = Math.cos(_z);
        const sX = Math.sin(_x);
        const sY = Math.sin(_y);
        const sZ = Math.sin(_z);
    
        // Calculate Vx and Vy components
        const Vx = -cZ * sY - sZ * sX * cY;
        const Vy = -sZ * sY + cZ * sX * cY;
    
        // Calculate compass heading
        let compassHeading = Math.atan(Vx / Vy);
    
        // Convert compass heading to use whole unit circle
        if (Vy < 0) {
        compassHeading += Math.PI;
        } else if (Vx < 0) {
        compassHeading += 2 * Math.PI;
        }
    
        return compassHeading * (180 / Math.PI); // Compass Heading (in degrees)
    }
    
    //When the page is unloaded, stop tracking the user location.
    private _pageUnload = () => {
        this._stopTracking();
        this._disableCompass();
    };

    /**
     * Returns the set of translation text resources needed for the control for a given language.
     * Array values: 0 - enableTracking, 1 - disableTracking, 2 - myLocation, 3 - title
     * @param lang The language code to retrieve the text resources for.
     * @returns An object containing text resources in the specified language.
     */
    private _getTranslations(lang?: string): string[] {
        if (lang && lang.indexOf('-') > 0) {
            lang = lang.substring(0, lang.indexOf('-'));
        }

        const t = GeolocationControl._translations;
        let r = t[lang];

        if(!r){
            r = t['en']
        }

        return r;
    }

    private static _translations = {
        //Afrikaans
        'af':['begin dop', 'stop die dop', 'my plek', 'ligginggewing beheer'],
        //Arabic
        'ar':['بدء تتبع', 'تتبع توقف', 'موقعي', 'السيطرة تحديد الموقع الجغرافي'],
        //Basque
        'eu':['Hasi segimendua', 'Stop jarraipena', 'Nire kokapena', 'Geokokapen kontrol'],
        //Bulgarian
        'bg':['Започнете да проследявате', 'Спиране на проследяването', 'Моето място', 'контрол за геолокация'],
        //Chinese
        'zh':['开始跟踪', '停止追踪', '我的位置', '地理位置控制'],
        //Croatian
        'hr':['Započnite praćenje', 'zaustavljanje praćenje', 'Moja lokacija', 'kontrola Geolocation'],
        //Czech
        'cs':['začít sledovat', 'Zastavit sledování', 'Moje lokace', 'ovládání Geolocation'],
        //Danish
        'da':['Start sporing', 'Stop sporing', 'min placering', 'Geolocation kontrol'],
        //Dutch
        'nl':['beginnen met het bijhouden', 'stop volgen', 'Mijn locatie', 'Geolocation controle'],
        //Estonian
        'et':['Alusta jälgimist', 'Stopp jälgimise', 'Minu asukoht', 'Geolocation kontrolli'],
        //Finnish
        'fi':['Aloita seuranta', 'Lopeta seuranta', 'Minun sijaintini', 'Geolocation ohjaus'],
        //French
        'fr':['Démarrer le suivi', "suivi d'arrêt", 'Ma position', 'le contrôle de géolocalisation'],
        //Galician
        'gl':['comezar a controlar', 'seguimento parada', 'A miña localización', 'control de xeolocalización'],
        //German
        'de':['starten Sie Tracking', 'Stop-Tracking', 'Mein Standort', 'Geolokalisierung Steuer'],
        //Greek
        'el':['Ξεκινήστε την παρακολούθηση', 'Διακοπή παρακολούθησης', 'Η τοποθεσία μου', 'ελέγχου geolocation'],
        //Hindi
        'hi':['ट्रैक करना शुरू', 'बंद करो ट्रैकिंग', 'मेरा स्थान', 'जियोलोकेशन नियंत्रण'],
        //Hungarian
        'hu':['követés indítása', 'követés leállítása', 'Saját hely', 'Geolocation ellenőrzés'],
        //Indonesian
        'id':['Mulai pelacakan', 'berhenti pelacakan', 'Lokasi saya', 'kontrol geolocation'],
        //Italian
        'it':['Inizia il monitoraggio', 'monitoraggio arresto', 'La mia posizione', 'controllo geolocalizzazione'],
        //Japanese
        'ja':['追跡を開始', '追跡を停止', '私の場所', 'ジオロケーション制御'],
        //Kazakh
        'kk':['қадағалау бастау', 'қадағалау тоқтату', 'Менің орналасуы', 'геоорын бақылау'],
        //Korean
        'ko':['추적 시작', '정지 추적', '내 위치', '위치 정보 제어'],
        //Spanish
        'es':['iniciar el seguimiento', 'Detener el seguimiento', 'Mi ubicacion', 'control de geolocalización'],
        //Latvian
        'lv':['Sākt izsekošana', 'Stop izsekošana', 'Mana atrašanās vieta', 'Geolocation kontrole'],
        //Lithuanian
        'lt':['pradėti stebėti', 'Sustabdyti sekimo', 'Mano vieta', 'Geografinė padėtis kontrolė'],
        //Malay
        'ms':['mula menjejaki', 'Stop pengesanan', 'Lokasi saya', 'kawalan geolokasi'],
        //Norwegian
        'nb':['begynne å spore', 'stopp sporing', 'Min posisjon', 'geolocation kontroll'],
        //Polish
        'pl':['rozpocząć śledzenie', 'Zatrzymaj śledzenie', 'Moja lokacja', 'kontrola Geolokalizacja'],
        //Portuguese
        'pt':['começar a controlar', 'rastreamento parada', 'Minha localização', 'controle de geolocalização'],
        //Romanian
        'ro':['Pornire urmărire', 'Oprire urmărire', 'Locatia mea', 'controlul de geolocalizare'],
        //Russian
        'ru':['Начать отслеживание', 'остановка отслеживания', 'Мое местонахождение', 'контроль геолокации'],
        //Serbian
        'sr':['Старт трацкинг', 'стоп праћење', 'Моја локација', 'kontrola геолоцатион'],
        //Slovak
        'sk':['začať sledovať', 'zastaviť sledovanie', 'moja poloha', 'ovládanie Geolocation'],
        //Slovenian
        'sl':['Začni sledenje', 'Stop za sledenje', 'moja lokacija', 'nadzor Geolocation'],
        //Swedish
        'sv':['börja spåra', 'Stoppa spårning', 'Min plats', 'geolocation kontroll'],
        //Thai
        'th':['เริ่มการติดตาม', 'ติดตามหยุด', 'ตำแหน่งของฉัน', 'ควบคุม Geolocation'],
        //Turkish
        'tr':['izlemeyi başlat', 'Dur izleme', 'Benim konumum', 'Coğrafi Konum kontrolü'],
        //Ukrainian
        'uk':['почати відстеження', 'зупинка відстеження', 'моє місце розташування', 'контроль геолокації'],
        //Vietnamese
        'vi':['Bắt đầu theo dõi', 'dừng theo dõi', 'vị trí của tôi', 'kiểm soát định vị'],
        //English
        'en':['Start tracking', 'Stop tracking', 'My location', 'Geolocation control']
    };
}