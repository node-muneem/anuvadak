const qs = require('qs')


function UrlFormReader(globalOptions){
    if(!globalOptions) globalOptions = {};

    this.readForm =  async function(options){
        options = Object.assign({}, globalOptions, options);

        if( !this._mayHaveBody || (options.confirmHeaderParam  && this.headers["content-type"] !== "application/x-www-form-urlencoded" ) ){
            return;
        }

        await this.readBody();
        this.body = qs.parse( this.body.toString(), options ); //this.body will be object now
        return this.body;
    }
}


function config(muneem, options){
    const urlFormReader = new UrlFormReader(options);
    muneem.addToAsked("readUrlEncodedForm", urlFormReader.readForm);
    muneem.addToAsked("readUrlForm", urlFormReader.readForm);
}

module.exports = config;