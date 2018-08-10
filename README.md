# anuvadak
Add basic serialization methods to Muneem framework


## How to use

```js
const muneem = require('muneem')();
const anuvadak = require('anuvadak')(muneem);
```

Following methods can be used with `answer` object in a handler;

* writeText(data[, type[, length[, safe[, append] ] ] ] )
* writeBuffer(data[, type[, length[, safe[, append] ] ] ] )
* writeStream(data[, type[, length[, safe[, append] ] ] ] )
* writeXml(data[, type[, length[, safe] ] ])
* writeJson(data[, type[, length[, safe] ] ])

if **safe** is set to true then and answer.data is already present then new data will not be set.
if **append** is set to true and **safe** is set to false then new data will be appended or streamed to old data.

### XML

we use [fast-xml-parser]() to parse JS object to XML. If you want to overwrite options, you can set them either globally or at route level.

**Global**

```js
const anuvadak = require('anuvadak')(muneem, {
    write : {
        xml : {
            ignoreAttributes : true
        }
    }
});
```


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