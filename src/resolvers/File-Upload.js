const shortid = require('shortid');
const fs = require('fs');
const request = require('request');
const gm = require('gm');
const im = gm.subClass({imageMagick: true});

const convertPicture = async ({ stream }) => {
  const extension = "jpg";
  const uploadDir = '/convert';
  const id = shortid.generate()
  const destinationPath = __dirname + `${uploadDir}/${id}.${extension}`
  return new Promise((resolve, reject) =>
    gm(stream)
      .setFormat(`${extension}`)
      // .resize(300,300)
      // .write(fs.createWriteStream(destinationPath), error =>{
      //     if(error)
      //     {
      //       reject()
      //     }
      //     else{
      //       resolve( {path: destinationPath} )
      //     }
      // })
      // .stream(`${extension}`)
      // .pipe(fs.createWriteStream(destinationPath))
      // .on('finish', () => resolve( {path: destinationPath} ))
      // .on('error', reject)
      .stream(function (err, stdout, stderr) {
        stdout
          .pipe(fs.createWriteStream(destinationPath))
          .on('finish', () => resolve( {path: destinationPath} ))
          .on('error', reject);
      })
  )
}

const postImage = async ({path}) => {
  console.error(path);
  return new Promise((resolve, reject) => {
    var req = request({
      headers: {'Content-Type' : 'image/jpeg'},
      url:     `http://localhost:8007/backend.php`,
      method: "POST"
    }, function optionalCallback (err, httpResponse, body) {
      if (err) {
        console.error('upload failed:', err);
        reject();
      }
      else{
      console.error(`response:${httpResponse.statusCode}, url:${httpResponse.url}, body:${body}`)
      const fileUrl = 'worked';
      resolve({fileUrl})
      }
    });
    var form = req.form();
    form.append('postimage', fs.createReadStream(path))
  });
};

const processUpload = async upload => {
  const { stream, filename } = await upload;
  const { path } = await convertPicture({ stream, filename });
  return  await postImage({path});
}

module.exports = {
  processUpload}