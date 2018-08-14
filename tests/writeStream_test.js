const MockRes = require('mock-res');
const MockReq = require('mock-req');
const fs = require('fs');
const path = require('path');
const Muneem = require('muneem');
const anuvadak = require('./../src/anuvadak');
const zlib = require('zlib');

describe ('writeStream', () => {

    beforeAll(() => {
        //create a file for test
        fs.writeFileSync(path.resolve(__dirname, "fileToDownload"), "This file is ready for download");
    });

    it('should set data, content-type when given', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked,answer) => {
            //create a stream
            const fileReadableStream = fs.createReadStream(path.resolve(__dirname, "fileToDownload"));
            answer.writeStream(fileReadableStream, "text/plain");
            expect(answer.type() ).toEqual("text/plain");
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        let chunks = [];   
        response.on('data', chunk => {
            chunks.push(chunk);
        });
        response.on('finish', function() {
            chunks = Buffer.concat(chunks);
            expect(response.getHeader("content-type")).toEqual("text/plain");
            expect(chunks.toString() ).toEqual("This file is ready for download");
            expect(response.statusCode ).toEqual(200);
            done();
        });

        muneem.routesManager.router.lookup(request,response);
    });

    it('should overwrite previously set data when safety is off', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked,answer) => {
            answer.write("previous data");
            //create a stream
            const fileReadableStream = fs.createReadStream(path.resolve(__dirname, "fileToDownload"));
            answer.writeStream(fileReadableStream, "text/plain");
            expect(answer.type() ).toEqual("text/plain");
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        let chunks = [];   
        response.on('data', chunk => {
            chunks.push(chunk);
        });
        response.on('finish', function() {
            chunks = Buffer.concat(chunks);
            expect(response.getHeader("content-type")).toEqual("text/plain");
            expect(chunks.toString() ).toEqual("This file is ready for download");
            expect(response.statusCode ).toEqual(200);
            done();
        });

        muneem.routesManager.router.lookup(request,response);
    });

    it('should not overwrite previously set data when safety is on', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked,answer) => {
            answer.write("previous data");
            //create a stream
            const fileReadableStream = fs.createReadStream(path.resolve(__dirname, "fileToDownload"));
            answer.writeStream(fileReadableStream, "text/plain", true);
            expect(answer.data ).toEqual("previous data");
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

        muneem.routesManager.router.lookup(request,response);
    });

    it('should pipe data stream when to pipe', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        //create a file for test
        fs.writeFileSync(path.resolve(__dirname, "fileToDownload"), "This file is ready for download");

        muneem.addHandler("main", (asked,answer) => {
            //create a stream
            const fileReadableStream = fs.createReadStream(path.resolve(__dirname, "fileToDownload"));
            answer.writeStream(fileReadableStream, "text/plain");
            answer.writeStream(zlib.createGzip(), null, null, true);
            answer.setHeader("content-encoding" ,"gzip");
            expect(answer.type() ).toEqual("text/plain");
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        let chunks = [];   
        response.on('data', chunk => {
            chunks.push(chunk);
        });
        response.on('finish', function() {
            chunks = Buffer.concat(chunks);
            expect(response.getHeader("content-type")).toEqual("text/plain");
            expect(response.getHeader("content-encoding")).toEqual("gzip");
            expect(zlib.gunzipSync(chunks).toString()).toEqual("This file is ready for download");
            //expect(chunks.toString() ).toEqual("This file is ready for download");
            expect(response.statusCode ).toEqual(200);
            done();
        });

        muneem.routesManager.router.lookup(request,response);
    });


    it('should pipe data stream even if safety is on', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        //create a file for test
        fs.writeFileSync(path.resolve(__dirname, "fileToDownload"), "This file is ready for download");

        muneem.addHandler("main", (asked,answer) => {
            //create a stream
            const fileReadableStream = fs.createReadStream(path.resolve(__dirname, "fileToDownload"));
            answer.writeStream(fileReadableStream, "text/plain");
            answer.writeStream(zlib.createGzip(), null, true, true);
            answer.setHeader("content-encoding" ,"gzip");
            expect(answer.type() ).toEqual("text/plain");
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        let chunks = [];   
        response.on('data', chunk => {
            chunks.push(chunk);
        });
        response.on('finish', function() {
            chunks = Buffer.concat(chunks);
            expect(response.getHeader("content-type")).toEqual("text/plain");
            expect(response.getHeader("content-encoding")).toEqual("gzip");
            expect(zlib.gunzipSync(chunks).toString()).toEqual("This file is ready for download");
            //expect(chunks.toString() ).toEqual("This file is ready for download");
            expect(response.statusCode ).toEqual(200);
            done();
        });

        muneem.routesManager.router.lookup(request,response);
    });

    it('should not pipe data stream when not to pipe', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        //create a file for test
        fs.writeFileSync(path.resolve(__dirname, "fileToDownload"), "This file is ready for download");

        muneem.addHandler("main", (asked,answer) => {
            //create a stream
            const fileReadableStream = fs.createReadStream(path.resolve(__dirname, "fileToDownload"));
            answer.writeStream(fileReadableStream, "text/plain");
            answer.writeStream( zlib.createGzip() , null, true);
            expect(answer.type() ).toEqual("text/plain");
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        let chunks = [];   
        response.on('data', chunk => {
            chunks.push(chunk);
        });
        response.on('finish', function() {
            chunks = Buffer.concat(chunks);
            expect(response.getHeader("content-type")).toEqual("text/plain");
            //expect(zlib.gunzipSync(chunks).toString()).toEqual("This file is ready for download");
            expect( chunks.toString() ).toEqual("This file is ready for download");
            expect( response.statusCode ).toEqual(200);
            done();
        });

        muneem.routesManager.router.lookup(request,response);
    });

    it('should not set type if already set', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        //create a file for test
        fs.writeFileSync(path.resolve(__dirname, "fileToDownload"), "This file is ready for download");

        muneem.addHandler("main", (asked,answer) => {
            //create a stream
            const fileReadableStream = fs.createReadStream(path.resolve(__dirname, "fileToDownload"));
            answer.type("text/plain");
            answer.writeStream(fileReadableStream, "text/plain2");
            expect(answer.type() ).toEqual("text/plain");
        } ) ;

        muneem.route({
            uri: "/test",
            to: "main"
        });

        var request  = new MockReq({
            url: '/test'
        });

        var response = new MockRes();

        let chunks = [];   
        response.on('data', chunk => {
            chunks.push(chunk);
        });
        response.on('finish', function() {
            chunks = Buffer.concat(chunks);
            expect(response.getHeader("content-type")).toEqual("text/plain");
            expect(chunks.toString() ).toEqual("This file is ready for download");
            expect(response.statusCode ).toEqual(200);
            done();
        });

        muneem.routesManager.router.lookup(request,response);
    });

    it('should throw an error when invalid data is given', (done) => {
        const muneem = Muneem();
        anuvadak(muneem);

        muneem.addHandler("main", (asked, answer) => {
            answer.writeStream(new Date());
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
        anuvadak(muneem);

        muneem.addHandler("main", (asked, answer) => {
            answer.writeStream(null);
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
        anuvadak(muneem);

        muneem.addHandler("main", (asked, answer) => {
            answer.writeStream();
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
            answer.write("new Date()");
            expect(()=>{
                const fileReadableStream = fs.createReadStream(path.resolve(__dirname, "fileToDownload"));
                answer.type("text/plain");
                answer.writeStream(fileReadableStream, "text/plain2", false, true);
            }).toThrowError("Unsupported type. You're trying to pipe stream data on non-stream data.");
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
    

    function assertResponse(response, data, status, done, type){

        let chunks = [];   
        response.on('data', chunk => {
            chunks.push(chunk);
        });
        response.on('finish', function() {
            chunks = Buffer.concat(chunks);
            expect(response.getHeader("content-type")).toEqual(type);
            expect(chunks.toString() ).toEqual(data);
            expect(response.statusCode ).toEqual(status);
            done();
        });

    }

    function assertAnswerObject(answer, type){
        
        expect(answer.type() ).toEqual(type);
    }
});