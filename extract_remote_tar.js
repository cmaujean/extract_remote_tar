const tar = require('tar');
const http = require('http');
const { Buffer } = require('buffer');
const url = require('url');
const fs = require('fs');

// concatenate the url bits needed to pass to 
// http.get path option
function urlFullPath(urlob) {
  return urlob.pathname + urlob.search + urlob.hash;
}

// Process the arguments
const args = process.argv.slice(2);
var tarURL;
try {
  tarURL = new URL(args[0]);
} catch(e) {
  console.log(e);
}
const outputDir = args[1] ? args[1] : 'tmp/';

// We'll try to recurively make the output directory 
// structure if it doesn't exist
if(!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, {recursive: true});
}

// a WriteStream into tar extract
var strm = tar.x({
  cwd: outputDir,
  strict: true,
  onentry: function(entry) {
    console.log(entry.path);
  }
});

http.get({
  hostname: tarURL.hostname,
  port: tarURL.port,
  path: urlFullPath(tarURL),
  agent: false,
  encoding: null
}, function (response) {
  var data = [];
  response.on('data', function(chunk){
    data.push(chunk);
  }).on('end', function() {
    var buffer = Buffer.concat(data);
    strm.write(buffer);
    strm.end();
  })
})
