const copyValueToObjectIfDefined = (originalValue) => {
  if(originalValue !== null && typeof originalValue !== "undefined"){
      return originalValue;
  }
};

const propertyRequired = (args, property) => {
  let value = args[property];
  if(args[property] === null || typeof value === "undefined"){
      return `${property} is not defined and is a required field`;
  }
};

const propertyExists = (args, property) => {
  let value = args[property];
  if(args[property] === null || typeof value === "undefined"){
      return false;
  }  
  return true;  
};

function removeNullKeys(object){
  Object.keys(object).forEach((key) => {
    if (!object[key]){
      delete object[key];
      return;
    }
    if (object[key] === Object(object[key])){
      removeNullKeys(object[key]);
      if(Object.entries(object[key]).length === 0){
        delete object[key];
        return;
      }
    }

  });
  return object;
}

function cloneObject(object){
  return JSON.parse(JSON.stringify(object));
}

module.exports = {
  copyValueToObjectIfDefined,
  propertyRequired,
  propertyExists,
  removeNullKeys,
  cloneObject
};
