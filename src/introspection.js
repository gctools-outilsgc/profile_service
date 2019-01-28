const fetch = require('node-fetch');
const id = process.env.client_id;
const secret = process.env.client_secret;
const openidURL = process.env.OPEN_ID_ENDPOINT;

function verifyToken(request){

  var token;

  //see if token provided in request
  if(request.req.headers.hasOwnProperty("authorization")){
    //remove "bearer" from token
    var splitReq = request.req.headers.authorization.split(" ");
    token = splitReq[1];
  } else {
    return;
  }

  //base64 encode client_id:client_secret for authorization
  let auth = id + ':' + secret;
  let base64auth = Buffer.from(auth).toString('base64');

  url = "http://" + openidURL + "/openid/introspect";
  postOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + base64auth
    },
    body: "token=" + token
  };

  fetch(url, postOptions)
  .then(response => response.json())
  .then(data => {
    console.log(data);
    return data;
  })
  .catch(error => {
    console.error('Connection error: ', error.message);
  });

}

module.exports = {
  verifyToken,
}
