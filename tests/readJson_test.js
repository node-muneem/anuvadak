const MockRes = require('mock-res');
const MockReq = require('mock-req');
const Muneem = require('muneem');
const anuvadak = require('./../src/anuvadak');

describe ('Anuvadak', () => {

    it('should read JSON request stream', async (done) => {
        const muneem = Muneem();
        anuvadak.json(muneem);

        muneem.addHandler("main", async (asked,answer) => {
            var data = await asked.readJson();
            expect(data).toEqual({some : "data"});
            done();
        } ) ;

        var dataRequest = JSON.stringify( {
            some : "data"
        });
        var request = buildRequest(muneem)
        request.write(dataRequest);
        request.end();

        var response = new MockRes();

        //assertResponse(response,"", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    function buildRequest(muneem, options, data){
        muneem.route({
            when: "POST",
            url: "/test",
            to: "main",
            anuvadak : options
        });

        return new MockReq({
            url: '/test',
            method: "POST",
        });
    }
    
});