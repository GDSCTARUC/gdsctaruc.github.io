function printEvent(){
    var eventssRef = db.collection("events");
    var past_event_container = document.getElementById("past-events-list");
    var upcoming_event_container = document.getElementById("upcoming-events");
    var upcoming_exist = false;
    var stay_tuned = document.getElementById("stay-tuned");

    eventssRef.orderBy("start", "desc").limit(9).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {

            if(isUpcomingEvent(doc.data().end)){
                upcoming_event_container.innerHTML = 
                    '<div class="event-container row" id="about-us">'+
                    '<div class="event-photo col-sm-12 col-md-6 text-center">'+
                        '<img src="' + doc.data().poster +'" alt="">'+
                    '</div>'+
            
                    '<div class="next-event-detail col-sm-12 col-md-6">'+
                        '<h4 class="upc-event-title">Android Study Jam<span class="sup-new">NEW</span></h4>'+
                        '<div class="e-badge-container"><span id="e-badge" class="badge badge-secondary">WORKSHOP</span></div>'+
                        '<p class="font-weight-light">' + doc.data().desc + '</p>'+
                        '<div class="next-event-short-details">'+
                            '<div class="row">'+
                                '<i class="col far fa-calendar-alt short-detail-icon" aria-hidden="true"></i>'+
                                '<span class="col short-detail-text">'+ dateFormatter(doc.data().start) +'</span>'+
                            '</div>'+
                            '<div class="row">'+
                                '<i class="col far fa-clock short-detail-icon"></i>'+
                                '<span class="col short-detail-text">' + dateFormatter(doc.data().start)+ " to " + dateFormatter(doc.data().end) + '</span>'+
                            '</div>'+
                            '<div class="row">'+
                                '<i class="col fas fa-map-marked-alt short-detail-icon"></i>'+
                                '<span class="col short-detail-text">' + doc.data().platform + '</span>'+
                            '</div>'+
                        '</div>'+
                        '<div>'+
                            '<a href="www.facebook.com" class="btn btn-primary">Register Now</a>'+
                        '</div>'+
                    '</div>'+
                '</div>';

                upcoming_exist = true;

                //Count down upcoming Event
                Countdown(doc.data().start);
            }
            else{
                past_event_container.innerHTML = past_event_container.innerHTML +
                '<div class="col-sm-6 col-lg-4 mt-3">' +
                    '<div class="card w-100">' +
                        '<img class="card-img-top" src="' + doc.data().poster + '" alt="' + doc.data().title + ' Poster">' +
                        '<div class="card-body">' +
                            '<h5 class="card-title">' + doc.data().title + '</h5>' +
                            '<p class="card-text">'+ doc.data().desc + '</p>' +
                            '<a href="' + doc.data().fbUrl + '" class="btn btn-primary">Go</a>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }
            
        });

        //Display stay tuned if no upcoming event
        if(!upcoming_exist){
            stay_tuned.style.display = "";
        }
        
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}

function isUpcomingEvent(startTime) {

    var now = new Date().getTime();
    const startDate = new Date(startTime).getTime();

    if(startDate > now){
        return true;
    }
    else{
        return false;
    }
}

function Countdown(startDate) {

    $("#countdown-block").show();

    var countDownDate = new Date(startDate).getTime();

    // Update the count down every 1 second
    var x = setInterval(function() {

        // Get today's date and time
        var now = new Date().getTime();
        
        // Find the distance between now and the count down date
        var distance = countDownDate - now;
        
        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = checkTime(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        var minutes = checkTime(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
        var seconds = checkTime(Math.floor((distance % (1000 * 60)) / 1000));
        
        $("#days").text(days);
        $("#hours").text(hours);
        $("#minutes").text(minutes);
        $("#seconds").text(seconds);
        
        // If the count down is over, write some text 
        if (distance < 0) {
            clearInterval(x);
            
            $("#days").text("0");
            $("#hours").text("0");
            $("#minutes").text("0");
            $("#seconds").text("0");

            $("#e-inprogress").show();
        }
    }, 1000);

}