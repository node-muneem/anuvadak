const writeText = require("./writeText");
const writeStream = require("./writeStream");
const writeBuffer = require("./writeBuffer");

module.exports = (Muneem) => {
    Muneem.addToAnswer("writeText", writeText);
    Muneem.addToAnswer("writeStream", writeStream);
    Muneem.addToAnswer("writeBuffer", writeBuffer);
}