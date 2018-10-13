const Muneem = require('muneem');
const anuvadak = require('./../src/anuvadak');

var path = require('path')
var chai = require('chai')
, chaiHttp = require('chai-http')
, expected = require('chai').expect;

chai.use(chaiHttp);


describe ('jsonAnuvadak', () => {

    it('should throw error when request stream is not JSON', (done) => {
        //Muneem.setLogger(console);
        const app = Muneem();
        anuvadak.json(app);

        app.addHandler("main", async (asked,answer) => {
            await asked.readJson();
            answer.write("I'm glad to response you back.");
        } ) ;

        app.route({
            when: "POST",
            url: "/test",
            to: "main"
        });

        app.start(3002);

        chai.request("http://localhost:3002")
            .post('/test')
            .set('content-type', 'application/json')
            //.send({myparam: 'test'})
            .send("invalid request data")
            .then(res => {
                expect( res.status).toBe(500);
                expect( res.text).toBe("");
                done();
            }).catch( err => {
                done.fail("not expected " + err);
            });
    });
});