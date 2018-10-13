const MockRes = require('mock-res');
const MockReq = require('mock-req');
const Muneem = require('muneem');
const anuvadak = require('./../src/anuvadak');

describe ('Anuvadak', () => {

    it('should read XML request stream with default options', async (done) => {
        const muneem = Muneem();
        anuvadak.xml(muneem);

        muneem.addHandler("main", async (asked,answer) => {
            var data = await asked.readXml();
            expect(data).toEqual({some : "some text data"});
            done();
        } ) ;

        var request = buildRequest(muneem)
        request.write("<some a='attrib'>some text data</some>");
        request.end();

        var response = new MockRes();

        //assertResponse(response,"", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    it('should read XML request stream with globally defined options', async (done) => {
        const muneem = Muneem();
        anuvadak.xml(muneem,{
            read:{
                ignoreAttributes : false
            }
        });

        muneem.addHandler("main", async (asked,answer) => {
            var data = await asked.readXml();
            expect(data).toEqual({some : {
                "#text" : "some text data",
                "@_a" : "attrib"
            }});
            done();
        } ) ;

        var request = buildRequest(muneem)
        request.write("<some a='attrib'>some text data</some>");
        request.end();

        var response = new MockRes();

        //assertResponse(response,"", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    it('should read XML request stream with route level options', async (done) => {
        const muneem = Muneem();
        anuvadak.xml(muneem,{
            read:{
                ignoreAttributes : false
            }
        });

        muneem.addHandler("main", async (asked,answer) => {
            var data = await asked.readXml({
                ignoreAttributes : true
            });
            expect(data).toEqual({some : "some text data"});
            done();
        } ) ;

        var request = buildRequest(muneem)
        request.write("<some a='attrib'>some text data</some>");
        request.end();

        var response = new MockRes();

        //assertResponse(response,"", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    function buildRequest(muneem){
        muneem.route({
            when: "POST",
            url: "/test",
            to: "main"
        });

        return new MockReq({
            url: '/test',
            method: "POST",
        });
    }
    
});