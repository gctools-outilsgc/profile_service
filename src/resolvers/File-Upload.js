const shortid = require('shortid');
const fs = require('fs');
const request = require('request');
const FormData = require('form-data');
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
      .pipe(fs.createWriteStream(path))
      .pipe(postImage(id, path))
      .on('finish', () => resolve( {id} ))
      .on('error', reject),
  )
}

const postImage = (({id, path}) => {
  var formData = new FormData();
  formData.append('postimage', `open('${path}', 'rb')`);
  // {
  //   postimage:{
  //     value:  fs.readFileSync(path),
  //     options: {r
  //       filename: `${id}.jpg`,
  //       contentType: 'image/jpg'
  //     }
  //   }
    // postimage:fs.readFileSync(path)
  // }

  request({
    headers: {'content-type' : 'application/x-www-form-urlencoded'},
    url:     `http://localhost:8007/backend.php`,
    // body:    `postimage=open(${path},'rb')`,
    method: "POST",
    formData
    // form: {postimage: `open('${path}', 'rb')`}
  }, function optionalCallback (err, httpResponse, body) {
    if (err) {
      return console.error('upload failed:', err);
    }
    console.error(`response:${httpResponse.statusCode}, url:${httpResponse.url}, body:${body}`)
  });
});

const processUpload = async upload => {
  const { stream, filename } = await upload
  return { id, path } = await storeUpload({ stream, filename })
}

module.exports = {processUpload, postImage}