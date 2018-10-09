function getToken(ctx){
    if (ctx.user.accessToken != null){
      return next()
    }
    else {
        token = req.headers.Authorization
        if (token != null){
          ctx.user.accessToken = token
        } else {
          throw new Error('No Access Token provided for protected resource')
        }
    }  
  }

  function checkScopes(ctx){

  }

function checkAccessToken(ctx){
    getToken(ctx)
    fetch(process.env.OPENID_USERENDPOINT, { 
        method: 'post', 
        headers: new Headers({
          'Authorization': ctx.user.accessToken, 
          'Content-Type': 'application/x-www-form-urlencoded'
        }), 
    })
    .then(response => response.json())
    .then(function (extractData) {
        if (response.ok){
            
        } else {
            throw new Error('Could not connect to OpenID Provider')
        }
    })

    

} 


module.exports = {
    checkAccessToken,
    checkScopes,
}