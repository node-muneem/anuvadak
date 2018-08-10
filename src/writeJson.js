const { setType, setLength} = require("./util")

/**
 * Write data (JS object) as JSON string if it is not written before. Content type will not be set if it is already set
 * @param {object} data : content
 * @param {string} type : content-type
 * @param {number} length : content-length
 * @param {boolean} append : append content if already present
 */
module.exports = function(data, type, length, safe){
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