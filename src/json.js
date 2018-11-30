const { setType, setLength} = require("./util")

/**
 * Write data (JS object) as JSON string if it is not written before. Content type will not be set if it is already set
 * @param {object} data : content
 * @param {string} type : content-type
 * @param {number} length : content-length
 * @param {boolean} append : append content if already present
 */
const writeJson = function(data, type, length, safe){
    if(data === undefined || typeof data === 'function' || typeof  data === 'symbol' ){
        this.length(0);
        throw Error("Unsupported type. Given data can't be parsed to JSON.");
    }else if( this.data && safe){
        return;
    }else {
        this.data = JSON.stringify(data);   
        
        setType(this, type, "application/json");
        setLength(this, length)
    }
}


const readJson = async function(){
    await this.readBody();
    this.body = JSON.parse( this.body.toString() );
    return this.body;
}


function config(muneem, options){
    muneem.addToAnswer("writeJson", writeJson);
    muneem.addToAnswer("asJson", writeJson);
    muneem.addToAsked("readJson", readJson);
}

module.exports = config;