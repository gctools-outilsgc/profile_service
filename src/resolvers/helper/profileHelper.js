const {propertyRequired} = require("./objectHelper");
const { UserInputError } = require("apollo-server");

const throwExceptionIfProfileIsNotDefined = (profile) => {
    if (profile === null || typeof profile === "undefined"){
        throw new UserInputError("Profile does not exist");
    }
};

async function getTeams(userID, context){
  return await context.prisma.query.profile({where:{gcID: userID}}, "{ownerOfTeams{id, members{gcID}}}");
}

async function changeTeamOrg(teams, context, newOrgID){
  for (let t = 0; t < teams.ownerOfTeams.length; t++){
    await context.prisma.mutation.updateTeam(
      {
        where: {
          id: teams.ownerOfTeams[0].id
        },
        data: {
          organization:{
            connect:{
              id: newOrgID.organization.id
           }
          }
        }
      });
  }
}

async function changeOwnedTeamsRoot(userID, newTeamID, context){
  const newOrgID = await context.prisma.query.team({where:{id: newTeamID}}, "{organization{id}}");
  const oldOrgID = await context.prisma.query.profile({where:{gcID: userID}}, "{team{organization{id}}}");

  if (newOrgID.organization.id === oldOrgID.team.organization.id){
    return;
  }

  const teams = await getTeams(userID, context);
  const members = teams.ownerOfTeams.members;


  for (let t = 0; t < teams.ownerOfTeams.length; t++){
    await context.prisma.mutation.updateTeam(
      {
        where: {
          id: teams.ownerOfTeams[0].id
        },
        data: {
          organization:{
            connect:{
              id: newOrgID.organization.id
           }
          }
        }
      });
  }
  
}

module.exports ={
  throwExceptionIfProfileIsNotDefined,
  changeOwnedTeamsRoot
};