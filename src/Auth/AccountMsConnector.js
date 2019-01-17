require("dotenv").config();
const fetch = require("node-fetch");


function checkStatus(response){
    if (!response.ok){ // res.status >= 200 && res.status < 300
        throw new Error("Error connecting to Account service: " + response.statusText);
    }
    return response;
}

function getToken(ctx){
    if (typeof ctx.token !== "object"){
        ctx.token = new Object;
    }

    if (ctx.token.key != null){
      return;
    } else {
        if ("authorization" in ctx.req.request.headers){
            ctx.token.key = ctx.req.request.headers.authorization;
        } else {
            throw new Error("No Access Token provided for protected resource");
        }
    }  
}

async function getTokenInfo(ctx){
    await getToken(ctx);
    const url = process.env.OPENID_USERENDPOINT;

    const postOptions = { 
        method: "POST", 
        headers: {
          "Authorization": ctx.token.key, 
        },
    };

    await fetch(url, postOptions)
    .then(checkStatus)
    .then((response) => response.json())
    .then(function(json){
        ctx.token.sub = json["sub"];
    })
    .catch((error) => {
        console.error("Account Connector Error: ", error.message);
    });
}

function checkScopes(ctx){

  }




module.exports = {
    getTokenInfo,
};