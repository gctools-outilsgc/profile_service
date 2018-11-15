const findExistingProfileOrThrowException = async (context, profileId) =>{
    // var profileFunc = ;
    let profile = await context.prisma.Profile(
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