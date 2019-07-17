
async function generateOnlineTemplate(template, to, from){

    const onlineTemplate = {
        Team:{
            submitter:{
                titleEn: "Team Transfer" ,
                titleFr: "Transfert d'équipe" ,
                descriptionEn: `Your request to transfer a team to ${to.name} has been created` ,
                descriptionFr: `Votre demande de transferer une equipe à ${to.name} a été créée`,
                actionLevel: "NoUserAction",
            },
            approver:{
                titleEn: `Team Transfer from ${from.name}` ,
                titleFr: `Demande de transfert d'équipe de ${from.name}`,
                descriptionEn: `${from.name} is requesting to transfer you a team.  Please approve or deny this request`,
                descriptionFr: `${from.name} demande de vous transférer une équipe. Veuillez approuver ou refuser cette demande`,
                actionLevel: "UserActionRequired",
            }

        },
        Informational:{
            submitter:{
                titleEn: "Change Information",
                titleFr: "Changement d'information",
                descriptionEn: `You request to change your profile information has been submitted to ${to.name} for approval.` ,
                descriptionFr: `Votre demande de modification des informations de votre profil a été soumise à ${to.name} pour l'approbation.` ,
                actionLevel: "NoUserAction",
            },
            approver:{
                titleEn: "Reporting User Profile Change" ,
                titleFr: "Signaler un changement de profil d'utilisateur",
                descriptionEn: `${from.name} is requesting your approval for information changed in their profile.` ,
                descriptionFr: `${from.name} demande votre approbation pour les informations modifiées dans leur profil.`,
                actionLevel: "UserActionRequired",
            }

        },
        Membership:{
            submitter:{
                titleEn: "Supervisor Identification" ,
                titleFr: "Identification du superviseur" ,
                descriptionEn: `Your request to identify ${to.name}'s as your supervisor has been created` ,
                descriptionFr: `Votre demande d'identifié ${to.name} comme votre superviseur a été créée`,
                actionLevel: "NoUserAction",
            },
            approver:{
                titleEn: `Request from ${from.name}` ,
                titleFr: `Demande de ${from.name}`,
                descriptionEn: `${from.name} has identified you as their supervisor.  Please approve or deny this request`,
                descriptionFr: `${from.name} vous a identifié comme leur superviseur. Veuillez svp approuver ou refuser cette demande`,
                actionLevel: "UserActionRequired",
            }
        }  
    };

    return onlineTemplate[template];

}