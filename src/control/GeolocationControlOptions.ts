import * as azmaps from "azure-maps-control";

/** Options for the GeolocationControl. */
export interface GeolocationControlOptions {
    /**
    * The style of the control. Can be; `light`, `dark`, `auto`, or any CSS3 color. When set to auto, the style will change based on the map style.
    * Overridden if device is in high contrast mode.
    * Default `light'.
    * @default light
    */
    style?: azmaps.ControlStyle | string;

    /** A Geolocation API PositionOptions object. Default: `{ enableHighAccuracy : false , timeout : 6000 }` */
    positionOptions?: PositionOptions;

    /** Shows the users location on the map using a marker. Default: `true` */
    showUserLocation?: boolean;

    /** If `true` the geolocation control becomes a toggle button and when active the map will receive updates to the user's location as it changes. Default: `false` */
    trackUserLocation?: boolean;

    /** The color of the user location marker. Default: `DodgerBlue` */
    markerColor?: string;

    /** 
     * The maximum zoom level the map can be zoomed out. 
     * If zoomed out more than this when location updates, the map will zoom into this level. 
     * If zoomed in more than this level, the map will maintain its current zoom level.
     * Default: `15`
     **/
    maxZoom?: number;

    /** Specifies that if the `speed` or `heading` values are missing in the geolocation position, it will calculate these values based on the last known position. Default: `false` */
    calculateMissingValues?: boolean;
}