
async function generateOnlineTemplate(template, to, from) {

    const onlineTemplate = {
        Team: {
            submitter: {
                toUser: from.gcID,
                fromUser: from.gcID,
                titleEn: "Team Transfer",
                titleFr: "Transfert d'équipe",
                descriptionEn: `Your request to transfer a team to ${to.name} has been created`,
                descriptionFr: `Votre demande de transferer une equipe à ${to.name} a été créée`,
                email: from.email,
                actionLevel: "NoUserAction",
                emailSubject: `Team Transfer | Transfert d'équipe`,
                emailBodyEn: `Your request to transfer a team to ${to.name} has been created`,
                emailBodyFr: `Votre demande de transferer une equipe à ${to.name} a été créée`,
            },
            approver: {
                toUser: to.gcID,
                fromUser: from.gcID,
                titleEn: `Team Transfer from ${from.name}`,
                titleFr: `Demande de transfert d'équipe de ${from.name}`,
                descriptionEn: `${from.name} is requesting to transfer you a team.  Please approve or deny this request`,
                descriptionFr: `${from.name} demande de vous transférer une équipe. Veuillez approuver ou refuser cette demande`,
                actionLevel: "UserActionRequired",
                email: to.email,
                emailSubject: `Team Transfer from ${from.name} | Demande de transfert d'équipe de ${from.name}`,
                emailBodyEn: `${from.name} is requesting to transfer a team to you.  Please approve or deny this request.`,
                emailBodyFr: `${from.name} demande de vous transférer une équipe. Veuillez approuver ou refuser cette demande.`,
            }
        },
        Informational: {
            submitter: {
                toUser: from.gcID,
                fromUser: from.gcID,
                titleEn: "Change Information",
                titleFr: "Changement d'information",
                descriptionEn: `Your request to change your profile information has been submitted to ${to.name} for approval.`,
                descriptionFr: `Votre demande de modification des informations de votre profil a été soumise à ${to.name} pour l'approbation.`,
                actionLevel: "NoUserAction",
                email: from.email,
                emailSubject: `Information Change | Changement d'information`,
                emailBodyEn: `Your request to change your profile has been submitted to ${to.name} for approval.`,
                emailBodyFr: `Votre demande pour modifier votre profil a été soumise à ${to.name} pour approbation.`,
            },
            approver: {
                toUser: to.gcID,
                fromUser: from.gcID,
                titleEn: "Reporting User Profile Change",
                titleFr: "Signaler un changement de profil d'utilisateur",
                descriptionEn: `${from.name} is requesting your approval for information changed in their profile.`,
                descriptionFr: `${from.name} demande votre approbation pour les informations modifiées dans leur profil.`,
                actionLevel: "UserActionRequired",
                email: to.email,
                emailSubject: "Request to Approve User Profile Change | Demande d'approbation du changement de profil d'utilisateur",
                emailBodyEn: `${from.name} is requesting your approval to modify their profile.`,
                emailBodyFr: `${from.name} demande votre approbation pour modifier leur profil.`,
            }
        },
        Membership: {
            submitter: {
                toUser: from.gcID,
                fromUser: from.gcID,
                titleEn: "Supervisor Identification",
                titleFr: "Identification du superviseur",
                descriptionEn: `Your request to identify ${to.name}'s as your supervisor has been created`,
                descriptionFr: `Votre demande d'identifié ${to.name} comme votre superviseur a été créée`,
                actionLevel: "NoUserAction",
                email: from.email,
                emailSubject: `Supervisor Identification | Identification du superviseur`,
                emailBodyEn: `Your request to identify ${to.name} as your supervisor has been created`,
                emailBodyFr: `Votre demande d'identifier ${to.name} comme votre superviseur a été créée.`,
            },
            approver: {
                toUser: to.gcID,
                fromUser: from.gcID,
                titleEn: `Request from ${from.name}`,
                titleFr: `Demande de ${from.name}`,
                descriptionEn: `${from.name} has identified you as their supervisor.  Please approve or deny this request`,
                descriptionFr: `${from.name} vous a identifié comme leur superviseur. Veuillez svp approuver ou refuser cette demande`,
                actionLevel: "UserActionRequired",
                email: to.email,
                emailSubject: `${from.name} has identified you as their supervisor | ${from.name} vous a identifié comme leur superviseur`,
                emailBodyEn: `${from.name} has identified you as their supervisor.  Please approve or deny this request`,
                emailBodyFr: `${from.name} vous a identifié comme leur superviseur. Veuillez s.v.p. approuver ou refuser cette demande`,
            }
        }
    };

    return onlineTemplate[template];

}

module.exports = {
    generateOnlineTemplate,
};