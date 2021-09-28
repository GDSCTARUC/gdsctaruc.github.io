//Code for handling the Event section

function displayEvent() {

    var eventsRef = db.collection("events");
    var event_table_container = document.getElementById("event-table-body");

    eventsRef.orderBy("start", "desc").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
        
            event_table_container.innerHTML = event_table_container.innerHTML + 

            "<tr>" +
            "<td>" + doc.data().title + "</td>" +
            "<td>" + backstageDateFormatter(doc.data().start) + "</td>" +
            "<td>" + backstageDateFormatter(doc.data().end) + "</td>" +
            "<td>" + doc.data().platform +"</td>" +
            "<td>" + doc.data().type + "</td>" +
            "<td>" + doc.data().active + "</td>" +
            "<td> <button class='btn btn-success' onclick='editEvent(" + '"' + doc.id + '"' + ")' data-toggle='modal' data-target='#event-modal'>Edit</button>" +
                "<button class='btn btn-danger' onclick='deleteEvent(" + '"' + doc.id + '"' + ")'>Delete</button>" + 
            "</td>" +
            "</tr>";      
        });

        $("#event-table-body > #loader").remove();
        eventTable = $("#event-table").DataTable({
            order: [
                [5, "desc"],
                [1, "desc"]
            ],
            iDisplayLength: 25,
        });

    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}

function renderEventImage(event){
    var uploaded_img = document.getElementById("event-uploaded-img");
    var reader = new FileReader();
    file_property = event.target.files;

    reader.onload = function (){
        uploaded_img.src = reader.result;
        console.log(file_property[0].name)
    }
    reader.readAsDataURL(file_property[0])
}

function addEvent(){
    var submit_btn = document.getElementById("event-submit-btn");
    //Input value
    var event_id = document.getElementById("event-id");
    var event_title = document.getElementById("event-title");
    var description = document.getElementById("event-description");
    var start_date = document.getElementById("event-start");
    var end_date = document.getElementById("event-end");
    var event_platform = document.getElementById("event-platform");
    var register_url = document.getElementById("register-url");
    var facebook_url = document.getElementById("facebook-url");
    var submit_btn = document.getElementById("event-submit-btn");
    var uploaded_poster = document.getElementById("event-uploaded-img");

    //clear input value
    event_id.value = "Auto Generated";
    event_title.value = "";
    description.value = "";
    start_date.value = "";
    end_date.value = "";
    event_platform.value = "";
    register_url.value = "";
    facebook_url.value = "";
    uploaded_poster.src = "";
    submit_btn.setAttribute("onclick", "submitEvent()");

}

function submitEvent(){
    //Input value
    var event_title = document.getElementById("event-title").value;
    var description = document.getElementById("event-description").value;
    var event_type = document.getElementById("event-type").value;
    var start_date = Date.parse(document.getElementById("event-start").value);
    var end_date = Date.parse(document.getElementById("event-end").value);
    var event_platform = document.getElementById("event-platform").value;
    var register_url = document.getElementById("register-url").value;
    var facebook_url = document.getElementById("facebook-url").value;
    var event_active = document.getElementById("event-active").value;

    //Form processing loader
    var form_process_loader = document.getElementsByClassName("form-process-loader")[1];
    
    if(eventFormValidation()){

        //Display loader
        form_process_loader.style.display = "block";

        //Collection
        var eventsRef = db.collection("events");

        //File handling
        var uploaded_img = document.getElementById("event-poster").files[0].name;
        var file_name = new Date().getTime() + "." + uploaded_img.split(".").pop();

        var eventImagesRef = firebase.storage().ref("images/events/" + file_name);

        //Upload Event Image to cloud storage
        eventImagesRef.put(file_property[0]).then((snapshot) => {
            console.log('Uploaded a blob or file!');

            eventImagesRef.getDownloadURL()
            .then((url) => {
                eventsRef.add({
                    active: event_active,
                    desc: description,
                    end: end_date,
                    fbUrl: facebook_url,
                    platform: event_platform,
                    poster: url,
                    posterName: file_name,
                    regUrl: register_url,
                    start: start_date,
                    title: event_title,
                    type : event_type
                }).then(function(){

                    //Refresh the page after the action
                    window.location.href = "backstage.html?event-added";
                });
            })
            .catch((error) => {
                // Handle any errors
                console.log(error)
            });
        });

    }
}

function editEvent(id){

    //Clear error message
    clearEventFormErrorMessage();

    //Collection
    var eventsRef = db.collection("events").doc(id);

    //Input value
    var event_id = document.getElementById("event-id");
    var event_title = document.getElementById("event-title");
    var description = document.getElementById("event-description");
    var start_date = document.getElementById("event-start");
    var end_date = document.getElementById("event-end");
    var event_platform = document.getElementById("event-platform");
    var register_url = document.getElementById("register-url");
    var facebook_url = document.getElementById("facebook-url");
    var submit_btn = document.getElementById("event-submit-btn");
    var uploaded_poster = document.getElementById("event-uploaded-img");
    var member_profile_link = document.getElementById("event-poster-link-hidden");
    var member_profile_source = document.getElementById("event-poster-source-hidden");


    eventsRef.get().then((doc) => {
        if (doc.exists) {
            console.log("Document data:", doc.data());

            //Insert the value into the input fields
            event_id.value = doc.id;
            event_title.value = doc.data().title;
            uploaded_poster.src = doc.data().poster; 
            member_profile_link.value = doc.data().poster; 
            member_profile_source.value = doc.data().posterName; 
            description.value = doc.data().desc; 
            document.getElementById("event-type-" + doc.data().type).selected = true; //Select event type
            start_date.value = timestampToDatetimeLocal(doc.data().start); //Select start date
            end_date.value = timestampToDatetimeLocal(doc.data().end); //Select end date
            event_platform.value = doc.data().platform;
            register_url.value = doc.data().regUrl;
            facebook_url.value = doc.data().fbUrl;
            document.getElementById("event-active-" + doc.data().active).selected = true; //Select event active
            submit_btn.setAttribute("onclick", "editEventSubmit()");

        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
    
}

function editEventSubmit(){

    //Input value
    var event_id = document.getElementById("event-id").value;
    var event_title = document.getElementById("event-title").value;
    var description = document.getElementById("event-description").value;
    var event_type = document.getElementById("event-type").value;
    var start_date = Date.parse(document.getElementById("event-start").value);
    var end_date = Date.parse(document.getElementById("event-end").value);
    var event_platform = document.getElementById("event-platform").value;
    var register_url = document.getElementById("register-url").value;
    var facebook_url = document.getElementById("facebook-url").value;
    var event_active = document.getElementById("event-active").value;
    var event_poster = document.getElementById("event-poster").value;
    var event_poster_link = document.getElementById("event-poster-link-hidden").value;
    var event_poster_source = document.getElementById("event-poster-source-hidden").value;

    //Form processing loader
    var form_process_loader = document.getElementsByClassName("form-process-loader")[1];

    if(eventFormValidation()){

        //Collection
        var eventsRef = db.collection("events").doc(event_id);

        //Display loader
        form_process_loader.style.display = "block";

        //If file is uploaded
        if(event_poster.trim().length != 0){

            //File handling
            var uploaded_img = document.getElementById("event-poster").files[0].name;
            var file_name = new Date().getTime() + "." + uploaded_img.split(".").pop();
            var eventsImagesRef = firebase.storage().ref("images/events/" + file_name);

            //Upload Memeber Image to cloud storage
            eventsImagesRef.put(file_property[0]).then((snapshot) => {
                console.log('Uploaded a blob or file!');

                //Delete old image
                var deleteTask = firebase.storage().ref("images/events/" + event_poster_source);

                deleteTask.delete().then(() => {
                    // File deleted successfully
                    console.log("File deleted successful!");

                    //edit record
                    eventsImagesRef.getDownloadURL()
                    .then((url) => {
                        eventsRef.set({
                            active: event_active,
                            desc: description,
                            end: end_date,
                            fbUrl: facebook_url,
                            platform: event_platform,
                            poster: url,
                            posterName: file_name,
                            regUrl: register_url,
                            start: start_date,
                            title: event_title,
                            type : event_type
                        }).then(function(){

                            //Refresh the page after the action
                            window.location.href = "backstage.html?event-edited";
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
            //edit record
            eventsRef.set({
                active: event_active,
                desc: description,
                end: end_date,
                fbUrl: facebook_url,
                platform: event_platform,
                poster: event_poster_link,
                posterName: event_poster_source,
                regUrl: register_url,
                start: start_date,
                title: event_title,
                type : event_type
            }).then(function(){
    
                //Refresh the page after the action
                window.location.href = "backstage.html?event-edited";
            });
        }
        
    }
    
}

function deleteEvent(event_id){
    var confirmDelete = confirm("Are you sure you want to delete this event?");
    var delete_alert = document.getElementsByClassName("delete-alert")[1];

    if(confirmDelete){

        //Display delete alert
        delete_alert.style.display = "block";

        //Collection
        var eventsRef = db.collection("events").doc(event_id);
        var source_file = "";

        eventsRef.get().then((doc) => {
            if (doc.exists) {
                source_file = doc.data().posterName;
                var eventImagesRef = firebase.storage().ref("images/events/" + source_file);
                
                //Delete event collection
                eventsRef.delete().then(()=>{

                    //Delete event image
                    eventImagesRef.delete().then(() => {
                        // File deleted successfully
                        console.log("File deleted successful!")

                        //Refresh the page after the action
                        window.location.href = "backstage.html?event-deleted";

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

function eventFormValidation(){
    //Input value
    var title = document.getElementById("event-title").value;
    var description = document.getElementById("event-description").value;
    var event_type = document.getElementById("event-type").value;
    var start = document.getElementById("event-start").value;
    var end = document.getElementById("event-end").value;
    var platform = document.getElementById("event-platform").value;
    var register_url = document.getElementById("register-url").value;
    var facebook_url = document.getElementById("facebook-url").value;
    var event_active = document.getElementById("event-active").value;
    var event_poster = document.getElementById("event-poster").value;
    var event_poster_source = document.getElementById("event-poster-source-hidden").value;
    var error_container = document.getElementsByClassName("error-container-event");
    var error_count = 0;

    //Form validation
    if(title.trim().length == 0){
        error_container[0].innerHTML = "Event title is required!";
        error_container[0].style.display = "block";
        error_count++;
    }
    else{
        error_container[0].style.display = "none";
        error_container[0].innerHTML = "";
    }

    if(description.trim().length == 0){
        error_container[1].innerHTML = "Event description is required!";
        error_container[1].style.display = "block";
        error_count++;
    }
    else{
        error_container[1].style.display = "none";
        error_container[1].innerHTML = "";
    }

    if(event_type.trim().length == 0){
        error_container[2].innerHTML = "Event type is required!";
        error_container[2].style.display = "block";
        error_count++;
    }
    else{
        error_container[2].style.display = "none";
        error_container[2].innerHTML = "";
    }

    if(start.trim().length == 0){
        error_container[3].innerHTML = "Event start date is required!";
        error_container[3].style.display = "block";
        error_count++;
    }
    else{
        error_container[3].style.display = "none";
        error_container[3].innerHTML = "";
    }

    if(end.trim().length == 0){
        error_container[4].innerHTML = "Event end date is required!";
        error_container[4].style.display = "block";
        error_count++;
    }
    else{
        error_container[4].style.display = "none";
        error_container[4].innerHTML = "";
    }

    if(platform.trim().length == 0){
        error_container[5].innerHTML = "Event platform is required!";
        error_container[5].style.display = "block";
        error_count++;
    }
    else{
        error_container[5].style.display = "none";
        error_container[5].innerHTML = "";
    }

    if(register_url.trim().length == 0){
        error_container[6].innerHTML = "Event register url is required!";
        error_container[6].style.display = "block";
        error_count++;
    }
    else{
        error_container[6].style.display = "none";
        error_container[6].innerHTML = "";
    }

    if(facebook_url.trim().length == 0){
        error_container[7].innerHTML = "Event Facebook post url is required!";
        error_container[7].style.display = "block";
        error_count++;
    }
    else{
        error_container[7].style.display = "none";
        error_container[7].innerHTML = "";
    }

    if(event_active.trim().length == 0){
        error_container[8].innerHTML = "Event active is required!";
        error_container[8].style.display = "block";
        error_count++;
    }
    else{
        error_container[8].style.display = "none";
        error_container[8].innerHTML = "";
    }

    if(event_poster.trim().length == 0 && event_poster_source.trim().length == 0){
        error_container[9].innerHTML = "Event poster is required!";
        error_container[9].style.display = "block";
        error_count++;
    }
    else{
        error_container[9].style.display = "none";
        error_container[9].innerHTML = "";
    }

    //If the form is valid
    if(error_count == 0){
        return true;
    }
    else{
        return false;
    }
}

function clearEventFormErrorMessage(){
    var error_container = document.getElementsByClassName("error-container-event");

    for(var i = 0; i < error_container.length; i++){
        error_container[i].style.display = "none";
    }
}

function createGoogleCalendarEvent(){
    
    if(eventFormValidation()){

        //Input value
        var event_title = document.getElementById("event-title").value;
        var event_description = document.getElementById("event-description").value;
        var start_date = document.getElementById("event-start").value;
        var end_date = document.getElementById("event-end").value;
        var event_platform = document.getElementById("event-platform").value;

        var event = {
        'summary': event_title,
        'location': event_platform,
        'description': event_description,
        'start': {
            'dateTime': start_date + ":00",
            'timeZone': "Asia/Kuala_Lumpur"
        },
        'end': {
            'dateTime': end_date + ":00",
            'timeZone': "Asia/Kuala_Lumpur"
        },
        'attendees': [
            {"email" : "gdsc.taruc@gmail.com"}
        ],
        'reminders': {
            'useDefault': false,
            'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10}
            ]
        }
        };
        
        //Get Google User Profile
        var profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
        var organizer_email = profile.getEmail();

        var request = gapi.client.calendar.events.insert({
            'calendarId': organizer_email,
            'resource': event,
        });
    
        request.execute(function (event) {
            appendPre('This event is created in your Google Calendar with the link: ' + event.htmlLink);
        });

        gapi.auth2.getAuthInstance().signOut();
    }
    
}