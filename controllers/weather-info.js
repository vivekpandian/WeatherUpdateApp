'use strict';



var http = require ('http');
var CityModel = require ('../models/cities');
var WeatherInfoModel = require('../models/weather-info');

var weatherInfoModel = new WeatherInfoModel();
var cityModel = new CityModel();

/**
 * Can This be done async ??
 * @param city
 * @returns {boolean}
 */
function isCityExists (city) {
    var exists=false;
    for (var i=0;i<cityModel.cities.length;i++) {
        if (city === cityModel.cities[i].id) {
            exists=true;
            break;
        }
    }
    return exists;
}

module.exports = function (app) {
    app.get('/weather', function (request, response) {
        var options = {
            host: 'api.wunderground.com',
            path: '/api/5d10f470ccd7c799/geolookup/conditions/q',
            method: 'GET'
        };
        var city='';

        //log query parameters to console.
        console.log ('query:' + JSON.stringify(request.query));
        if (request.query && request.query.city) { // extract city from query params
            city = request.query.city;
        }
        else {  //else let austin be the default city
            city = 'TX/Austin';
        }
        if (!isCityExists(city)) {
            return response.render ('weather-info',{'city':city,city_options:cityModel,error:''});
        }
        //update the path with city value
        options.path = options.path + '/' + city + '.json';
        console.log ('options:' + JSON.stringify(options));
        var req = http.request(options, function(res) {
            console.log('STATUS: ' + res.statusCode);
            var responseString = '';
            var errorString = '';
            res.on('data', function (data) {
                if (res.statusCode === 200) {   //if sucesss set the response string.
                    responseString += data;
                }
                else { // else set the error string
                    errorString += data;
                }
            });
            res.on('error', function(err) {
                console.error ('problem with request: ' + err.message);
                errorString += err.message;
            });
            res.on('end', function(){
                var responseObject = JSON.parse(responseString);
                if (responseObject && responseObject.current_observation && responseObject.current_observation.display_location) {

                    weatherInfoModel.city = responseObject.current_observation.display_location.city;
                    weatherInfoModel.state = responseObject.current_observation.display_location.state;
                    weatherInfoModel.country = responseObject.current_observation.display_location.country;
                    weatherInfoModel.zip = responseObject.current_observation.display_location.zip;

                    weatherInfoModel.observation_time = responseObject.current_observation.observation_time;
                    weatherInfoModel.local_time = responseObject.current_observation.local_time_rfc822;
                    weatherInfoModel.weather = responseObject.current_observation.weather;
                    weatherInfoModel.temperature = responseObject.current_observation.temperature_string;
                    weatherInfoModel.relative_humidity = responseObject.current_observation.relative_humidity;
                    weatherInfoModel.wind = responseObject.current_observation.wind_string;
                    weatherInfoModel.dewpoint = responseObject.current_observation.dewpoint_string;
                    weatherInfoModel.heat= responseObject.current_observation.heat_index_string;
                    weatherInfoModel.windchill = responseObject.current_observation.windchill_string;
                    weatherInfoModel.feelslike = responseObject.current_observation.feelslike_string;
                    weatherInfoModel.visibility = responseObject.current_observation.visibility_mi;
                    weatherInfoModel.precipitation = responseObject.current_observation.precip_1hr_string;

                    console.log ('weather:' + weatherInfoModel);
                    response.render ('weather-info',{'city':city,city_options:cityModel,weather:weatherInfoModel});
                }
                else {
                    console.log ('error:' + errorString);
                    response.render ('weather-info',{'city':city,city_options:cityModel,error:errorString});
                }
            });
        }).end();
    });

};
