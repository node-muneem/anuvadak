const { setType, setLength} = require("./util")
const j2xParser = require("fast-xml-parser").j2xParser;

/**
 * Write data (JS object) as XML string if it is not written before. 
 * Content type will not be set if it is already set
 * @param {object} data : content
 * @param {string} type : content-type
 * @param {number} length : content-length
 * @param {boolean} append : append content if already present
 */
 function writeXml(data, type, length, safe){

    if(data === null || data === undefined || typeof data !== "object" ){
        this.length(0);
        throw Error("Unsupported type. Given data can't be parsed to XML.");
    }else if(this.data && safe){
        return;
    }else{
        const anuvadakConfig = this._for.context.route.anuvadak;

        var parser;
        if(anuvadakConfig && anuvadakConfig.write && anuvadakConfig.write.xml){
            parser = new j2xParser(anuvadakConfig.write.xml);
        }else{
            parser = globalnstance;
        }

        this.data = parser.parse(data);

        setType(this, type, "text/xml");
        setLength(this, length)
    } 
}

var globalnstance;
function buildGlobalConfig(options){
    if(options && options.write && options.write.xml){
        globalnstance = new j2xParser(options.write.xml);
    }else{
        globalnstance = new j2xParser();
    }
    //return globalnstance;
}

module.exports = {
    writeXml : writeXml,
    buildGlobalConfig : buildGlobalConfig
}