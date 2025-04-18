import * as azmaps from 'azure-maps-control';

declare namespace atlas {    

    export module control {

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
    
            /**
             * A control that uses the browser's geolocation API to locate the user on the map.
             * @param options Options for defining how the control is rendered and functions.
             */
            constructor(options?: GeolocationControlOptions);

            /** Disposes the control. */
            public dispose(): void;
        
            /** Get sthe last known position from the geolocation control. */
            public getLastKnownPosition(): azmaps.data.Feature<azmaps.data.Point, GeolocationProperties> ;

            /** Gets the options of the geolocation control. */
            public getOptions(): GeolocationControlOptions;
        
            /**
             * Sets the options of the geolocation control.
             * @param options The options.
             */
            public setOptions(options: GeolocationControlOptions): void;
        
            /** Checks to see if the geolocation API is supported in the browser. */
            //@ts-ignore
            public static async isSupported(): Promise<boolean>;

            onAdd(map: azmaps.Map, options?: azmaps.ControlOptions): HTMLElement;

            onRemove(): void;
        }
    }

    /** Options for the GeolocationControl. */
    export interface GeolocationControlOptions {

        /** Specifies that if the `speed` or `heading` values are missing in the geolocation position, it will calculate these values based on the last known position. Default: `false` */
        calculateMissingValues?: boolean;

        /** 
         * The delay in milliseconds between compass events. The compass heading value can change very rapidly with the slightest movement of a device which can negatively 
         * impact applications where heavy computations or UI changes occur due to the event. This options throttles how frequently the event will fire. Only values greater or equal to `100` are accepted.
         * The marker direction updates independantly of this option. Default: `100` */
        compassEventThrottleDelay?: number;

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

        /** If `true` the geolocation control becomes a toggle button and when active the map will receive updates to the user's location as it changes. Default: `false` */
        trackUserLocation?: boolean;

        /** Specifies if the map camera should update as the position moves. When set to `true`, the map camera will update to the new position, unless the user has interacted with the map. Default: `true` */
        updateMapCamera?: boolean;

        /** Specifies if the compass should be enabled, if available. Based on the device orientation. Default: `true` */
        enableCompass?: boolean;
    
        /** Specifies if the map should rotate to sync it's heading with the compass. Based on the device orientation. Default: `false` */
        syncMapCompassHeading?: boolean;
    }

    /** Properties of returned for a geolocation point. */
    export interface GeolocationProperties {
        /** The accuracy attribute denotes the accuracy level of the latitude and longitude coordinates.  */
        accuracy: number;
        
        /** The altitude height of the position, specified in meters above the [WGS84] ellipsoid. */
        altitude: number | null;
        
        /** The altitudeAccuracy attribute is specified in meters. */
        altitudeAccuracy: number | null;
    
        /** The heading attribute denotes the direction of travel of the hosting device and is specified in degrees, where 0° ≤ heading < 360°, 
         * counting clockwise relative to the true north. This will be either from the geolocation API, and fallback to a calculated value if in 
         * user tracking mode with  `calculateMissingValues` set to `true`. */
        heading: number | null;
    
        /** Specifies if the `heading` value came from the geolocation API or was calculated. Null when there is no `heading` value. */
        headingType: "geolocation" | "calculated" | null;
    
        /** The heading value of the compass based on the device orientation. */
        compassHeading: number | null;
        
        /** The latitude position. */
        latitude: number;
        
        /** The longitude position. */
        longitude: number;

        /** The speed attribute denotes the magnitude of the horizontal component of the hosting device's current velocity and is specified in meters per second. */
        speed: number | null;

        /** The timestamp attribute represents the time when the GeolocationPosition object was acquired. */
        timestamp: Date;

        /** The timestamp in milliseconds from 1 January 1970 00:00:00. */
        _timestamp: number;
    }
}

/**
 * This module partially defines the map control.
 * This definition only includes the features added by using the drawing tools.
 * For the base definition see:
 * https://docs.microsoft.com/javascript/api/azure-maps-control/?view=azure-maps-typescript-latest
 */
declare module "azure-maps-control" {
    /**
     * This interface partially defines the map control's `EventManager`.
     * This definition only includes the method added by using the drawing tools.
     * For the base definition see:
     * https://docs.microsoft.com/javascript/api/azure-maps-control/atlas.eventmanager?view=azure-maps-typescript-latest
     */
    export interface EventManager {
        /**
         * Adds an event to the `GeolocationControl`.
         * @param eventType The event name.
         * @param target The `GeolocationControl` to add the event for.
         * @param callback The event handler callback.
         */
        add(eventType: "geolocationerror", target: atlas.control.GeolocationControl, callback: (e: GeolocationPositionError) => void): void;

        /**
         * Adds an event to the `GeolocationControl`.
         * @param eventType The event name.
         * @param target The `GeolocationControl` to add the event for.
         * @param callback The event handler callback.
         */
        add(eventType: "geolocationsuccess", target: atlas.control.GeolocationControl, callback: (e: azmaps.data.Feature<azmaps.data.Point, atlas.GeolocationProperties>) => void): void;

        /**
         * Adds an event to the `GeolocationControl`.
         * @param eventType The event name.
         * @param target The `GeolocationControl` to add the event for.
         * @param callback The event handler callback.
         */
        add(eventType: "compassheadingchanged", target: atlas.control.GeolocationControl, callback: (e: number) => void): void;

        /**
         * Adds an event to the `GeolocationControl` once.
         * @param eventType The event name.
         * @param target The `GeolocationControl` to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "onerror", target: atlas.control.GeolocationControl, callback: (e: GeolocationPositionError) => void): void;

        /**
         * Adds an event to the `GeolocationControl` once.
         * @param eventType The event name.
         * @param target The `GeolocationControl` to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "onsuccess", target: atlas.control.GeolocationControl, callback: (e: azmaps.data.Feature<azmaps.data.Point, atlas.GeolocationProperties>) => void): void;
        
        /**
         * Adds an event to the `GeolocationControl` once.
         * @param eventType The event name.
         * @param target The `GeolocationControl` to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "compassheadingchanged", target: atlas.control.GeolocationControl, callback: (e: number) => void): void;

        /**
         * Removes an event listener from the `GeolocationControl`.
         * @param eventType The event name.
         * @param target The `GeolocationControl` to remove the event for.
         * @param callback The event handler callback.
         */
        remove(eventType: string, target: atlas.control.GeolocationControl, callback: (e?: any) => void): void;
    }
}


export = atlas;