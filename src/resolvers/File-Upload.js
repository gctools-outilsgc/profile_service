const shortid = require('shortid');
const {createWriteStream} = require('fs');
const gm = require('gm');
const im = gm.subClass({imageMagick: true})

const storeUpload = async ({ stream }) => {
  const extension = "jpg";
  const uploadDir = '/convert';
  const id = shortid.generate()
  const path = __dirname + `${uploadDir}/${id}.${extension}`

  return new Promise((resolve, reject) =>
    im(stream)
      .setFormat(`${extension}`)
      .resize(300,300)
      .stream()
      .pipe(createWriteStream(path))
      .on('finish', () => resolve( {id} ))
      .on('error', reject),
  )
}

const processUpload = async upload => {
  const { stream, filename } = await upload
  return { id, path } = await storeUpload({ stream, filename })
}

module.exports = {processUpload}