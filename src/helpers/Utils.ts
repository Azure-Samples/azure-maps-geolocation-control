import * as azmaps from "azure-maps-control";

export class Utils {

    /**
     * Checks to see if the map is in high contrast mode, and if so, which high contrast style to align with.
     * @param map The map instance.
     */
    public static getHclStyle(map: azmaps.Map): azmaps.ControlStyle {
        //Check to see if style is high contrast.
        if(map.getMapContainer().classList.contains("high-contrast-dark")){
            return azmaps.ControlStyle.dark;
        } else if (map.getMapContainer().classList.contains("high-contrast-light")){
            return azmaps.ControlStyle.light;
        } 

        return null;
    }

    /**
     * Gets the control style based on the map style when control style set to auto.
     * @param map The map instance.
     */
    public static getAutoStyle(map: azmaps.Map): azmaps.ControlStyle {

        switch (map.getStyle().style) {
            //When the style is dark (i.e. satellite, night), show the dark colored theme.
            case 'satellite':
            case 'satellite_road_labels':
            case 'grayscale_dark':
            case 'night':
            case 'night':
            case 'high_contrast_dark':
                return azmaps.ControlStyle.dark;
            //When the style is bright (i.e. road), show the light colored theme.
            case 'road':
            case 'grayscale_light':
            case 'road_shaded_relief':
            default:
                break;
        }

        return azmaps.ControlStyle.light;
    }
}