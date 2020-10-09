import * as azmaps from "azure-maps-control";
import { GeolocationControl } from '../control';
import { GeolocationProperties } from 'src/control/GeolocationProperties';

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
        add(eventType: "ongeolocationerror", target: GeolocationControl, callback: (e: PositionError) => void): void;

        /**
         * Adds an event to the `GeolocationControl`.
         * @param eventType The event name.
         * @param target The `GeolocationControl` to add the event for.
         * @param callback The event handler callback.
         */
        add(eventType: "ongeolocationsuccess", target: GeolocationControl, callback: (e: azmaps.data.Feature<azmaps.data.Point, GeolocationProperties>) => void): void;

        /**
         * Adds an event to the `GeolocationControl` once.
         * @param eventType The event name.
         * @param target The `GeolocationControl` to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "onerror", target: GeolocationControl, callback: (e: PositionError) => void): void;

        /**
         * Adds an event to the `GeolocationControl` once.
         * @param eventType The event name.
         * @param target The `GeolocationControl` to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "onsuccess", target: GeolocationControl, callback: (e: azmaps.data.Feature<azmaps.data.Point, GeolocationProperties>) => void): void;
        
        /**
         * Removes an event listener from the `GeolocationControl`.
         * @param eventType The event name.
         * @param target The `GeolocationControl` to remove the event for.
         * @param callback The event handler callback.
         */
        remove(eventType: string, target: GeolocationControl, callback: (e?: any) => void): void;
    }
}
