/** Properties of returned for a geolocation point. */
export interface GeolocationProperties {
    /** The accuracy attribute denotes the accuracy level of the latitude and longitude coordinates.  */
    accuracy: number;
    
    /** The altitude height of the position, specified in meters above the [WGS84] ellipsoid. */
    altitude: number | null;
    
    /** The altitudeAccuracy attribute is specified in meters. */
    altitudeAccuracy: number | null;
    
    /** The heading attribute denotes the direction of travel of the hosting device and is specified in degrees, where 0° ≤ heading < 360°, counting clockwise relative to the true north. */
    heading: number | null;
    
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