/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
function write(string) {
    // document.getElementById('status-card').innerHTML = string;
    $('#status-card .content').html(string);
}

// onSuccess Callback
// This method accepts a Position object, which contains the
// current GPS coordinates
//
var positionAccuracy = 1000000;

function outputPosition(position) {
    var outStr = 'Latitude: '          + position.coords.latitude          + '\n' +
    'Longitude: '         + position.coords.longitude         + '\n' +
    'Altitude: '          + position.coords.altitude          + '\n' +
    'Accuracy: '          + position.coords.accuracy          + '\n' +
    'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
    'Heading: '           + position.coords.heading           + '\n' +
    'Speed: '             + position.coords.speed             + '\n' +
    'Timestamp: '         + position.timestamp                + '\n';

    if(position.coords.accuracy > 50)
    {
        outStr = 'Accuracy: ' + position.coords.accuracy + 'm. \n' +
        'Not accurate enough.';
    }
    // alert(outStr);
    write(outStr);
}

// onError Callback receives a PositionError object
//
function onError(error) {
    var outStr = 'code: '    + error.code    + '\n' +
    'message: ' + error.message + '\n';

    // alert(outStr);
    write(outStr);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}  

// Will call watchPosition in a loop about 50 times
// and return the most accurate and recent position.
async function getGPSPosition(_callback)
{
    var errorCount = 0;
    var bestPosition = '';
    for(var i = 0; i<20; i++)
    {
        // console.log(i);
        var received = false;
        // write('Attempt: ' + i);
        navigator.geolocation.watchPosition(function(position){
            received = true;
            if(i == 0)
            {
                bestPosition = position;
            }
            else
            {
                if(position.coords.accuracy <= bestPosition.coords.accuracy)
                {
                    // write("Selected new Position");
                    bestPosition = position;
                }
            }
        }, function(error){
            received = true;
            errorCount += 1;
            // write('Errors: ' + errorCount);
        }, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });

        while(received == false)
        {
            await sleep(100);
        }
    }

    _callback(bestPosition, errorCount > 0);
}

async function locationUpdater()
{
    while(true)
    {
        write("Trying to get current position.");

        await getGPSPosition(function(gpsPosition, error){
            if(error == false)
            {
                // write("Type of GPS-Position: " + typeof gpsPosition);
                outputPosition(gpsPosition);
            }
            else
            {
                write("An Error occured.");
            }
        });

        await sleep(5000);
    }
}

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('init', function(event) {
            var page = event.target;
          
            if (page.id === 'page1') {
              page.querySelector('#settings-button').onclick = function() {
                document.querySelector('#myNavigator').pushPage('page2.html', {data: {title: 'Page 2'}});
              };
            } else if (page.id === 'page2') {
              page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
            }
        });
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {        
        locationUpdater();
    },
};
