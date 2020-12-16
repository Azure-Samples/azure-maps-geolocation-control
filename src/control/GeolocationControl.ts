import * as azmaps from "azure-maps-control";
import { GeolocationControlOptions } from './GeolocationControlOptions';
import { GeolocationProperties } from './GeolocationProperties';

/** The events supported by the `GeolocationControl`. */
export interface GeolocationControlEvents {
    /** Event fired when user position is successful captured or updated. */
    geolocationsuccess: azmaps.data.Feature<azmaps.data.Point, GeolocationProperties>;

    /** Event fired when an error has occured. */
    geolocationerror: PositionError;
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

    private static _gpsArrowIcon = '<div style="{transform}"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><g transform="translate(2 2)"><polygon points="12,0 0,24 12,17 24,24" stroke-width="2" stroke="white" fill="{color}"/></g></svg></div>';
    private static _gpsDotIcon = '<div class="azmaps-gpsPulseIcon" style="background-color:{color}"></div>';

    private static _iconTemplate = "data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' x='0' y='0' viewBox='0 0 561 561' xml:space='preserve'><g fill='{color}'><path d='M280.5,178.5c-56.1,0-102,45.9-102,102c0,56.1,45.9,102,102,102c56.1,0,102-45.9,102-102C382.5,224.4,336.6,178.5,280.5,178.5z M507.45,255C494.7,147.9,410.55,63.75,306,53.55V0h-51v53.55C147.9,63.75,63.75,147.9,53.55,255H0v51h53.55C66.3,413.1,150.45,497.25,255,507.45V561h51v-53.55C413.1,494.7,497.25,410.55,507.45,306H561v-51H507.45z M280.5,459C181.05,459,102,379.95,102,280.5S181.05,102,280.5,102S459,181.05,459,280.5S379.95,459,280.5,459z'/></g></svg>";

    private static _gpsBtnCss =
        '.azmaps-gpsBtn{margin:0;padding:0;border:none;border-collapse:collapse;width:32px;height:32px;text-align:center;cursor:pointer;line-height:32px;background-repeat:no-repeat;background-size:20px;background-position:center center;z-index:200;box-shadow:0px 0px 4px rgba(0,0,0,0.16);}' +
        '.azmaps-gpsDisabled{background-image:url("{grayIcon}");}' +
        '.azmaps-gpsDisabled:hover{background-image:url("{blueIcon}");filter:brightness(90%);}' +
        '.azmaps-gpsEnabled{background-image:url("{blueIcon}");}' +
        '.azmaps-gpsEnabled:hover{background-image:url("{blueIcon}");filter:brightness(90%);}' + 
        '.azmaps-gpsPulseIcon{display:block;width:15px;height:15px;border-radius:50%;background:orange;border:2px solid white;cursor:pointer;box-shadow:0 0 0 rgba(0, 204, 255, 0.6);animation:pulse 2s infinite;}@keyframes pulse {0% {box-shadow:0 0 0 0 rgba(0, 204, 255, 0.6);}70% {box-shadow:0 0 0 20px rgba(0, 204, 255, 0);}100% {box-shadow:0 0 0 0 rgba(0, 204, 255, 0);}}';

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
            const opt = this._options;
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
                this._updateMapCamera = options.updateMapCamera;
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
                    code: 2,
                    message: 'Geolocation API not supported by device.',
                    PERMISSION_DENIED: 1,
                    POSITION_UNAVAILABLE: 2,
                    TIMEOUT: 3
                });
            }
        });

        self._map.events.add('movestart', self._mapMoveStarted);

        self.setOptions(self._options);
        
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

        if (typeof self._watchId !== 'undefined') {
            navigator.geolocation.clearWatch(self._watchId);
        }

        if (self._gpsMarker) {
            self._map.markers.remove(self._gpsMarker);
        }

        self._map = null;
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
                    self._gpsMarker.setOptions({
                        color: options.markerColor
                    });
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
    private _onGpsSuccess = (position?: Position) => {
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
                }
            }

            lastKnownPosition = new azmaps.data.Feature(new azmaps.data.Point(pos), geopos);
            self._lastKnownPosition = lastKnownPosition;
        } 
        
        if(lastKnownPosition){
            if(!pos){
                pos = lastKnownPosition.geometry.coordinates;
            }

            if (self._isActive) {
                const icon = self._getMarkerIcon();

                if (options.showUserLocation) {
                    if (!gpsMarker) {
                        self._gpsMarker = new azmaps.HtmlMarker({
                            position: pos,
                            htmlContent: icon,
                            color: options.markerColor
                        });

                        map.markers.add(self._gpsMarker);
                    } else {
                        gpsMarker.setOptions({
                            position: pos,
                            htmlContent: icon,
                            visible: self._isActive && options.showUserLocation
                        });
                    }
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

                    map.setCamera(opt);
                }
            }

            self._invokeEvent('geolocationsuccess', lastKnownPosition);
        }
    };

    /**
     * Callback for when an error occurs when getting the users location.
     * @param error The error that occured.
     */
    private _onGpsError = (error: PositionError) => {
        const self = this;
        self._watchId = null;
        self._isActive = false;
        self._updateState();
        self._invokeEvent('geolocationerror', error);
    }

    /** Generates the mark icon HTML */
    private _getMarkerIcon(): string {
        let icon = GeolocationControl._gpsDotIcon;
        let h = this._lastKnownPosition.properties.heading;
        
        if (this._options.trackUserLocation && h !== null && !isNaN(h)) {
            h = Math.round(h);
            //TODO: update when markers support rotation.
            const transform = `-webkit-transform:rotate(${h}deg);transform:rotate(${h}deg)`;
            icon = GeolocationControl._gpsArrowIcon.replace('{transform}', transform);
        }

        return icon;
    }

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