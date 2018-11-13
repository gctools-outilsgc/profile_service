const {processUpload} = require('../../src/resolvers/File-Upload');
const fs = require('fs');
const path = require('path')

describe('upload and convert image', async () =>{
  it('must return the image url after',()=>{
    var filepath = path.join(__dirname, `./pics/avatar.jpg`);
    var stream = fs.readFileSync(filepath);
    processUpload({stream, filename:'test'})
    .then(({url}) => {
      console.log(`Url for picture upload : ${url}`);
    })
    .catch(error => console.error(`Error ------ ${error}`))
  })
})