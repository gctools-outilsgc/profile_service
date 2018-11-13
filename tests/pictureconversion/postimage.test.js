const {processUpload} = require('../../src/resolvers/File-Upload');
const fs = require('fs');
const path = require('path')

describe('upload and convert image', () =>{
  it('must return the image url after',()=>{
    var filepath = path.join(__dirname, `./pics/avatar.jpg`);
    var stream = fs.createReadStream(filepath);
    processUpload(stream, 'avatar.png')
    // .then(({url})=>{
    //   console.error(url)
    // })
    .catch((error)=>{
      console.error(error)
    })
  })
})