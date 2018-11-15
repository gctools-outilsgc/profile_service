const findExistingProfileOrThrowException = async (context, profileId) =>{
    var profileFunc = context.prisma.Profile;
    let profile = await profileFunc(
      {
          where: {
              gcId: profileId
          }            
      });

  if (profile === null || typeof profile === "undefined"){
      throw new Error("Could not find profile with gcId ${args.gcId}");
  }
  return profile;
};

module.exports ={
  findExistingProfileOrThrowException
};