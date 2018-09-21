const qs = require('qs')


function UrlFormReader(globalOptions){
    if(!globalOptions) globalOptions = {};

    this.readForm =  function(options){
        options = Object.assign({}, globalOptions, options);

        if( !this.queryStr || (options.confirmHeaderParam  && this.headers["content-type"] !== "application/x-www-form-urlencoded" ) ){
            return;
        }
    
        this.body = qs.parse( this.queryStr, options ); //this.body will be object now
        return this.body;
    }
}


function config(muneem, options){
    const urlFormReader = new UrlFormReader(options);
    muneem.addToAsked("readUrlEncodedForm", urlFormReader.readForm);
    muneem.addToAsked("readUrlForm", urlFormReader.readForm);
}

module.exports = config;