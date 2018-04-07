// Requires:
// - jQuery
// - GPS-Module

var overpass = (function(){

    var SERVERS = [];
    var WINDOW_SIZE = 2000;         // Size of the sides of the square around the current position in meters.
    var QUERY_PERCENTAGE = 0.1;     // If the GPS-Position is in the outer QUERY_PERCENTAGE-part of the square Area, new data is obtained
    
    var currentWindow;              // Array: Low lat, low lon, high lat, high lon
    var data;
    var dataValid = false;

    /**
     * Checks if new data has to be obtained.
     *  
     * @param {*} latitude 
     * @param {*} longitude 
     */
    function checkNewData(latitude, longitude)
    {
        if(!dataValid) return true;
        if(typeof currentWindow === "undefined") return true;

        // Create boundary square, where we need to get a new window
        // if the position is outside

        var border = WINDOW_SIZE * QUERY_PERCENTAGE;
        var boundaries = [  gps.lat2y_m(currentWindow[0]) + border,
                            gps.lon2x_m(currentWindow[1]) + border,
                            gps.lat2y_m(currentWindow[2]) - border,
                            gps.lon2x_m(currentWindow[3]) - border];

        var y = gps.lat2y_m(latitude);
        var x = gps.lon2x_m(longitude);

        if(y < boundaries[0] || y > boundaries[2] || x < boundaries[1] || x > boundaries[3]) return true;

        return false;        
    }

    /**
     * This is the main-function for the overpass module. This
     * function will be called from outside to obtain information
     * about rivers near to the user position.
     * 
     * @param {*} latitude 
     * @param {*} longitude 
     */
    function getRivers(latitude, longitude)
    {
        // Create a new map-window if we didn't get
        // data yet or if we're outside or at the
        // edge of the window.
        if(checkNewData(latitude, longitude))
        {
            createNewWindow(latitude, longitude);
            getNewData()
        }
    }

    function setDetailed(value)
    {

    }

    return {
        getRivers: getRivers,
        setDetailed: setDetailed
    };

})();