---
page_type: sample
description: An Azure Maps Web SDK module that provides a control that uses the browser's geolocation API to locate the user on the map.
languages:
- javascript
- typescript
products:
- azure
- azure-maps
---

# Azure Maps Geolocation Control module

An Azure Maps Web SDK module that provides a control that uses the browser's geolocation API to locate the user on the map. This control uses the browsers [geolocation API](https://www.w3schools.com/html/html5_geolocation.asp) to locate the user and show their position on a map. 

Note that not all devices support geolocation and some users may choose not to share their location. Due to the sensitive and private nature of user locaiton data, many modern browsers require sites to be served over HTTPS in order to access the geolocation API. If the browser or device does not support getting the user location, the geolocation control will not appear on the map. 

**Samples**

[Geolocation control](https://azuremapscodesamples.azurewebsites.net/index.html?sample=Geolocation%20control)
<br/>[<img src="https://github.com/Azure-Samples/AzureMapsCodeSamples/raw/master/AzureMapsCodeSamples/SiteResources/screenshots/Geolocation-control.jpg" height="200px">](https://azuremapscodesamples.azurewebsites.net/index.html?sample=Geolocation%20control)

[Geolocation control options](https://azuremapscodesamples.azurewebsites.net/index.html?sample=Geolocation%20control%20options)
<br/>[<img src="https://github.com/Azure-Samples/AzureMapsCodeSamples/raw/master/AzureMapsCodeSamples/SiteResources/screenshots/Geolocation-control-options.jpg" height="200px">](https://azuremapscodesamples.azurewebsites.net/index.html?sample=Geolocation%20control%20options)

## Getting started

Download the project and copy the `azure-maps-geolocation-control` JavaScript file from the `dist` folder into your project. 

**Usage**

```JavaScript
//Create an instance of the geolocation control.
var gc = new atlas.control.GeolocationControl({
    style: 'auto'
});

//Optionally, add events to monitor location changes and errors when get geolocation.
map.events.add('geolocationsuccess', gc, function(arg){
    //Do something.
});

map.events.add('geolocationerror', gc, function(arg){
    //Do something.
});

//Add the geolocation control to the map.
map.controls.add(gc, {
    position: 'top-right'
});
```

You can check to see if the device supports getting the users location by using the static `GeolocationControl.isSupported` method.

```JavaScript
atlas.control.GeolocationControl.isSupported().then(isSupported => {
    //Do something.
});
```

## API Reference

### GeolocationControl class

Implements: `atlas.Control`

Namespace: `atlas.control`

 A control that uses the browser's geolocation API to locate the user on the map.

**Contstructor**

> `GeolocationControl(options?: GeolocationControlOptions)`

**Methods** 

| Name | Return type | Description |
|------|-------------|-------------|
| `dispose()` | | Doisposes the control. |
| `getLastKnownPosition()` | `atlas.data.Feature<atlas.data.Point, GeolocationProperties>` | Get sthe last known position from the geolocation control. |
| `getOptions()` | `GeolocationControlOptions` | Gets the options of the geolocation control. |
| `setOptions(options: GeolocationControlOptions)` | | Sets the options of the geolocation control. |

**Static Methods** 

| Name | Return type | Description |
|------|-------------|-------------|
| `isSupported()` | `Promise<boolean>` | Checks to see if the geolocation API is supported in the browser. |

**Events**

| Name | Return type | Description |
|------|-------------|-------------|
| `geolocationerror` | `PositionError` | Event fired when an error has occured. Returns the error from the geolcation API as per the [GeolocationPositionError specificaiton](https://w3c.github.io/geolocation-api/#position_error_interface).  |
| `geolocationsuccess` | `atlas.data.Feature<atlas.data.Point, GeolocationProperties>` | Event fired when user position is successful captured or updated. |

### GeolocationControlOptions interface

Options for the GeolocationControl.

**Properties** 

| Name | Type | Description |
|------|------|-------------|
| `calculateMissingValues` | `boolean` | Specifies that if the `speed` or `heading` values are missing in the geolocation position, it will calculate these values based on the last known position. Default: `false` |
| `markerColor` | `string` | The color of the user location marker. Default: `DodgerBlue` |
| `maxZoom` | `number` | The maximum zoom level the map can be zoomed out. If zoomed out more than this when location updates, the map will zoom into this level. If zoomed in more than this level, the map will maintain its current zoom level. Default: `15` |
| `positionOptions` | `PositionOptions` | A [Geolocation API PositionOptions](https://w3c.github.io/geolocation-api/#position_options_interface) object. Default: `{ enableHighAccuracy : false , timeout : 6000 }` |
| `showUserLocation` | `boolean` | Shows the users location on the map using a marker. Default: `true` |
| `style` | `atlas.ControlStyle` \| `string` | The style of the control. Can be; `light`, `dark`, `auto`, or any CSS3 color. When set to auto, the style will change based on the map style. Overridden if device is in high contrast mode. Default `light`. |
| `trackUserLocation` | `boolean` | If `true` the geolocation control becomes a toggle button and when active the map will receive updates to the user's location as it changes. Default: `false` |
| `updateMapCamera` | `boolean` | Specifies if the map camera should update as the position moves. When set to `true`, the map camera will update to the new position, unless the user has interacted with the map. Default: `true` |

### GeolocationProperties interface

Properties of returned for a geolocation point.

**Properties** 

| Name | Type | Description |
|------|------|-------------|
| `accuracy` | `number` | The accuracy attribute denotes the accuracy level of the latitude and longitude coordinates.  |
| `altitude` | `number` \| `null` | The altitude height of the position, specified in meters above the [WGS84] ellipsoid. |
| `altitudeAccuracy` | `number` \| `null` | The altitudeAccuracy attribute is specified in meters. |
| `heading` | `number` \| `null` | The heading attribute denotes the direction of travel of the hosting device and is specified in degrees, where 0° ≤ heading < 360°, counting clockwise relative to the true north. |
| `latitude` | `number` | The latitude position. |
| `longitude` | `number`| The longitude position. |
| `speed` | `number` \| `null` | The speed attribute denotes the magnitude of the horizontal component of the hosting device's current velocity and is specified in meters per second. |
| `timestamp` | `Date` | The timestamp attribute represents the time when the GeolocationPosition object was acquired. |
| `_timestamp` | `number` | The timestamp in milliseconds from 1 January 1970 00:00:00. |

## Related Projects

* [Azure Maps Web SDK Open modules](https://github.com/microsoft/Maps/blob/master/AzureMaps.md#open-web-sdk-modules) - A collection of open source modules that extend the Azure Maps Web SDK.
* [Azure Maps Web SDK Samples](https://github.com/Azure-Samples/AzureMapsCodeSamples)
* [Azure Maps Gov Cloud Web SDK Samples](https://github.com/Azure-Samples/AzureMapsGovCloudCodeSamples)
* [Azure Maps & Azure Active Directory Samples](https://github.com/Azure-Samples/Azure-Maps-AzureAD-Samples)
* [List of open-source Azure Maps projects](https://github.com/microsoft/Maps/blob/master/AzureMaps.md)

## Additional Resources

* [Azure Maps (main site)](https://azure.com/maps)
* [Azure Maps Documentation](https://docs.microsoft.com/azure/azure-maps/index)
* [Azure Maps Blog](https://azure.microsoft.com/blog/topics/azure-maps/)
* [Microsoft Q&A](https://docs.microsoft.com/answers/topics/azure-maps.html)
* [Azure Maps feedback](https://feedback.azure.com/forums/909172-azure-maps)

## Contributing

We welcome contributions. Feel free to submit code samples, file issues and pull requests on the repo and we'll address them as we can. 
Learn more about how you can help on our [Contribution Rules & Guidelines](https://github.com/Azure-Samples/azure-maps-geolocation-control/blob/main/CONTRIBUTING.md). 

You can reach out to us anytime with questions and suggestions using our communities below:
* [Microsoft Q&A](https://docs.microsoft.com/answers/topics/azure-maps.html)
* [Azure Maps feedback](https://feedback.azure.com/forums/909172-azure-maps)

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). 
For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or 
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

MIT
 
See [License](https://github.com/Azure-Samples/azure-maps-geolocation-control/blob/main/LICENSE.md) for full license text.