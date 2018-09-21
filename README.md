# anuvadak (अनुवादक)
Add necessary serialization and body parsing methods to Muneem framework.

## How to use

```js
const muneem = require('muneem')();
const anuvadak = require('anuvadak');
muneem.use(anuvadak.plainText);
muneem.use(anuvadak.xml, xmlOptions);

muneem.add('handler', function(asked, answer){
    answer.writeText( data );
})
```

### plainText
alias: *text*

it allows you to response with plain text.

```js
const muneem = require('muneem')();
const anuvadak = require('anuvadak');
//muneem.use(anuvadak.plainText);
muneem.use(anuvadak.text);

function requestHandler(asked, answer){
    answer.writeText("This is text data");
}
```

> writeText(data[, type[, length[, safe[, append] ] ] ] );

**safe** :  if `true` and answer.data is already present then new data will not be set.
**append** :  if `true` and **safe** is `false` then new data will be appended to old data.

### buffer
it allows you to response with buffer data.

```js
const muneem = require('muneem')();
const anuvadak = require('anuvadak');
muneem.use(anuvadak.buffer);

function requestHandler(asked, answer){
    answer.writeBuffer( Buffer.from("This text data will be converted to buffer.") );
}
```

> writeBuffer(data[, type[, length[, safe[, append] ] ] ] )

**safe** :  if `true` and answer.data is already present then new data will not be set.
**append** :  if `true` and **safe** is `false` then new data will be appended to old data.

### stream
it allows you to response with streams.

```js
const muneem = require('muneem')();
const anuvadak = require('anuvadak');
muneem.use(anuvadak.stream);

function requestHandler(asked, answer){
    const fileReadableStream = fs.createReadStream( filePath );
    answer.writeStream( fileReadableStream );
}
```

> writeStream(data[, type[, length[, safe[, append] ] ] ] )

**safe** :  if `true` and answer.data is already present then new data will not be set.
**append** :  if `true` and **safe** is `false` then new data will be pipe to old data.

### json
it allows you to read js object from request body. it also allows you to response with js objects which gets converted to JSON.

```js
const muneem = require('muneem')();
const anuvadak = require('anuvadak');
muneem.use(anuvadak.json);

function requestHandler(asked, answer){
    //var requestObject = await asked.readJson();
    await asked.readJson();
    requestObject = asked.body;
    //..
    answer.writeJson( responseObject );
}
```

> readJson()
> writeJson(data[, type[, length[, safe] ] ])

**safe** :  if `true` and answer.data is already present then new data will not be set.

### xml
it allows you to read XML data from request body as js object. it also allows you to response with js objects which gets converted to XML.

```js
const muneem = require('muneem')();
const anuvadak = require('anuvadak');
//muneem.use(anuvadak.xml); //for default options
muneem.use(anuvadak.xml, { //global options
    read : xmlReadOptions, // https://github.com/NaturalIntelligence/fast-xml-parser#xml-to-json
    write : xmlWriteOptions // https://github.com/NaturalIntelligence/fast-xml-parser#json--js-object-to-xml
});

function requestHandler(asked, answer){
    //var requestObject = await asked.readXml();
    await asked.readXml();
    requestObject = asked.body;
    //..
    answer.writeXml( responseObject );
}
```

> readXml()

> writeXml(data[, type[, length[, safe] ] ])

**safe** :  if `true` and answer.data is already present then new data will not be set.

we use [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) to parse JS object to XML. If you want to overwrite options, you can set them either globally or at route level. Check above example to set global options.

**Route level**

```js
muneem.route({
    to : serviceName,
    anuvadak: {
        write : {
            xml : {
                ignoreAttributes : true
            }
        }
    }
});
```

or from mapping file

```yaml
- route:
    to: serviceName
    anuvadak:
        write:
            xml:
                ignoreAttributes : true
```

When global and route level both options are present then route level options are used for parsing.

### URL encoded Forms
it allows you to read URL encoded form data from request URL as js object.

```js
const muneem = require('muneem')();
const anuvadak = require('anuvadak');
//muneem.use(anuvadak.urlForm); //https://www.npmjs.com/package/qs
muneem.use(anuvadak.urlEncodedForm);

function requestHandler(asked, answer){
    //var requestObject =  asked.readUrlForm(options);
    asked.readUrlForm(options);
    var requestObject = asked.body;
    //..
}
```

### Form
it allows you to read form data (including files) from request body.

```js
const muneem = require('muneem')();
const anuvadak = require('anuvadak');
var globalOptions = {
    encoding : 'utf-8',
    file : {
        uploadTo : os.tmpdir(),  //temp upload.
        saveTo : "", // target folder
        keepExtensions : true,
        maxSize : 1024 * 1024, //1 MB
        hash : false,
        on : {
            name : (fileName) => {},//It'll emit to get fileName before moving to saveTo
            duplicate : (field, file, filePath) => {//It'll emit if saveTo is set but another file with same name exist.
            move : () => {}, //it'll not emit if saveTo is set and after the file has been moved or failed to move.
            receive : (name, file) => {}, //it'll not emit if saveTo is set.
            found : (name, file) => {}, //It'll emit when a file field is found in request
        }
    },
    field : {
        maxSize : 200 * 1024, // 200 KB
        maxCount : 20,
        on : {
            receive : () => {},
        },
    },
    on : {
        error : (err) => {},
        end : () => {},
        aborted : () => {}
    }
}
muneem.use(anuvadak.form, globalOptions); 

function requestHandler(asked, answer){
    var options = {
        saveTo : "profilePics" //Paths can be absolute or relative to the path given in global options
    }
    //var requestObject =  await asked.readForm(options);
    await asked.readForm(options);
    var requestObject = asked.body; //use as requestObject.fiekdName
    //..
}
```

Though you can read files, it's good to read it mixed forms or the forms with non-file fields only. To read the forms with files field only, use `readFiles`. If you want to handle the form yourself, you can get the instance of form handler which is ready with the configuration you've provided.

```js
function requestHandler(asked, answer){
    var formHandler = asked.getFormHandle(options);

    formHandler.on("field", function(name, value) {
        //..
    });

    formHandler.on("file", function(name, file) {
        //..
    });

    formHandler.read();

    var requestObject = asked.body; //use as requestObject.fiekdName
    //..
}
```


This uses [formidable](https://github.com/felixge/node-formidable) underneath.


### Files
it allows you to read only files from request stream.

```js
const muneem = require('muneem')();
const anuvadak = require('anuvadak');
var globalOptions = {
    encoding : 'utf-8',
    sync : false,
    uploadTo : os.tmpdir(),  //temp upload.
    saveTo : "", // target folder
    keepExtensions : true,
    maxSize : 1024 * 1024, //1 MB
    hash : false,
    on : {
        name : (fileName) => {},//It'll emit to get fileName before moving to saveTo
        duplicate : (field, file, filePath) => {//It'll emit if saveTo is set but another file with same name exist.
        move : () => {}, //it'll not emit if saveTo is set and after the file has been moved or failed to move.
        receive : (name, file) => {}, //it'll not emit if saveTo is set.
        found : (name, file) => {}, //It'll emit when a file field is found in request
        error : (err) => {},
        end : () => {},
        aborted : () => {}
    }
}
muneem.use(anuvadak.form, globalOptions); 

function fileRequestHandlerSync(asked, answer){
    var options = {
        saveTo : "profilePics" //Paths can be absolute or relative to the path given in global options
    }
    //var requestObject =  await asked.readForm(options);
    await asked.readFiles({
        sync : true
    });
    var requestObject = asked.body; //use as requestObject.fieldName
    //..
}

function fileRequestHandler(asked, answer){
    var options = {
        saveTo : "profilePics" //Paths can be absolute or relative to the path given in global options
    }
    asked.readFiles(options);
    //..
}
```

Though you can read files, it's good to read it mixed forms or the forms with non-file fields only. To read the forms with files field only, use `readFiles`

This uses [formidable](https://github.com/felixge/node-formidable) underneath.