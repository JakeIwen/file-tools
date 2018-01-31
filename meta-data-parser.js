
var fs = require('fs-extra');

const DIRECTORY = '../slumberland/furniture/departments'
const TAG_NAMES = ["title", "description", "keywords"]
const WRITE_FILE_NAME = "result.txt"

const meta = (tg) => `<meta name="${tg}" content="`

Array.prototype.flatten = function() {
  let arr = this
  while (arr.find(el => Array.isArray(el))) arr = Array.prototype.concat(...arr)
  return arr
}


const stream = fs.createWriteStream(WRITE_FILE_NAME);
stream.once('open', (fd) =>
  writeFile(DIRECTORY, getDataRow, stream, TAG_NAMES, (err)=>console.log(err)))


function getDataRow(fileName, content, tagNames) {
  if (content.includes(meta(tagNames[1]))) {
    return fileName
      .split('/')
      .slice(-1) //filename
      .concat(tagNames.map(tag => content
        .split(meta(tag))[1]
        .split('">')[0] //content attribute value
      ))
  }
}

function writeFile(dirName, onFileContent, stream, tagNames, onError) {
  let fileNames = getFiles(dirName).flatten()
  fileNames.forEach( (filename, i) => {
    fs.readFile(filename, 'utf-8', (err, content) => {
      if (err) return onError(err, filename)
      let row = onFileContent(filename, content, tagNames)
      row && stream.write(row.join('\t') + '\n') //delimiters
      i===fileNames.length-1 && stream.end()
    });
  });
}

function getFiles(dir) {
    // get all 'files' in this directory
    var all = fs.readdirSync(dir);
    // process each checking directories and saving files
    return all.map(file => {
        // am I a directory?
        if (fs.statSync(`${dir}/${file}`).isDirectory()) {
            // recursively scan me for my files
            return getFiles(`${dir}/${file}`);
        }
        // WARNING! I could be something else here!!!
        return `${dir}/${file}`;     // file name (see warning)
    })
}
