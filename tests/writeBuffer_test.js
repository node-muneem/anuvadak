const MockRes = require('mock-res');
const MockReq = require('mock-req');
const Muneem = require('muneem');
const anuvadak = require('./../src/anuvadak');

describe ('writeBuffer', () => {

    it('should  set data, content-type, and length', (done) => {
        const muneem = Muneem();
        anuvadak.buffer(muneem);

        muneem.addHandler("main", (asked,answer) => {
            answer.writeBuffer(Buffer("some data"));
            assertAnswerObject(answer, Buffer("some data"), "application/octet-stream", 9);
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        assertResponse(response,"some data", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    it('should  not set data if already set and safety is on', (done) => {
        const muneem = Muneem();
        anuvadak.buffer(muneem);

        muneem.addHandler("main", (asked,answer) => {
            answer.writeBuffer(Buffer("some data"), null, null, true);
            answer.writeBuffer(Buffer("some more data"), null, null, true);
            assertAnswerObject(answer, Buffer("some data"), "application/octet-stream", 9);
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        assertResponse(response,"some data", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    it('should  overwrite data if already set and safety is off', (done) => {
        const muneem = Muneem();
        anuvadak.buffer(muneem);

        muneem.addHandler("main", (asked,answer) => {
            answer.writeBuffer(Buffer("some data"), null, null, false);
            answer.writeBuffer(Buffer("some more data"), null, null, false);
            assertAnswerObject(answer, Buffer("some more data"), "application/octet-stream", 14);
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        assertResponse(response,"some more data", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    it('should  not set content type if set', (done) => {
        const muneem = Muneem();
        anuvadak.buffer(muneem);

        muneem.addHandler("main", (asked,answer) => {
            answer.type("some/type");
            answer.writeBuffer(Buffer("some data"), null, null, false);
            answer.writeBuffer(Buffer("some more data"), null, null, false);
            assertAnswerObject(answer, Buffer("some more data"), "some/type", 14);
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        assertResponse(response,"some more data", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    it('should append buffer data', (done) => {
        const muneem = Muneem();
        anuvadak.buffer(muneem);

        muneem.addHandler("main", (asked,answer) => {
            answer.type("some/type");
            answer.writeBuffer(Buffer("some data "), null, null, false);
            answer.writeBuffer(Buffer("some more data"), null, null, false, true);
            assertAnswerObject(answer, Buffer("some data some more data"), "some/type", 24);
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        assertResponse(response,"some data some more data", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    it('should throw an error when invalid data is given', (done) => {
        const muneem = Muneem();
        anuvadak.buffer(muneem);

        muneem.addHandler("main", (asked, answer) => {
            answer.writeBuffer(new Date());
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

    it('should throw an error when null data is given', (done) => {
        const muneem = Muneem();
        anuvadak.buffer(muneem);

        muneem.addHandler("main", (asked, answer) => {
            answer.writeBuffer(null);
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

    it('should throw an error when undefined data is given', (done) => {
        const muneem = Muneem();
        anuvadak.buffer(muneem);

        muneem.addHandler("main", (asked, answer) => {
            answer.writeBuffer( undefined );
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
        anuvadak.buffer(muneem);

        muneem.addHandler("main", (asked, answer) => {
            answer.write("new Date()");
            expect(()=>{
                answer.writeBuffer( Buffer.from( "new Date()" ), null, null, false, true);
            }).toThrowError("Unsupported type. You're trying to append buffer to non-buffer.");
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