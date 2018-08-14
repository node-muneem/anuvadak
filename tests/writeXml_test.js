const MockRes = require('mock-res');
const MockReq = require('mock-req');
const Muneem = require('muneem');
const anuvadak = require('./../src/anuvadak');

describe ('xmlAnuvadak', () => {

    it('should throw error when null data is given', () => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked,answer) => {
            expect( function(){
                answer.writeXml(null);
            } ).toThrowError("Unsupported type. Given data can't be parsed to XML.");
        } ) ;

        var request = buildRequest(muneem)

        var response = new MockRes();

        //assertResponse(response,"", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    it('should throw error when no data is given', () => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked,answer) => {
            expect( function(){
                answer.writeXml();
            } ).toThrowError("Unsupported type. Given data can't be parsed to XML.");
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
                answer.writeXml(function(){});
            } ).toThrowError("Unsupported type. Given data can't be parsed to XML.");
        } ) ;

        var request = buildRequest(muneem)

        var response = new MockRes();

        //assertResponse(response,"", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    it('should not parse to XML when some data is already set and safety is on', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked,answer) => {
            
            answer.write("add some data")
            answer.writeXml({
                "some" : "data"
            }, null, null, true);

            assertAnswerObject(answer, "add some data");
            done();
        } ) ;

        var request = buildRequest(muneem)

        var response = new MockRes();

        //assertResponse(response,"", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    it('should parse XML when no options are defined', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked,answer) => {
            answer.writeXml({
                "some" : {
                    "@_a" : "attrib",
                    "#text" : "some text data"
                }
            });
            assertAnswerObject(answer, '<some><@_a>attrib</@_a>some text data</some>', 'text/xml', 44);
            done();
        } ) ;

        var request = buildRequest(muneem)
        var response = new MockRes();

        muneem.routesManager.router.lookup(request,response);
    });

    it('should parse XML when global options are present', (done) => {
        const muneem = Muneem();
        anuvadak(muneem, {
            write:{
                xml:{
                    ignoreAttributes : false
                }
            }
        });

        muneem.addHandler("main", (asked,answer) => {
            answer.writeXml({
                "some" : {
                    "@_a" : "attrib",
                    "#text" : "some text data"
                }
            });
            assertAnswerObject(answer, '<some a="attrib">some text data</some>', 'text/xml', 38);
            done();
        } ) ;

        var request = buildRequest(muneem)
        var response = new MockRes();

        muneem.routesManager.router.lookup(request,response);
    });

    it('should parse XML and ignore global options when route specific options are present', (done) => {
        const muneem = Muneem();
        anuvadak(muneem, {
            write:{
                xml:{
                    ignoreAttributes : false
                }
            }
        });

        muneem.addHandler("main", (asked,answer) => {
            answer.writeXml({
                "some" : {
                    "@_a" : "attrib",
                    "#text" : "some text data"
                }
            });
            assertAnswerObject(answer, '<some><@_a>attrib</@_a>some text data</some>', 'text/xml', 44);
            done();
        } ) ;

        var request = buildRequest(muneem, {
            write:{
                xml:{
                    ignoreAttributes : true
                }
            }
        })
        var response = new MockRes();

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