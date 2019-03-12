const {propertyExists} = require("./objectHelper");
const { UserInputError } = require("apollo-server");

const throwExceptionIfProfileIsNotDefined = (profile) => {
    if (profile === null || typeof profile === "undefined"){
        throw new UserInputError("Profile does not exist");
    }
};

async function getTeams(userID, context){
  const result = await context.prisma.query.profile({where:{gcID: userID}}, "{ownerOfTeams{id,nameEn, members{gcID}}}");
  return result;
}


// Recursive funtion to cascade and move organizations
async function changeTeamOrg(teams, context, newOrgID){

  for (let t = 0; t < teams.ownerOfTeams.length; t++){
    await context.prisma.mutation.updateTeam(
      {
        where: {
          id: teams.ownerOfTeams[t].id
        },
        data: {
          organization:{
            connect:{
              id: newOrgID.organization.id
           }
          }
        }
      });

    if(teams.ownerOfTeams[t].members.length > 0){
      for(let m=0; m<teams.ownerOfTeams[t].members.length; m++){
        const childTeams = await getTeams(teams.ownerOfTeams[t].members[m].gcID, context);
        if (typeof childTeams !== "undefined" && childTeams !== null){
          await changeTeamOrg(childTeams, context, newOrgID);
        }
      }   
    } 
  }
}

async function changeOwnedTeamsRoot(userID, newTeamID, context){
  const newOrgID = await context.prisma.query.team({where:{id: newTeamID}}, "{organization{id}}");
  const oldOrgID = await context.prisma.query.profile({where:{gcID: userID}}, "{team{organization{id}}}");
  


  if (oldOrgID.team !== null){
    if (newOrgID.organization.id === oldOrgID.team.organization.id){
      return;
    }
  }

  
  const teams = await getTeams(userID, context);
  await changeTeamOrg(teams, context, newOrgID);
  
}

module.exports ={
  throwExceptionIfProfileIsNotDefined,
  changeOwnedTeamsRoot
};