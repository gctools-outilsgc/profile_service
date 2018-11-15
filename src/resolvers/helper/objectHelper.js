const copyValueToObjectIfDefined = (originalValue) =>{
  if(typeof originalValue !== "undefined"){
      return originalValue;
  }
};

const validateRequiredField = (args, property) =>{
  let value = args[property];
  if(args[property] === null || typeof value === "undefined"){
      return `${property} is not defined and is a required field`;
  }
};

module.exports = {
  copyValueToObjectIfDefined,
  validateRequiredField
};
