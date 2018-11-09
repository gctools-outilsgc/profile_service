const {convertPicture} = require('./helper')
const {postImage} = require('../../src/resolvers/File-Upload');
const shortid = require('shortid')

describe('upload and convert image', () =>{
  it('must return the image url after',()=>{
    var imagePath = convertPicture('avatar.jpg', 'jpg')
    var imageurl = postImage({id : shortid.generate(), path: imagePath})
  })
})