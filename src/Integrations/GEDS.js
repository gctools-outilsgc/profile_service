const request = require("request");
const config = require("../config");

const englishAPI = (email) => {
  return new Promise((resolve, reject) => {
    request({
      headers: { 'Content-Type': 'application/json' },
      url: 'https://api.geds-sage.gc.ca',
      method: "POST",
      body: JSON.stringify({
        requestID: 'S02',
        authorizationID: config.integration.geds,
        requestSettings: {
          searchValue: email,
          searchField: 7,
          searchCriterion: 0,
        },
      })
    }, function optionalCallback(err, httpResponse, body) {
      var data = JSON.parse(body);
      if(data.returnCode == "-1") {
        resolve({
          error: "Not Authorized"
        });
      } else if(data.requestResults.personList){
        resolve(data.requestResults.personList[0]);
      } else {
        resolve({
          error: "User not found"
        });
      }
    });
  })
}

const frenchAPI = (email) => {
  return new Promise((resolve, reject) => {
    request({
      headers: { 'Content-Type': 'application/json' },
      url: 'https://api.geds-sage.gc.ca/fr/GAPI/',
      method: "POST",
      body: JSON.stringify({
        requestID: 'S02',
        authorizationID: config.integration.geds,
        requestSettings: {
          searchValue: email,
          searchField: 7,
          searchCriterion: 0,
        },
      })
    }, function optionalCallback(err, httpResponse, body) {
      var data = JSON.parse(body);
      if(data.returnCode == "-1") {
        resolve({
          error: "Not Authorized"
        });
      } else if(data.requestResults.personList){
        resolve(data.requestResults.personList[0]);
      } else {
        resolve({
          error: "User not found"
        });
      }
    });
  })
}

const getGEDSInfo = async (email) => {
  const engData = await englishAPI(email);
  const frData = await frenchAPI(email);

  return {
    en: engData,
    fr: frData
  };
}

module.exports = {
  getGEDSInfo
}