var db = firebase.firestore(); //Declare firebase

function displayMembers(){
    var membersRef = db.collection("members");
    var teamsContainer = document.getElementById("teams");

    membersRef.orderBy("priority").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            teamsContainer.innerHTML = teamsContainer.innerHTML +
            '<div class="col-sm-6 col-lg-4 col-xl-3 mt-3 mb-3 text-center">'+
                '<img src="' + doc.data().picture + '" alt="" class="team-img"/>'+

                '<div class="team-name">'+
                    doc.data().name +
                '</div>'+

                '<div class="team-position">'+
                    doc.data().position +
                '</div>'+
            '</div>';
            
        });
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}
