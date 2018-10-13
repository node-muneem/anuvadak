const Muneem = require('muneem');
const anuvadak = require('./../src/anuvadak');

var path = require('path')
var fs = require('fs')
var chai = require('chai')
, chaiHttp = require('chai-http')
, expected = require('chai').expect;

chai.use(chaiHttp);

/*
As it adds a method to HttpAnswer, we can't register different methods with same name.
Hence only one test suite can run at a time.
*/

describe ('Files', () => {
    /* 
    describe ('Files 1', () => {

        //Muneem.setLogger(console);
        const muneem = Muneem({
            server : {
                requestId : true,
                port : 3006
            }
        });
        
        muneem.use(anuvadak.sendFiles, {
            root : path.join(__dirname, "static")
        });

        muneem.addHandler("main", async (asked,answer) => {
            //answer.sendFile("index.html");
            answer.sendFile();//it'll pick the path from request
        } ) ;

        muneem.route({
            uri: "/*",
            to: "main"
        });

        muneem.start();

        it('should return static file', (done) => {
            chai.request("http://localhost:3006")
                .get('/index.html')
                //.set('content-type', 'application/json')
                .send("")
                .then(res => {
                    expect( res.status).toBe(200);
                    expect( res.text).toBe(`<html>
        <head>

        </head>
        <body>
            This is the home page.
        </body>
    </html>`);
                done();
            }).catch( err => {
                done.fail("not expected " + err);
            });
        });

        it('should return 404 when the file doesn\'t exist', (done) => {
            chai.request("http://localhost:3006")
            .get('/index2.html')
            .send("")
            .then(res => {
                expect( res.status).toBe(404);
                done();
            }).catch( err => {
                done.fail("not expected " + err);
            });
        });

        it('should return 404 when accessing folder', (done) => {
            chai.request("http://localhost:3006")
            .get('/nested')
            .send("")
            .then(res => {
                expect( res.status).toBe(404);
                done();
        }).catch( err => {
            done.fail("not expected " + err);
        });
    });
        
        it('should error when root is not set', () => {
            const muneem = Muneem();
            expect(() => {
                muneem.use(anuvadak.sendFiles, {
                    //root : path.join(__dirname, "static")
                });
            }).toThrowError("You've set no path for static files");
        });

        it('should error for incorrect root', () => {
            const muneem = Muneem();
            expect(() => {
                muneem.use(anuvadak.sendFiles, {
                    root : "static/index.html"
                });
            }).toThrowError("You've set an incorrect path for static files");
        });

    });//describe ends
 */
    describe ('Files 2', () => {

        //Muneem.setLogger(console);
        const muneem = Muneem({
            server : {
                requestId : true,
                port : 3007
            }
        });
        
        muneem.use(anuvadak.sendFiles, {
            root : path.join(__dirname , "static"),
            ignore404 : true,                   // ignore default resource not found handling
            ignoreRequestPath : true      // force to ignore URL path
        });
    
        muneem.addHandler("main", async (asked,answer) => {
            answer.sendFile("index.html");
        } ) ;

        muneem.addHandler("custom404", async (asked,answer) => {
            var stream = answer.sendFile("index2.html");
            stream.on("error", err => {
                if(err.code === "ENOENT"){
                    answer.error(err);
                }
            })
        } ) ;
    
        muneem.addHandler("ignoreUrlPath", async (asked,answer) => {
            answer.sendFile({
                from: "nested"
            });
        } ) ;
    
        muneem.route({
            uri: "/notexist.html",
            to: "main"
        });
        
        muneem.route({
            uri: "/index2.html",
            to: "custom404"
        });
    
        muneem.route({
            uri: "/nested.txt",
            to: "ignoreUrlPath"
        });
    
        muneem.start();
    
        it('should send given file', (done) => {
            chai.request("http://localhost:3007")
                .get('/notexist.html')
                //.set('content-type', 'application/json')
                .send("")
                .then(res => {
                    expect( res.status).toBe(200);
                    expect( res.text).toBe(`<html>
    <head>

    </head>
    <body>
        This is the home page.
    </body>
</html>`);
                done();
            }).catch( err => {
                done.fail("not expected " + err);
            });
        });
        
        it('should invoke custom resource not found handler when ignore404 is set', (done) => {
            chai.request("http://localhost:3007")
                .get('/index2.html')
                //.set('content-type', 'application/json')
                .send("")
                .then(res => {
                    expect( res.status).toBe(500);
                    expect( res.text).toBe('');
                done();
            }).catch( err => {
                done.fail("not expected " + err);
            });
        });
    
         it('should ignore reading the file path from the URL when ignoreRequestPath is set', (done) => {
             chai.request("http://localhost:3007")
             .get('/nested.txt')
             .send("")
             .then(res => {
                 expect( res.status).toBe(500);
                 expect( res.text).toBe('');
                 done();
            }).catch( err => {
                done.fail("not expected " + err);
            });
        });
    
    });
});

