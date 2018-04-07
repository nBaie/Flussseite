// Requires:
// - jQuery
// - GPS-Module

var overpass = (function(){

//===================================================================
// PUBLIC
//===================================================================


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
        writeDebug("Going to get rivers.");
        // Create a new map-window if we didn't get
        // data yet or if we're outside or at the
        // edge of the window.
        if(checkNewData(latitude, longitude))
        {
            writeDebug("New data is needed.");
            createNewWindow(latitude, longitude);
            getNewData()
        }
    }


    //===================================================================


    function setDetailed(value)
    {

    }


//===================================================================
// PRIVATE
//===================================================================

    // Servers from https://wiki.openstreetmap.org/wiki/Overpass_API
    var SERVERS = ["https://overpass.kumi.systems/api/interpreter", "https://overpass-api.de/", "http://overpass.osm.rambler.ru/cgi/interpreter"];  
    var WINDOW_SIZE = 2000;         // Size of the sides of the square around the current position in meters.
    var QUERY_PERCENTAGE = 0.1;     // If the GPS-Position is in the outer QUERY_PERCENTAGE-part of the square Area, new data is obtained
    
    var currentWindow;              // Array: Low lat, low lon, high lat, high lon
    var data;
    var dataValid = false;


    //===================================================================

    function writeDebug(str)
    {
        $('#overpass-card .content').html(str);
    }
    /**
     * Creates a new window around the current position to get new data.
     * 
     * @param {*} latitude 
     * @param {*} longitude 
     */
    function createNewWindow(latitude, longitude)
    {
        writeDebug("Creating a new window.");
        var x = gps.lon2x_m(longitude);
        var y = gps.lat2y_m(latitude);

        currentWindow = [   gps.y2lat_m( y - WINDOW_SIZE / 2 ),
                            gps.x2lon_m( x - WINDOW_SIZE / 2 ),
                            gps.y2lat_m( y + WINDOW_SIZE / 2 ),
                            gps.x2lon_m( x + WINDOW_SIZE / 2 ) ];
    }


    //===================================================================


    /**
     * Checks if new data has to be obtained.
     *  
     * @param {*} latitude 
     * @param {*} longitude 
     */
    function checkNewData(latitude, longitude)
    {
        writeDebug("Checking if new data is needed.");

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


    //===================================================================


    return {
        getRivers: getRivers,
        setDetailed: setDetailed
    };

})(); // end of overpass module / class