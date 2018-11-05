const shortid = require('shortid');

const uploadDir = './Test';

const storeUpload = ({ stream }) => {
  const id = shortid.generate()
  const path = `${uploadDir}/${id}`

  new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(path))
      .on('finish', () => resolve({ id, path }))
      .on('error', reject),
  )
}

const processUpload = async upload => {
  const { stream, filename } = await upload
  const { id } = await storeUpload({ stream, filename })
  return id;
}

module.exports = {processUpload}