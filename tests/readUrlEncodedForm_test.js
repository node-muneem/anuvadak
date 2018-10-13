const MockRes = require('mock-res');
const MockReq = require('mock-req');
const Muneem = require('muneem');
const anuvadak = require('./../src/anuvadak');

describe ('Anuvadak', () => {

    it('should read URL encoded forms from body', async (done) => {
        const app = Muneem();
        anuvadak.urlEncodedForm(app);

        app.addHandler("main", async (asked,answer) => {
            var data = await asked.readUrlEncodedForm();
            expect(data).toEqual({
                foo: {
                    bar: {
                        baz: 'foobarbaz'
                    }
                }
            });
            done();
        } ) ;

        var request = buildRequest(app)
        request.write("foo[bar][baz]=foobarbaz");
        request.end();

        var response = new MockRes();

        //assertResponse(response,"", 200, done);
        app.routesManager.router.lookup(request,response);
    });

    it('should read URL encoded forms from query string with given options', async (done) => {
        const muneem = Muneem();
        anuvadak.urlEncodedForm(muneem, {depth : 0});
        muneem.addHandler("main", async (asked,answer) => {
            var data = await asked.readUrlEncodedForm();
            expect(data).toEqual({
                foo: {
                    "[bar][baz]": 'foobarbaz'
                }
            });
            done();
        } ) ;

        var request = buildRequest(muneem)
        request.write("foo[bar][baz]=foobarbaz");
        request.end();

        var response = new MockRes();

        //assertResponse(response,"", 200, done);
        muneem.routesManager.router.lookup(request,response);
    });

    it('should read URL encoded forms with given options overrided global options', async (done) => {
        const muneem = Muneem();
        anuvadak.urlEncodedForm(muneem, {depth : 0});

        muneem.addHandler("main", async (asked,answer) => {
            var data = await asked.readUrlEncodedForm({ depth : 1});
            expect(data).toEqual({
                foo: {
                    bar: {
                        "[baz]": 'foobarbaz'
                    }
                }
            });
            done();
        } ) ;

        var request = buildRequest(muneem)
        request.write("foo[bar][baz]=foobarbaz");
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
