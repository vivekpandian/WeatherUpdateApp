/*global describe:false, it:false, before:false, after:false, afterEach:false*/

'use strict';


var app = require('../index'),
    kraken = require('kraken-js'),
    request = require('supertest');


describe('/weather-info', function () {

    var mock;


    beforeEach(function (done) {
        kraken.create(app).listen(function (err, server) {
            mock = server;
            done(err);
        });
    });


    afterEach(function (done) {
        mock.close(done);
    });



    it('should return 200 and expected output (Austin City)', function (done) {
        request(mock)
            .get('/weather?city=TX%2FAustin')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect (/<td id="city">Austin/)
            .end(function(err, res){
                done(err);
            });
    });

    it('should return 200 and expected output (Timonium City)', function (done) {
        request(mock)
            .get('/weather?city=MD%2FTimonium')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect (/<td id="city">Timonium/)
            .end(function(err, res){
                done(err);
            });
    });

    it('should return 200 and expected output (Omaha City)', function (done) {
        request(mock)
            .get('/weather?city=NE%2FOmaha')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect (/<td id="city">Omaha/)
            .end(function(err, res){
                done(err);
            });
    });

    it('should return 200 and expected output (Campbell City)', function (done) {
        request(mock)
            .get('/weather?city=CA%2FCampbell')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect (/<td id="city">Campbell/)
            .end(function(err, res){
                done(err);
            });
    });

    it('should return 200 and expected output (Invalid City)', function (done) {
        request(mock)
            .get('/weather?city=CA%2FCampbell999')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect (/Please select a valid city/)
            .end(function(err, res){
                done(err);
            });
    });

});