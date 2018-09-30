const { setType, setLength} = require("./util")
const j2xParser = require("fast-xml-parser").j2xParser;
const xmlParser = require("fast-xml-parser");

function XMLAnuvadak(options){
    if(!options) options = {};

    const globalXmlWriter = getWriter(options.write);
    const xmlReadGlobalOptions = options.read;

    this.writeXml = function (data, type, length, safe){

        if(data === null || data === undefined || typeof data !== "object" ){
            this.length(0);
            throw Error("Unsupported type. Given data can't be parsed to XML.");
        }else if(this.data && safe){
            return;
        }else{
            const anuvadakConfig = this._for.context.route.anuvadak;
    
            var parser;
            if(anuvadakConfig && anuvadakConfig.write && anuvadakConfig.write.xml){
                parser = anuvadakConfig.write.xml; //route specific parser
            }else{
                parser = globalXmlWriter;
            }
    
            this.data = parser.parse(data);
    
            setType(this, type, "text/xml");
            setLength(this, length)
        } 
    }

    this.readXml = async function(){
        const anuvadakConfig = this.context.route.anuvadak;
    
        var parsingOptions ;
        if(anuvadakConfig && anuvadakConfig.read && anuvadakConfig.read.xml){
            parsingOptions = anuvadakConfig.read.xml; //route specific options
        }else{
            parsingOptions = xmlReadGlobalOptions;
        }
        
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

    muneem.before("addRoute", buildWriteConfiguration);
}

/**
 * Build XML writer for each router at the time of adding route
 * @param {object} routeContext 
 */
function buildWriteConfiguration(routeContext){
    if(routeContext.anuvadak) { //route level configuration
        if(routeContext.anuvadak.write && routeContext.anuvadak.write.xml){//write to response
            routeContext.anuvadak.write.xml = getWriter( routeContext.anuvadak.write.xml );
        }
    }
}

module.exports = config;