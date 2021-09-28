var db = firebase.firestore(); //Declare firebase
var file_property = []; //File property for file handling

function displayRecord() {
    record_container = document.getElementById("contact-table-body");
    record_count = 0;
    loader = document.getElementById("loader");

    // Record array
    two_dimension_record_array = [];
    record_array = [];


    // Retrieve Data from the database
    firebase.database().ref("contact_details").once("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {

            // Insert record into the array
            record_array.push(childSnapshot.val().Date);
            record_array.push(childSnapshot.val().FirstName);
            record_array.push(childSnapshot.val().LastName);
            record_array.push(childSnapshot.val().Email);
            record_array.push(childSnapshot.val().Message);

            // Insert record into the 2d array
            two_dimension_record_array.push(record_array);

            // Clear the 1d array
            record_array = [];

            // Add record count
            record_count++;
        });
    }).then(function() {

        if (record_count === 0) {
            // Remove loader
            document.getElementById("loader").style.display = "none";

            // Display No Record Message
            record_container.innerHTML = record_container.innerHTML +
                "<tr>" +
                "<td class='text-danger'>No Record Found!</td>" +
                "<td></td>" +
                "<td></td>" +
                "<td></td>" +
                "<td></td>" +
                "</tr>";
        } else {
            // Reverse the array to show the latest record
            two_dimension_record_array.reverse();

            // Print record
            for (row = 0; row < two_dimension_record_array.length; row++) {
                record_container.innerHTML = record_container.innerHTML +
                    "<tr>" +
                    "<td>" + two_dimension_record_array[row][0] + "</td>" +
                    "<td>" + two_dimension_record_array[row][1] + "</td>" +
                    "<td>" + two_dimension_record_array[row][2] + "</td>" +
                    "<td>" + two_dimension_record_array[row][3] + "</td>" +
                    "<td>" + two_dimension_record_array[row][4] + "</td>" +
                    "</tr>";
            }

            // Remove loader
            document.getElementById("loader").style.display = "none";
        }

    });
}

function actionAlertDisplay(){
    
    var action_query = window.location.href.split("?")[1];

    //Alert
    var member_deleted_alert = document.getElementById("member-deleted-alert");
    var member_edited_alert = document.getElementById("member-edited-alert");
    var member_added_alert= document.getElementById("member-added-alert");
    var event_deleted_alert = document.getElementById("event-deleted-alert");
    var event_edited_alert = document.getElementById("event-edited-alert");
    var event_added_alert= document.getElementById("event-added-alert");

    if(action_query == "member-deleted"){

        //Display alert
        member_deleted_alert.style.display = "";
    }
    else if(action_query == "member-edited"){

        //Display alert
        member_edited_alert.style.display = "";
    }
    else if(action_query == "member-added"){
        
        //Display alert
        member_added_alert.style.display = "";
    }
    else if(action_query == "event-deleted"){

        //Display alert
        event_deleted_alert.style.display = "";
    }
    else if(action_query == "event-edited"){

        //Display alert
        event_edited_alert.style.display = "";
    }
    else if(action_query == "event-added"){
        
        //Display alert
        event_added_alert.style.display = "";
    }
    
}

function backstageDateFormatter(timestamp){
    const date = new Date(timestamp);

    var month = new Array();
    month[0] = "Jan";
    month[1] = "Feb";
    month[2] = "Mar";
    month[3] = "Apr";
    month[4] = "May";
    month[5] = "Jun";
    month[6] = "Jul";
    month[7] = "Aug";
    month[8] = "Sep";
    month[9] = "Oct";
    month[10] = "Nov";
    month[11] = "Dec";

    return date.getDate() + " " + month[date.getMonth()] + " " + date.getFullYear() + ", " 
    + time12hoursFormatter(date.getHours()) + ":" + checkTime(date.getMinutes()) + checkAMorPM(date.getHours());
}

function time12hoursFormatter(hours){
    if(hours > 12){
        return hours - 12;
    }
    else{
        return hours;
    }
}

function checkAMorPM(hours){
    if(hours > 12){
        return " PM";
    }
    else{
        return " AM";
    }
}

function timestampToDatetimeLocal(timestamp){
    const date = new Date(timestamp);

    return date.getFullYear() + "-" +  checkTime(date.getMonth() + 1) + "-"  + checkTime(date.getDate())
    + "T" + checkTime(date.getHours()) + ":" + checkTime(date.getMinutes());
}