const countries = require("countryjs");
const {validateRequiredField, copyValueToObjectIfDefined} = require("./objectHelper");

const throwExceptionIfProvinceDoesNotBelongToCountry = (country, province) => {
    var states = countries.states(country);
    if(states && states.length > 0) {
        var upperCaseStates = states.map(function(x) {
                                            return x.toUpperCase();
                                        });
        var index = upperCaseStates.indexOf(province.toUpperCase());
        if(index === -1) {
            throw new Error("invalid province for selected country");
        }
    }
};

const throwExceptionIfCountryIsDefinedButNotProvince = (country, province) => {
    if(typeof country !== "undefined" && typeof province === "undefined"){
        throw new Error("Province field is mandatory");
    }
};

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

  var selectedCountry = args.address.country.value;
  args.address.country = selectedCountry;
  throwExceptionIfProvinceDoesNotBelongToCountry(selectedCountry, args.address.province);
  return args.address;
};

function updateExistingAddress(args){
    var updateAddressData = {
        streetAddress: copyValueToObjectIfDefined(args.address.streetAddress),
        city: copyValueToObjectIfDefined(args.address.city),
        postalCode: copyValueToObjectIfDefined(args.address.postalCode)
    };
    if (typeof args.address.country !== "undefined"){
        var selectedCountry = args.address.country.value;
        throwExceptionIfCountryIsDefinedButNotProvince(selectedCountry, args.address.province);
        throwExceptionIfProvinceDoesNotBelongToCountry(selectedCountry, args.address.province);
        updateAddressData.country = selectedCountry;
        updateAddressData.province = args.address.province;
    }
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