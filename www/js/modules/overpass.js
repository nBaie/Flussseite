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
            getNewData();
        }
    }


    //===================================================================


    function setDetailed(value)
    {
        if(typeof value !== "boolean")
            return;

        if(detailed != value)
        {
            detailed = value;
            getNewData();
        }
    }


//===================================================================
// PRIVATE
//===================================================================

    // Servers from https://wiki.openstreetmap.org/wiki/Overpass_API
    var SERVERS = ["https://overpass.kumi.systems/api/interpreter", "https://overpass-api.de/api/interpreter", "http://overpass.osm.rambler.ru/cgi/interpreter"];  
    var WINDOW_SIZE = 2000;         // Size of the sides of the square around the current position in meters.
    var QUERY_PERCENTAGE = 0.1;     // If the GPS-Position is in the outer QUERY_PERCENTAGE-part of the square Area, new data is obtained
    
    var detailed = false;
    var currentWindow;              // Array: Low lat, low lon, high lat, high lon
    var data;
    var dataValid = false;


    //===================================================================

    function writeDebug(str)
    {
        $('#overpass-card .content').html(str);
    }

    /**
     * Get new data from the overpass api using the current Window.
     */
    function getNewData()
    {
        writeDebug("Fetching new data.");
        // Construct the query
        var bbox = "(" + currentWindow[0] + "," + currentWindow[1] + "," +currentWindow[2] + "," + currentWindow[3] + ")";
        var before = "[out:json][timeout:25];(";
        var after = "); out body; >; out skel qt;";
        var defaultQ = `
            node["waterway"="canal"]${bbox};
            way["waterway"="canal"]${bbox};
            relation["waterway"="canal"]${bbox};
            node["waterway"="river"]${bbox};
            way["waterway"="river"]${bbox};
            relation["waterway"="river"]${bbox};
            node["waterway"="riverbank"]${bbox};
            way["waterway"="riverbank"]${bbox};
            relation["waterway"="riverbank"]${bbox};
            node["natural"="water"]${bbox};
            way["natural"="water"]${bbox};
            relation["natural"="water"]${bbox};`;
        var detailedQ = `
            node["waterway"="stream"]${bbox};
            way["waterway"="stream"]${bbox};
            relation["waterway"="stream"]${bbox};`;

        var query = before + defaultQ;
        if(detailed) query += detailedQ;
        query += after;

        //Send the query
        //TODO: Server-handling
        var jqxhr = $.post(SERVERS[0], query, function( data ) {
            writeDebug(JSON.stringify(data).substring(0, 200) + "...");
        }, "json")
        .fail(function() {
            writeDebug("Error");
        });

        //TODO: Return the data in some way
    }


    //===================================================================

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