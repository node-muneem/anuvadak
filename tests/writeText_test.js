const MockRes = require('mock-res');
const MockReq = require('mock-req');
const Muneem = require('muneem');
const anuvadak = require('./../src/anuvadak');

describe ('writeText', () => {

    it('should throw Error when data is null', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked,answer) => {
            answer.writeText(null);
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        assertResponse(response,"", 500, done);
        muneem.routesManager.router.lookup(request,response);
    });

    it('should throw Error data is undefined', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked,answer) => {
            answer.writeText();
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        assertResponse(response,"", 500, done);
        muneem.routesManager.router.lookup(request,response);
    });

    it('should set empty data, content-type, and 0 length when data is empty string', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked,answer) => {
            answer.writeText("");
            assertAnswerObject(answer, "", "text/plain", 0)
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        assertResponse(response,"", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    it('should set data, content-type, and length when data is string type', (done) => {
        //Muneem.setLogger(console);
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked, answer) => {
            answer.writeText("some data");
            assertAnswerObject(answer, "some data", "text/plain", 9)
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        assertResponse(response, "some data", 200, done);
        muneem.routesManager.router.lookup(request, response);
    });

    it('should set data, content-type, and length when data is number type', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked, answer) => {
            answer.writeText(485);
            assertAnswerObject(answer, "485", "text/plain", 3)
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        assertResponse(response, "485", 200, done);
        muneem.routesManager.router.lookup(request, response);
    });
    
    it('should overwrite data when safety is off', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked, answer) => {
            answer.writeText("some data");
            answer.writeText("some other data");
            assertAnswerObject(answer, "some other data", "text/plain",  15)
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        assertResponse(response, "some other data", 200, done);
        muneem.routesManager.router.lookup(request, response);
    });

    it('should not overwrite data when safety is on', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked, answer) => {
            answer.writeText("some data");
            answer.writeText("some other data" , null,null, true, null);
            assertAnswerObject(answer, "some data", "text/plain",  9)
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        assertResponse(response, "some data", 200, done);
        muneem.routesManager.router.lookup(request, response);
    });

    it('should not check for safety when to append', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked, answer) => {
            answer.writeText("some data");
            answer.writeText(" some other data" , null,null, null, true);
            assertAnswerObject(answer, "some data some other data", "text/plain",  25)
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        assertResponse(response, "some data some other data", 200, done);
        muneem.routesManager.router.lookup(request, response);
    });

    it('should not set content-type if already set', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked, answer) => {
            answer.type("some/else")
            answer.writeText("some data");
            answer.writeText(" some other data" , null, null, null, true);
            assertAnswerObject(answer, "some data some other data", "some/else",  25)
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        assertResponse(response, "some data some other data", 200, done);
        muneem.routesManager.router.lookup(request, response);
    });

    it('should throw an error when invalid data is given', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked, answer) => {
            answer.writeText(new Date());
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        assertResponse(response, "", 500, done);
        muneem.routesManager.router.lookup(request, response);
    });

    it('should throw an error when invalid data is appended', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked, answer) => {
            answer.write(Buffer.from("buffer data"));
            expect(()=>{
                answer.writeText("text data", null , null, false, true);
            }).toThrowError("Unsupported type. You're trying to append string data to non-string data.");
            done();
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        muneem.routesManager.router.lookup(request, response);
    });

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