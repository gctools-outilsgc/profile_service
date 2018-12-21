const {validateRequiredField} = require("./objectHelper");

const throwExceptionIfProfileIsNotDefined = (profile) => {
    if (profile === null || typeof profile === "undefined"){
        throw new Error("Could not find profile with gcID ${args.gcID}");
    }
};

const getSupervisorFromArgs = (args) => {
    if (typeof args.supervisor === "undefined") {
        return null;
    }

    var errors = [
    validateRequiredField(args.supervisor, "gcID")
    ];

    errors = errors.filter(function (el) {
        return el !== null && typeof el !== "undefined" && el !== "";
      });

    if (errors.length > 0) {
        throw new Error(errors);
    }
  
      return args.supervisor;
};

module.exports ={
  throwExceptionIfProfileIsNotDefined,
  getSupervisorFromArgs
};