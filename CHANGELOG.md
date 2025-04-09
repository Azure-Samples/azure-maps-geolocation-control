## azure-maps-geolocation-control Changelog

<a name="1.0.0"></a>
# 1.0.0 (2025-04-09)

**Features**

- Added support for compass by leveraging device orientation information. Marker indicates the compass direction when enabled.
- Added options for sycing the map rotation with the compass heading.
- Added a throttled event for when compass heading changes. This event can fire frequently so limited event trigger to once per 100ms at max which is sufficient for most UI scenarios.
- **Breaking change**: Modified event args to align with other Azure Maps event argument structure (e.g. they have a `type` property). 

**Bug fixes**

- Updated packages and build scripts to address `npm install` issues.
- Fix issue where setting any option caused the button style to reset.

<a name="0.0.3"></a>
# 0.0.3 (2025-04-04)

**Features**

- Modified GPS icon style. Removed arrow, and now have clipped the pulse area into a triangle based on compass direction. Pulse animation stops when there is heading information. This addresses issue #2
- Enhancement: Automatically stops any tracking that may be running when page is unloaded.

<a name="0.0.2"></a>
# 0.0.2 (2022-09-26)

**Features**

- Modified control to try high accuracy first, then fallback to low accuracy.
- Bug fix: Updating of map position when tracking (was only working once).
- Big fix: Adjusted marker so it stays flat on the map when map is pitched.

<a name="0.0.1"></a>
# 0.0.1 (2020-08-21)

**Features**

- Control for getting the users position.
- Ability to track the users position.

