import * as azmaps from "azure-maps-control";

/** Options for the GeolocationControl. */
export interface GeolocationControlOptions {

    /** Specifies that if the `speed` or `heading` values are missing in the geolocation position, it will calculate these values based on the last known position. Default: `false` */
    calculateMissingValues?: boolean;

    /** 
     * The delay in milliseconds between compass events. The compass heading value can change very rapidly with the slightest movement of a device which can negatively 
     * impact applications where heavy computations or UI changes occur due to the event. This options throttles how frequently the event will fire. Only values greater or equal to `100` are accepted.
     * The marker direction updates independantly of this option. Default: `100` */
    compassEventThrottleDelay?: number;

    /** Specifies if the compass should be enabled, if available. Based on the device orientation. Default: `true` */
    enableCompass?: boolean;

    /** The color of the user location marker. Default: `DodgerBlue` */
    markerColor?: string;

    /** 
     * The maximum zoom level the map can be zoomed out. 
     * If zoomed out more than this when location updates, the map will zoom into this level. 
     * If zoomed in more than this level, the map will maintain its current zoom level.
     * Default: `15`
     **/
    maxZoom?: number;

    /** A Geolocation API PositionOptions object. Default: `{ enableHighAccuracy: true, maximumAge: Infinity, timeout: 10000 }` */
    positionOptions?: PositionOptions;

    /** Shows the users location on the map using a marker. Default: `true` */
    showUserLocation?: boolean;
    
    /**
    * The style of the control. Can be; `light`, `dark`, `auto`, or any CSS3 color. When set to auto, the style will change based on the map style.
    * Overridden if device is in high contrast mode.
    * Default `light'.
    * @default light
    */
    style?: azmaps.ControlStyle | string;

    /** Specifies if the map should rotate to sync it's heading with the compass. Based on the device orientation. Default: `false` */
    syncMapCompassHeading?: boolean;

    /** If `true` the geolocation control becomes a toggle button and when active the map will receive updates to the user's location as it changes. Default: `false` */
    trackUserLocation?: boolean;

    /** Specifies if the map camera should update as the position moves. When set to `true`, the map camera will update to the new position, unless the user has interacted with the map. Default: `true` */
    updateMapCamera?: boolean;
}