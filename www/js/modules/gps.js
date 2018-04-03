// Requires:

// Module uses the Revealing Module Pattern.

var gps = (function(){

    var RAD2DEG = 180 / Math.PI;
    var DEG2RAD = Math.PI / 180;
    var PI_4 = Math.PI / 4;
    var EARTH_RADIUS = 6378137

    /* =================================================================== 
     * Conversion Functions (Lat/Lon) <=> (Mercator) from 
     * https://wiki.openstreetmap.org/wiki/Mercator
     * =================================================================== */

    /* The following functions take their parameter and return their result in degrees */

    function y2lat_d(y)   { return (Math.atan(Math.exp(y / RAD2DEG)) / PI_4 - 1) * 90; };
    function x2lon_d(x)   { return x; };

    function lat2y_d(lat) { return Math.log(Math.tan((lat / 90 + 1) * PI_4 )) * RAD2DEG; };
    function lon2x_d(lon) { return lon; };

    /* The following functions take their parameter in something close to meters, along the equator, and return their result in degrees */

    function y2lat_m(y)   { return (2 * Math.atan(Math.exp( y/EARTH_RADIUS)) - M_PI/2) * RAD2DEG; };
    function x2lon_m(x)   { return (x/EARTH_RADIUS) * RAD2DEG; };

    /* The following functions take their parameter in degrees, and return their result in something close to meters, along the equator */

    function lat2y_m(lat) { return Math.log(Math.tan( (DEG2RAD * lat) / 2 + M_PI/4 )) * EARTH_RADIUS; };
    function lon2x_m(lon) { return DEG2RAD * lon * EARTH_RADIUS; };

    return {
        y2lat_d: y2lat_d,
        x2lon_d: x2lon_d,
        lat2y_d: lat2y_d,
        lon2x_d: lon2x_d,
        y2lat_m: y2lat_m,
        x2lon_m: x2lon_m,
        lat2y_m: lat2y_m,
        lon2x_m: lon2x_m
    };
})();