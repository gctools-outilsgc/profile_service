const {validateRequiredField, copyValueToObjectIfDefined} = require("./objectHelper");

const getNewAddressFromArgs = (args) => {
  if (typeof args.address === "undefined") {
      return null;
  }

  var errors = [
      validateRequiredField(args.address, "streetAddress"),
      validateRequiredField(args.address, "city"),
      validateRequiredField(args.address, "postalCode"),
      validateRequiredField(args.address, "country"),
      validateRequiredField(args.address, "province"),
  ];
  errors = errors.filter(function (el) {
      return el !== null && typeof el !== "undefined" && el !== "";
    });
  if (errors.length > 0) {
      throw new Error(errors);
  }

    return args.address;
};

function updateExistingAddress(args){
    var updateAddressData = {
        streetAddress: copyValueToObjectIfDefined(args.address.streetAddress),
        city: copyValueToObjectIfDefined(args.address.city),
        postalCode: copyValueToObjectIfDefined(args.address.postalCode),
        province: copyValueToObjectIfDefined(args.address.province),
        country: copyValueToObjectIfDefined(args.address.country)
    };
    return { update: updateAddressData };
}


function updateOrCreateAddressOnProfile(args, profile){
    if(typeof args.address !== "undefined"){
        if (profile.address.id !== null){
            return updateExistingAddress(args);
        }
        var newAddress = getNewAddressFromArgs(args);
        if(newAddress != null) {
            return { create:newAddress };
        }
    }
}

module.exports ={
  getNewAddressFromArgs,
  updateOrCreateAddressOnProfile
};