const Muneem = require('muneem');
const anuvadak = require('../src/anuvadak');
var fs = require('fs');
var path = require('path');

var path = require('path')
var chai = require('chai')
, chaiHttp = require('chai-http')
, expected = require('chai').expect;

chai.use(chaiHttp);

describe ('Anuvadak Form', () => {

    it('should read multipart forms from the request stream', async (done) => {
        const app = Muneem();
        anuvadak.form(app);
        
        app.addHandler("main", async (asked,answer) => {
            var data = await asked.readForm();
            
            expect(data.someField).toEqual('123');
            expect(data.fileField.name).toEqual('someName');
            expect(data.fileField2.name).toEqual('someOtherName');
            answer.write("I'm glad to response you back.");
        } ) ;

        app.route({
            when: "POST",
            url: "/test",
            to: "main",
            //anuvadak : options
        });

        app.start(3004);

        chai.request("http://localhost:3004")
            .post('/test')
            .type('form')
            .field('someField', '123')
            .attach('fileField', fs.readFileSync( path.join(__dirname,  'fileToDownload') ), 'someName')
            .attach('fileField2', fs.readFileSync( path.join(__dirname,  'fileToDownload') ), 'someOtherName')
            .then(res => {
                expect( res.status).toBe(200);
                expect( res.text).toBe("I'm glad to response you back.");
                done();
            }).catch( err => {
                done.fail("not expected " + err);
            });
        
    });

    
});
