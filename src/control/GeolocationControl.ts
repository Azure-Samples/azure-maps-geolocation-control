import * as azmaps from "azure-maps-control";
import { GeolocationControlOptions } from './GeolocationControlOptions';
import { GeolocationTranslation } from './GeolocationTranslation';
import { Utils } from '../helpers/Utils';
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
    private _resource: GeolocationTranslation;
    private _gpsMarker: azmaps.HtmlMarker;

    private _watchId: number;
    private _isActive = false;
    private _updateMapCamera = true;
    private _lastKnownPosition: azmaps.data.Feature<azmaps.data.Point, GeolocationProperties>;

    private static _gpsArrowIcon = '<div style="{transform}"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><g transform="translate(2 2)"><polygon points="12,0 0,24 12,17 24,24" stroke-width="2" stroke="white" fill="{color}"/></g></svg></div>';
    private static _gpsDotIcon = '<div class="azmaps-map-gpsPulseIcon" style="background-color:{color}"></div>';

    private static _iconTemplate = "data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' x='0' y='0' viewBox='0 0 561 561' xml:space='preserve'><g fill='{color}'><path d='M280.5,178.5c-56.1,0-102,45.9-102,102c0,56.1,45.9,102,102,102c56.1,0,102-45.9,102-102C382.5,224.4,336.6,178.5,280.5,178.5z M507.45,255C494.7,147.9,410.55,63.75,306,53.55V0h-51v53.55C147.9,63.75,63.75,147.9,53.55,255H0v51h53.55C66.3,413.1,150.45,497.25,255,507.45V561h51v-53.55C413.1,494.7,497.25,410.55,507.45,306H561v-51H507.45z M280.5,459C181.05,459,102,379.95,102,280.5S181.05,102,280.5,102S459,181.05,459,280.5S379.95,459,280.5,459z'/></g></svg>";

    private static _gpsBtnCss =
        '.azmaps-map-gpsBtn{margin:0;padding:0;border:none;border-collapse:collapse;width:32px;height:32px;text-align:center;cursor:pointer;line-height:32px;background-repeat:no-repeat;background-size:20px;background-position:center center;z-index:200;box-shadow:0px 0px 4px rgba(0,0,0,0.16);}' +
        '.azmaps-map-gpsDisabled{background-image:url("{grayIcon}");}' +
        '.azmaps-map-gpsDisabled:hover{background-image:url("{blueIcon}");filter:brightness(90%);}' +
        '.azmaps-map-gpsEnabled{background-image:url("{blueIcon}");}' +
        '.azmaps-map-gpsEnabled:hover{background-image:url("{blueIcon}");filter:brightness(90%);}' + 
        '.azmaps-map-gpsPulseIcon{display:block;width:15px;height:15px;border-radius:50%;background:orange;border:2px solid white;cursor:pointer;box-shadow:0 0 0 rgba(0, 204, 255, 0.6);animation:pulse 2s infinite;}@keyframes pulse {0% {box-shadow:0 0 0 0 rgba(0, 204, 255, 0.6);}70% {box-shadow:0 0 0 20px rgba(0, 204, 255, 0);}100% {box-shadow:0 0 0 0 rgba(0, 204, 255, 0);}}';

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
            if (options.positionOptions) {
                this._options.positionOptions = Object.assign(this._options.positionOptions, options.positionOptions);
            }

            if (options.style) {
                this._options.style = options.style;
            }

            if (options.markerColor) {
                this._options.markerColor = options.markerColor;
            }

            if (typeof options.showUserLocation === 'boolean') {
                this._options.showUserLocation = options.showUserLocation;
            }

            if (typeof options.trackUserLocation === 'boolean') {
                this._options.trackUserLocation = options.trackUserLocation;
            }

            if(typeof options.maxZoom === 'number'){
                this._options.maxZoom = Math.min(Math.max(options.maxZoom, 0), 24);
            }

            if (typeof options.calculateMissingValues === 'boolean') {
                this._options.calculateMissingValues = options.calculateMissingValues;
            }            

            if (typeof options.updateMapCamera === 'boolean') {
                this._options.updateMapCamera = options.updateMapCamera;
                this._updateMapCamera = options.updateMapCamera;
            }
        }
    }

    /****************************
     * Public Methods
     ***************************/

    /** Disposes the control. */
    public dispose(): void {
        if(this._map){
            this._map.controls.remove(this);
        }

        Object.keys(this).forEach(k => {
            this[k] = null;
        });
    }

    /** Get sthe last known position from the geolocation control. */
    public getLastKnownPosition(): azmaps.data.Feature<azmaps.data.Point, GeolocationProperties> {
        return this._lastKnownPosition;
    }

    /**
     * Action to perform when the control is added to the map.
     * @param map The map the control was added to.
     * @param options The control options used when adding the control to the map.
     * @returns The HTML Element that represents the control.
     */
    public onAdd(map: azmaps.Map, options?: azmaps.ControlOptions): HTMLElement {
        this._map = map;

        this._hclStyle = Utils.getHclStyle(map);

        this._resource = GeolocationControl._getTranslations(this._map.getStyle().language);

        //Create different color icons and merge into CSS.
        var grayIcon = GeolocationControl._iconTemplate.replace('{color}', 'Gray');
        var blueIcon = GeolocationControl._iconTemplate.replace('{color}', 'DeepSkyBlue');
        var css = GeolocationControl._gpsBtnCss.replace(/{grayIcon}/g, grayIcon).replace(/{blueIcon}/g, blueIcon);

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
        GeolocationControl.isSupported().then(supported => {
            if (supported) {
                //Show the button when we know geolocation is supported.
                this._container.style.display = '';
            } else {
                //Device doesn't support getting position.
                //@ts-ignore
                this._invokeEvent('geolocationerror', {
                    code: 2,
                    message: 'Geolocation API not supported by device.',
                    PERMISSION_DENIED: 1,
                    POSITION_UNAVAILABLE: 2,
                    TIMEOUT: 3
                });
            }
        });

        this._map.events.add('movestart', this._mapMoveStarted);

        this.setOptions(this._options);
        
        return this._container;
    }

    /**
     * Action to perform when control is removed from the map.
     */
    public onRemove(): void {
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
        if (options) {
            var color = 'white';

            if(this._hclStyle) {
                if(this._hclStyle === 'dark'){
                    color = this._darkColor;
                }
            } else {
                if (this._options.style === 'auto') {
                    this._map.events.remove('styledata', this._mapStyleChanged);
                }

                this._options.style = options.style;

                switch (options.style) {
                    case 'dark':
                        color = this._darkColor;
                        break;
                    case 'auto':
                        //Color will change between light and dark depending on map style.
                        this._map.events.add('styledata', this._mapStyleChanged);
                        color = this._getColorFromMapStyle();
                        break;
                    case 'light':
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

            if(typeof options.maxZoom === 'number'){
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
                } else if (this._lastKnownPosition) {
                    this._onGpsSuccess();
                }
            }

            if (typeof options.trackUserLocation === 'boolean') {
                this._options.trackUserLocation = options.trackUserLocation;
            }

            if (options.positionOptions) {
                var opt: PositionOptions = {};

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
    }

    /**
     * Toggles the state of the Geolocation control button. If a boolean state is not passed in, will toggle to opposite of current state. 
     * @param isActive The state to toggle to. If not specified, will toggle to opposite of current state.
     */
    public toggle(isActive?: boolean): void {        
        this._isActive = (typeof isActive === 'boolean') ? isActive : !this._isActive;
        
        if (this._isActive && this._options.trackUserLocation && this._lastKnownPosition) {
            this._onGpsSuccess();
        }

        this._updateMapCamera = this._options.updateMapCamera;
        this._updateState();
    }

    /** Checks to see if the geolocation API is supported in the browser. */
    public static async isSupported(): Promise<boolean> {
        if (window.navigator['permissions']) {
            // navigator.permissions has incomplete browser support
            // http://caniuse.com/#feat=permissions-api
            // Test for the case where a browser disables Geolocation because of an insecure origin.

            var p = await window.navigator['permissions'].query({ name: 'geolocation' });            
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
        if (this._button && !this._hclStyle) {
            this._button.style.backgroundColor = this._getColorFromMapStyle();
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
        return Utils.getAutoStyle(this._map) === azmaps.ControlStyle.dark ? this._darkColor : 'white'; 
    }

    /** Removes the geolocation watcher used for tracking. */
    private _stopTracking(): void {
        if (typeof this._watchId === 'number') {
            navigator.geolocation.clearWatch(this._watchId);
            this._watchId = null;
        }
    }

    /**
     * Updates the state of the button.
     */
    private _updateState(): void {
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
            } else {
                navigator.geolocation.getCurrentPosition(this._onGpsSuccess, this._onGpsError, this._options.positionOptions);
            }           
        } else {
            if (this._options.trackUserLocation) {
                ariaLabel = this._resource.enableTracking;
            }
        }

        this._button.setAttribute('title', ariaLabel);
        this._button.setAttribute('alt', ariaLabel);

        this._button.classList.remove(removeClass);
        this._button.classList.add(addClass);
    }

    /**
     * Callback for when an error occurs when getting the users location.
     * @param position The GPS position information.
     */
    private _onGpsSuccess = (position?: Position) => {
        var pos: azmaps.data.Position;

        if(position){
            pos = [position.coords.longitude, position.coords.latitude];

            //@ts-ignore
            var geopos: GeolocationProperties = {
                timestamp: new Date(position.timestamp),
                _timestamp: position.timestamp
            };

            Object.assign(geopos, position.coords);

            if(this._options.calculateMissingValues && this._lastKnownPosition){
                if(typeof position.coords.speed !== 'number'){
                    let dt = position.timestamp - this._lastKnownPosition.properties._timestamp;
                    let dx = azmaps.math.getDistanceTo(this._lastKnownPosition.geometry.coordinates, pos);
                    geopos.speed = dx/(dt * 0.001);
                }

                if(typeof position.coords.heading !== 'number'){
                    geopos.heading = azmaps.math.getHeading(this._lastKnownPosition.geometry.coordinates, pos);
                }
            }

            this._lastKnownPosition = new azmaps.data.Feature(new azmaps.data.Point(pos), geopos);
        } 
        
        if(this._lastKnownPosition){
            if(!pos){
                pos = this._lastKnownPosition.geometry.coordinates;
            }

            if (this._isActive) {
                var icon = this._getMarkerIcon();

                if (this._options.showUserLocation) {
                    if (!this._gpsMarker) {
                        this._gpsMarker = new azmaps.HtmlMarker({
                            position: pos,
                            htmlContent: icon,
                            color: this._options.markerColor
                        });

                        this._map.markers.add(this._gpsMarker);
                    } else {
                        this._gpsMarker.setOptions({
                            position: pos,
                            htmlContent: icon,
                            visible: this._isActive && this._options.showUserLocation
                        });
                    }
                } else {
                    this._gpsMarker.setOptions({
                        visible: false
                    });
                }

                if (this._updateMapCamera) {
                    var opt: any = {
                        center: pos
                    };

                    //Only adjust zoom if the user is zoomed out too much.
                    if (this._map.getCamera().zoom < 15) {
                        opt.zoom = 15;
                    }

                    this._map.setCamera(opt);
                }
            }

            this._invokeEvent('geolocationsuccess', this._lastKnownPosition);
        }
    };

    /**
     * Callback for when an error occurs when getting the users location.
     * @param error The error that occured.
     */
    private _onGpsError = (error: PositionError) => {
        this._watchId = null;
        this._isActive = false;
        this._updateState();
        this._invokeEvent('geolocationerror', error);
    }

    /** Generates the mark icon HTML */
    private _getMarkerIcon(): string {
        var icon = GeolocationControl._gpsDotIcon;

        var h = this._lastKnownPosition.properties.heading;
        
        if (this._options.trackUserLocation && h !== null && !isNaN(h)) {
            h = Math.round(h);
            //TODO: update when markers support rotation.
            var transform = `-webkit-transform:rotate(${h}deg);transform:rotate(${h}deg)`;
            icon = GeolocationControl._gpsArrowIcon.replace('{transform}', transform);
        }

        return icon;
    }

    /**
     * Returns the set of translation text resources needed for the control for a given language.
     * @param lang The language code to retrieve the text resources for.
     * @returns An object containing text resources in the specified language.
     */
    private static _getTranslations(lang?: string): GeolocationTranslation {
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
    }
}