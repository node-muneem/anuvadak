const { setType, setLength} = require("./util")
const j2xParser = require("fast-xml-parser").j2xParser;
const xmlParser = require("fast-xml-parser");

function XMLAnuvadak(globalOptions){
    if(!globalOptions) globalOptions = {};

    const globalXmlWriter = getWriter(globalOptions.write);
    const xmlReadGlobalOptions = globalOptions.read;

    this.writeXml = function (){
        let data = arguments[0], localOptions, type, length, safe;
        if( typeof arguments[1] === 'object'){
            localOptions = arguments[1];
            type = arguments[2];
            length = arguments[3];
            safe = arguments[4];
        }else{
            type = arguments[1];
            length = arguments[2];
            safe = arguments[3];
        }

        const xmlWriter = localOptions !== undefined ? getWriter( localOptions ) : globalXmlWriter;

        if(data === null || data === undefined || typeof data !== "object" ){
            this.length(0);
            throw Error("Unsupported type. Given data can't be parsed to XML.");
        }else if(this.data && safe){
            return;
        }else{
            this.data = xmlWriter.parse(data);
    
            setType(this, type, "text/xml");
            setLength(this, length)
        } 
    }

    this.readXml = async function(localOptions){
        const parsingOptions = Object.assign( {}, xmlReadGlobalOptions, localOptions);
        
        await this.readBody();
        this.body = xmlParser.parse( this.body.toString() , parsingOptions);
        return this.body;
    }
}

/**
 * Parse JS object to XML
 * @param {object} writerOptions 
 */
function getWriter(writerOptions){
    if(writerOptions){
        return new j2xParser(writerOptions);
    }else{//writer with default options
        return new j2xParser();
    }
}


function config(muneem, options){
    options = options || {};
    var xmlAnuvadak = new XMLAnuvadak(options);
    muneem.addToAnswer("writeXml", xmlAnuvadak.writeXml);
    muneem.addToAsked("readXml", xmlAnuvadak.readXml);
}

module.exports = config;