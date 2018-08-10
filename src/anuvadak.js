const writeText = require("./writeText");
const writeStream = require("./writeStream");
const writeBuffer = require("./writeBuffer");
const writeJson = require("./writeJson");
const xmlAnuvadak = require("./xmlAnuvadak");
const nimnAnuvadak = require("./nimnAnuvadak");

module.exports = (muneem, options) => {
    options = options || {};
    xmlAnuvadak.buildGlobalConfig(options);

    muneem.addToAnswer("writeText", writeText);
    muneem.addToAnswer("writeStream", writeStream);
    muneem.addToAnswer("writeBuffer", writeBuffer);
    muneem.addToAnswer("writeJson", writeJson);
    muneem.addToAnswer("writeXml", xmlAnuvadak.writeXml);
    muneem.addToAnswer("writeNimn", nimnAnuvadak.writeNimn);

    //add a router event
    muneem.on("addRoute", buildConfiguration);
}

function buildConfiguration( routeContext ){
    if(routeContext.anuvadak) {
        if(routeContext.anuvadak.write){//write to response
            const nimnConfig = routeContext.anuvadak.write.nimn;
            if( nimnConfig && nimnConfig.schema ){
                nimnConfig.schema = nimnAnuvadak.buildSchema( nimnConfig.schema );
            }
            var xmlConfig = routeContext.anuvadak.write.xml;
            if( xmlConfig ){
                routeContext.anuvadak.write.xml = xmlAnuvadak.getWriteParser( xmlConfig );
            }

        }else if(routeContext.anuvadak.from){//read from request
            
        }
    }
}