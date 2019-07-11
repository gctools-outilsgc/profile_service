const copyValueToObjectIfDefined = (originalValue) => {
  if(originalValue !== null && typeof originalValue !== "undefined"){
      return originalValue;
  }
};

const propertyRequired = (args, property) => {
  let value = args[property];
  if(args[property] === null || typeof value === "undefined"){
      return `'${property}' is not defined and is a required field`;
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
    (!object.key) ? delete object.key : object.key;
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
