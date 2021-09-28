//Code for handling the Member section
function displayMember() {

    var membersRef = db.collection("members");
    var member_table_container = document.getElementById("member-table-body");

    membersRef.orderBy("priority").get().then((querySnapshot) => {

        querySnapshot.forEach((doc) => {

            member_table_container.innerHTML = member_table_container.innerHTML + 

            "<tr>" +
            "<td>" + doc.id + "</td>" +
            "<td>" + doc.data().name + "</td>" +
            "<td>" + doc.data().position + "</td>" +
            "<td> <img class='form-avatar' src='" +doc.data().picture + "'/></td>" +
            "<td>" + doc.data().priority + "</td>" +
            "<td>" + doc.data().active + "</td>" +
            "<td> <button class='btn btn-success' onclick='editMember(" + '"' + doc.id + '"' + ")' data-toggle='modal' data-target='#memberModal'>Edit</button>" +
                "<button class='btn btn-danger' onclick='deleteMember(" + '"' + doc.id + '"' + ")'>Delete</button>" + 
            "</td>" +
            "</tr>";
        });

        $("#member-table-body > #loader").remove();
        memberTable = $("#member-table").DataTable({
            order: [
                [6, "desc"],
                [4, "asc"]
            ],
            columnDefs: [
                { orderable: false, targets: [3, 5, 6] }
            ],
            iDisplayLength: 25,
        });
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}

function renderMemberImage(event){
    var uploaded_img = document.getElementById("member-uploaded-img");
    var reader = new FileReader();
    file_property = event.target.files;

    reader.onload = function (){
        uploaded_img.src = reader.result;
        console.log(file_property[0].name)
    }
    reader.readAsDataURL(file_property[0])
}

function addMember(){
    var submit_btn = document.getElementById("member-submit-btn");
    var uploaded_img = document.getElementById("member-uploaded-img");
    var member_id = document.getElementById("member-id");
    var member_name = document.getElementById("member-name");

    //Clear input field
    uploaded_img.src = "";
    member_id.value = "Auto Generated";
    member_name.value = "";
    submit_btn.setAttribute("onclick", "submitMember()");
}

function submitMember(){
    //Input value
    var member_name = document.getElementById("member-name").value;
    var member_position = document.getElementById("member-position").value;
    var member_priority = parseInt(document.getElementById("member-priority").value);
    var member_active = (document.getElementById("member-active").value === "true");

    //Form processing loader
    var form_process_loader = document.getElementsByClassName("form-process-loader")[0];


    //If the inputs are valid
    if(memberFormValidation()){

        //Display loader
        form_process_loader.style.display = "block";

        //File handling
        var uploaded_img = document.getElementById("member-picture").files[0].name;
        var file_name = new Date().getTime() + "." + uploaded_img.split(".").pop();

        //Collection
        var membersRef = db.collection("members");
        var memberImagesRef = firebase.storage().ref("images/members/" + file_name);

        //Upload Memeber Image to cloud storage
        memberImagesRef.put(file_property[0]).then((snapshot) => {
            console.log('Uploaded a blob or file!');

            memberImagesRef.getDownloadURL()
            .then((url) => {
                membersRef.add({
                    active: member_active,
                    name: member_name,
                    position : member_position,
                    priority:  member_priority,
                    picture: url,
                    pictureName:  file_name
                }).then(function(){

                    //Refresh the page after the action
                    window.location.href = "backstage.html?member-added";
                });
            })
            .catch((error) => {
                // Handle any errors
                console.log(error)
            });
        });
    }
}

function editMember(id){

    //Clear error message
    clearMemberFormErrorMessage();

    //Collection
    var membersRef = db.collection("members").doc(id);

    //Input fields
    var member_id = document.getElementById("member-id");
    var member_name = document.getElementById("member-name");
    var uploaded_img = document.getElementById("member-uploaded-img");
    var submit_btn = document.getElementById("member-submit-btn");
    var member_profile_link = document.getElementById("member-profile-link-hidden");
    var member_profile_source = document.getElementById("member-profile-source-hidden");

    membersRef.get().then((doc) => {
        if (doc.exists) {
            console.log("Document data:", doc.data());

            //Insert the value into the input fields
            member_id.value = doc.id;
            member_name.value = doc.data().name;
            document.getElementById(doc.data().position).selected = true; //Select position
            document.getElementById("priority-" + doc.data().priority).selected = true; //Select user priority
            document.getElementById("member-active-" + doc.data().active).selected = true; //Select user active
            uploaded_img.src = doc.data().picture; //Show profile picture
            member_profile_link.value = doc.data().picture; //Insert profile link to the hidden input field
            member_profile_source.value = doc.data().pictureName; //Insert profile source to the hidden input field
            submit_btn.setAttribute("onclick", "editMemberSubmit()");

        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
    
}

function memberFormValidation(){
    //Input value
    var member_name = document.getElementById("member-name").value;
    var member_position = document.getElementById("member-position").value;
    var member_priority = document.getElementById("member-priority").value;
    var member_profile = document.getElementById("member-picture").value;
    var member_profile_source = document.getElementById("member-profile-source-hidden").value;
    var error_container = document.getElementsByClassName("error-container");
    var error_count = 0;

    //Validation
    if(member_name.trim().length == 0){
        error_container[0].innerHTML = "Member name is required!";
        error_container[0].style.display = "block";
        error_count++;
    }
    else{
        error_container[0].innerHTML = "";
        error_container[0].style.display = "none";
    }

    if(member_position.trim().length == 0){
        error_container[1].innerHTML = "Member position is required!";
        error_container[1].style.display = "block";
        error_count++;
    }
    else{
        error_container[1].style.display = "none";
        error_container[1].innerHTML = "";
    }

    if(member_profile.trim().length == 0 && member_profile_source.trim().length == 0){
        error_container[2].innerHTML = "Member profile is required!";
        error_container[2].style.display = "block";
        error_count++;
    }
    else{
        error_container[2].style.display = "none";
        error_container[2].innerHTML = "";
    }

    if(member_priority.trim().length == 0){
        error_container[3].innerHTML = "Member priority is required!";
        error_container[3].style.display = "block";
        error_count++;
    }
    else{
        error_container[3].style.display = "block";
        error_container[3].innerHTML = "";
    }

    //If the inputs are valid
    if(error_count == 0){
        return true;
    }
    else{
        return false;
    }
}

function clearMemberFormErrorMessage(){
    var error_container = document.getElementsByClassName("error-container");

    for(var i = 0; i < error_container.length; i++){
        error_container[i].style.display = "none";
    }
}

function editMemberSubmit(){
    //Input value
    var member_id = document.getElementById("member-id").value;
    var member_name = document.getElementById("member-name").value;
    var member_position = document.getElementById("member-position").value;
    var member_priority = parseInt(document.getElementById("member-priority").value);
    var member_active = (document.getElementById("member-active").value === "true");
    var member_profile_link = document.getElementById("member-profile-link-hidden").value;
    var member_profile_source = document.getElementById("member-profile-source-hidden").value;

    //Form processing loader
    var form_process_loader = document.getElementsByClassName("form-process-loader")[0];

    //If the inputs are valid
    if(memberFormValidation()){

        //Display loader
        form_process_loader.style.display = "block";

        //Collection
        var membersRef = db.collection("members").doc(member_id);

        //If file is uploaded
        if(document.getElementById("member-picture").value.trim().length != 0){
            //File handling
            var uploaded_img = document.getElementById("member-picture").files[0].name;
            var file_name = new Date().getTime() + "." + uploaded_img.split(".").pop();
            var memberImagesRef = firebase.storage().ref("images/members/" + file_name);

            //Upload Memeber Image to cloud storage
            memberImagesRef.put(file_property[0]).then((snapshot) => {
                console.log('Uploaded a blob or file!');

                //Delete old image
                var deleteTask = firebase.storage().ref("images/members/" + member_profile_source);

                deleteTask.delete().then(() => {
                    // File deleted successfully
                    console.log("File deleted successful!");

                    //Insert new record
                    memberImagesRef.getDownloadURL()
                    .then((url) => {
                        membersRef.set({
                            active: member_active,
                            name: member_name,
                            position : member_position,
                            priority:  member_priority,
                            picture: url,
                            pictureName:  file_name
                        }).then(function(){

                            //Refresh the page after the action
                            window.location.href = "backstage.html?member-edited";
                        });
                    })
                    .catch((error) => {
                        // Handle any errors
                        console.log(error)
                    });
                }).catch((error) => {
                    // Uh-oh, an error occurred!
                    console.log(error)
                });
        
            });
        }
        else{
            membersRef.set({
                active: member_active,
                name: member_name,
                position : member_position,
                priority:  member_priority,
                picture: member_profile_link,
                pictureName:  member_profile_source
            }).then(function(){
                console.log("Profile Updated!")

                //Refresh the page after the action
                window.location.href = "backstage.html?member-edited";
            });
        }
    }
}

function deleteMember(member_id){
    var confirmDelete = confirm("Are you sure you want to delete this member?");
    var delete_alert = document.getElementsByClassName("delete-alert")[0];

    if(confirmDelete){

        //Display delete alert
        delete_alert.style.display = "block";

        //Collection
        var membersRef = db.collection("members").doc(member_id);
        var source_file = "";

        membersRef.get().then((doc) => {
            if (doc.exists) {
                source_file = doc.data().pictureName;
                var memberImagesRef = firebase.storage().ref("images/members/" + source_file);
                
                //Delete member collection
                membersRef.delete().then(()=>{

                    //Delete member image
                    memberImagesRef.delete().then(() => {
                        // File deleted successfully
                        console.log("File deleted successful!")

                        //Refresh the page after the action
                        window.location.href = "backstage.html?member-deleted";

                    }).catch((error) => {
                        // Uh-oh, an error occurred!
                        console.log(error)
                    });

                }).catch((error)=>{
                    console.error("Error removing document: ", error);
                });
    
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    }
}