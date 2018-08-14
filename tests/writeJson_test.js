const MockRes = require('mock-res');
const MockReq = require('mock-req');
const Muneem = require('muneem');
const anuvadak = require('./../src/anuvadak');

describe ('jsonAnuvadak', () => {

    it('should throw error when no data is given', () => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked,answer) => {
            expect( function(){
                answer.writeJson();
            } ).toThrowError("Unsupported type. Given data can't be parsed to JSON.");
        } ) ;

        var request = buildRequest(muneem)

        var response = new MockRes();

        //assertResponse(response,"", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    it('should throw error when invalid data is given', () => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked,answer) => {
            expect( function(){
                answer.writeJson(function(){});
            } ).toThrowError("Unsupported type. Given data can't be parsed to JSON.");
        } ) ;

        var request = buildRequest(muneem)

        var response = new MockRes();

        //assertResponse(response,"", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    it('should not parse to JSON when some data is already set and safety is on', () => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked,answer) => {
            
            answer.write("add some data")
            answer.writeJson({
                "some" : "data"
            }, null, null, true);

            assertAnswerObject(answer, "add some data")
        } ) ;

        var request = buildRequest(muneem)

        var response = new MockRes();

        //assertResponse(response,"", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    it('should parse to JSON valid data is given', () => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked,answer) => {
            answer.writeJson({
                "some" : "data"
            });
            assertAnswerObject(answer, '{"some":"data"}', 'application/json', 15);
        } ) ;

        var request = buildRequest(muneem)
        var response = new MockRes();

        //assertResponse(response,"", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    function buildRequest(muneem, options){
        muneem.route({
            uri: "/test",
            to: "main",
            anuvadak : options
        });

        return new MockReq({
            url: '/test'
        });
    }
    
    function assertResponse(response, data, status, done){
        response.on('finish', function() {
            expect(response._getString() ).toEqual(data);
            expect(response.statusCode ).toEqual(status);
            done();
        });
    }

    function assertAnswerObject(answer, data, type, length){
        
        expect(answer.data).toEqual(data);
        expect(answer.type() ).toEqual(type);
        expect(answer.length() ).toEqual(length);
    }
});