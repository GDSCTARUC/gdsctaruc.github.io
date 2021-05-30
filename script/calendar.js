var eCalendar = {
    env: {
        googleCalendarApiKey: "AIzaSyCPBjy-1YPX2NTBkS9NSWPVdBJXFlhce-g",
        googleCalendarId: "h46gp2id0c6gnd2rskin49vp7o@group.calendar.google.com",
    },
    events: {
        past: [],
        upcoming: [],
    },
};

var Event_Styles = {
    workshop: {
        color: "#FFFFFF",
        backgroundColor: "#00796b",
    },
    event: {
        color: "#FFFFFF",
        backgroundColor: "#e64a19",
    },
    talk: {
        color: "#FFFFFF",
        backgroundColor: "#1976d2",
    },
};

var Global_Promise = [];

function IsCurrentEvent(event) {
    if (event == undefined) {
        return false;
    }
    let eStart = event.start.moment;
    let eEnd = event.end.moment;
    let now = moment();
    if (((now - eStart) > 0) && ((now - eEnd) < 0)) {
        return true;
    } else {
        return false;
    }
}

function Countdown(event) {
    const second = 1000,
        minute = second * 60,
        hour = minute * 60,
        day = hour * 24;
    if (typeof event == "undefined") {
        $("#countdown-block").hide();
        $("#e-inprogress").hide();
        return;
    } else if (IsCurrentEvent(event)) {
        $("#countdown-block").hide();
        $("#e-inprogress").show();
        return;
    }

    let eStart = event.start.moment;

    x = setInterval(function() {
        let now = moment();
        let distance = eStart - now;
        if (distance < 0) {

        }
        $("#days").text(Math.floor(distance / day));
        $("#hours").text(Math.floor((distance % day) / hour));
        $("#minutes").text(Math.floor((distance % hour) / minute));
        $("#seconds").text(Math.floor((distance % minute) / second));

        //seconds
    }, 0);
}

async function loadCalendar() {
    await gapi.client
        .init({
            apiKey: eCalendar.env.googleCalendarApiKey,
            discoveryDocs: [
                "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
            ],
        })
        .then(function() {
            return gapi.client.calendar.events.list({
                calendarId: eCalendar.env.googleCalendarId,
                singleEvents: true,
                orderBy: "startTime",
            });
        })
        .then(
            function(response) {
                if (response.result.items) {
                    $.each(response.result.items, function(idx, entry) {
                        if (typeof entry.description != "undefined") {
                            var e;
                            try {
                                e = Helper.HTMLJsonToJson(entry.description);
                            } catch (ex) {
                                return;
                            }

                            if (e.active == false) {
                                return;
                            }

                            var sdt = moment(entry.start.dateTime);
                            var edt = moment(entry.end.dateTime);
                            var cdt = moment();
                            e.title = entry.summary;
                            e.start = {
                                date: sdt.format("DD MMMM YYYY"),
                                day: sdt.format("dddd"),
                                time: sdt.format("hh:mm a"),
                                moment: sdt,
                            };
                            e.end = {
                                date: edt.format("DD MMMM YYYY"),
                                day: edt.format("dddd"),
                                time: edt.format("hh:mm a"),
                                moment: edt,
                            };
                            if (edt - cdt > 0) {
                                eCalendar.events.upcoming.push(e);
                            } else {
                                eCalendar.events.past.push(e);
                            }
                        }
                    });
                }
            },
            function(reason) {
                console.log("Error: " + reason);
            }
        );
    for (var e of eCalendar.events.past) {
        try {
            e.media = await Helper.GetFirebaseMediaURLAsPromise(e.media);
        } catch (ex) {} finally {
            continue;
        }

    }
    for (var e of eCalendar.events.upcoming) {
        try {
            e.media = await Helper.GetFirebaseMediaURLAsPromise(e.media);
        } catch (ex) {} finally {
            continue;
        }
    }
    eCalendar.events.past.sort((a, b) => (a.start.moment > b.start.moment) ? -1 : ((b.start.moment > a.start.mement) ? 1 : 0));
    Cookie.Create("dsc-events", JSON.stringify(eCalendar), 30 / 24 / 60);
    PostRender();
}


function ClearEvent(type) {
    if (type == "past") {
        $("#past-events-list").empty();
    } else if (type == "upcoming") {
        $("#upcoming-events").empty();
    }
}

function AppendPassEvents(events) {
    ClearEvent("past");
    $.each(events, function(idx, e) {
        var $body = $("<div>", { class: "card-body" });
        var $top = $("<img>", {
            class: "card-img-top",
            src: e.media,
            alt: e.title + " Poster",
        });
        var $title = $("<h5>", { class: "card-title" }).text(e.title);
        $body.append($title);
        var $desc = $("<p>", { class: "card-text" }).text(e.desc);
        $body.append($desc);
        var $redirect = $("<a>", { class: "btn btn-primary", href: e.fbPost }).text(
            "Go"
        );
        $body.append($redirect);
        var $card = $("<div>", { class: "card w-100" });
        $card.append($top);
        $card.append($body);

        var $col = $("<div>", { class: "col-lg-12" });
        $col.append($card);

        $("#past-events-list").append($col);
    });
}


function AppendUpcomingEvents(events) {
    ClearEvent("upcoming");

    if (typeof events == "undefined" || events.length == 0) {
        Page.EventOff();
        return;
    }

    // short details fixed element
    var $calendarIcon = $("<i>", { class: "col far fa-calendar-alt short-detail-icon" });
    var $clockIcon = $("<i>", { class: "col far fa-clock short-detail-icon" });
    var $locationIcon = $("<i>", { class: "col fas fa-map-marked-alt short-detail-icon" });
    var $shortDetailRowDiv = $("<div>", { class: "row" });
    var $shortDetailTextP = $("<p>", { class: "col short-detail-text" });

    $.each(events, function(idx, e) {
        // poster 
        var $nextEventPhotoDiv = $("<div>", { class: "event-photo col-sm12 col-md-6" });
        var $img = $("<img>", {
            class: "",
            src: e.media,
            alt: e.title + " Poster",
        });
        $nextEventPhotoDiv.append($img);

        // detail
        var $nextEventDetailDiv = $("<div>", { class: "next-event-detail col-sm-12 col-md-6" });
        var $newSup = $("<sup>", { id: "title", class: "sup-new", }).text(" NEW");
        var $badge = $("<span>", { id: "e-badge", class: "badge" });

        if (e.type.toLowerCase() == "workshop") {
            $badge.css(Event_Styles.workshop);
        } else if (e.type == "event") {
            $badge.css(Event_Styles.event);
        } else if (e.type == "talk") {
            $badge.css(Event_Styles.talk);
        }

        $badge.text(e.type.toUpperCase());

        var $badgeDiv = $("<div>", { class: "e-badge-container" }).append($badge);
        var $titleH4 = $("<h4>", { class: "upc-event-title", }).html(e.title + $newSup[0].outerHTML);
        var $descP = $("<p>", { class: "font-weight-light", }).text(e.desc);

        // short detail
        var $ShortDetailDiv = $("<div>", { class: "next-event-short-details" });
        $shortDetailRowDiv.append($calendarIcon, $shortDetailTextP.text(e.start.date));
        $ShortDetailDiv.append($shortDetailRowDiv.clone());
        $shortDetailRowDiv.empty();

        $shortDetailRowDiv.append($clockIcon, $shortDetailTextP.text(e.start.time + " - " + e.end.time));
        $ShortDetailDiv.append($shortDetailRowDiv.clone());
        $shortDetailRowDiv.empty();

        $shortDetailRowDiv.append($locationIcon, $shortDetailTextP.text(e.platform));
        $ShortDetailDiv.append($shortDetailRowDiv.clone());
        $shortDetailRowDiv.empty();

        var $redirectBtn;
        var $redirectDiv;
        if (IsCurrentEvent(e)) {
            $redirectBtn = $("<a>", { href: e.regNowUrl, class: "btn btn-danger" }).text("On-Air");
            $redirectDiv = $("<div>", { class: "e-inprogress" }).append($redirectBtn);
        } else {
            $redirectBtn = $("<a>", { href: e.regNowUrl, class: "btn btn-primary" }).text("Register Now");
            $redirectDiv = $("<div>").append($redirectBtn);
        }

        $nextEventDetailDiv.append($titleH4, $badgeDiv, $descP, $ShortDetailDiv, $redirectDiv);

        var $eventContainer;
        if (idx % 2 != 0) {
            $eventContainer = $("<div>", { class: "event-container row", id: "about-us" }).append($nextEventDetailDiv, $nextEventPhotoDiv);
            $nextEventPhotoDiv.addClass("text-right");
        } else {
            $eventContainer = $("<div>", { class: "event-container row", id: "about-us" }).append($nextEventPhotoDiv, $nextEventDetailDiv);
            $nextEventPhotoDiv.addClass("text-left");
        }


        $("#upcoming-events").append($eventContainer);
    });
    console.log("passed");
    Page.EventOn();
}

function PostRender() {
    console.log(eCalendar.env.googleCalendarApiKey);
    AppendPassEvents(eCalendar.events.past);
    AppendUpcomingEvents(eCalendar.events.upcoming);
    Countdown(eCalendar.events.upcoming[0]);
    $(".card-slider").slick({
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 2000,
        arrows: true,
        responsive: [{
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 400,
                settings: {
                    arrows: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ]
    });

    Page.FullLoadingDismiss();
    AOS.init();
}

function FcRender() {
    var calendarEl = document.getElementById("calendar");
    var calendar = new FullCalendar.Calendar(calendarEl, {
        eventDidMount: function(e) {
            // Removing the event type from the event title
            var $event = e.event._def;
            var eDesc = Helper.HTMLJsonToJson($event.extendedProps.description);
            // Change the event background color based on the event type
            if (eDesc.type == "workshop") {
                $(e.el).css(Event_Styles.workshop);
            } else if (eDesc.type == "event") {
                $(e.el).css(Event_Styles.event);
            } else if (eDesc.type == "talk") {
                $(e.el).css(Event_Styles.talk);
            }

            // Redirect user to event page when click
            let url = eDesc.regNowUrl;
            if (typeof url != "undefined") {
                if (url.includes("http://") || url.includes("https://")) {
                    $(e.el).attr("href", url);
                } else {
                    $(e.el).attr("href", "http://" + url);
                }
            } else {
                $(e.el).attr(
                    "href",
                    "https://dsc.community.dev/tunku-abdul-rahman-university-college/"
                );
            }
            var start = moment(e.event.start).format("HH:mm");
            var end = moment(e.event.end).format("HH:mm");

            $(e.el).tooltip({
                title: "Time: " + start + "-" + end,
            });
        },
        googleCalendarApiKey: eCalendar.env.googleCalendarApiKey,
        events: {
            googleCalendarId: eCalendar.env.googleCalendarId,
        },
        initialView: Helper.isMobile ? "listMonth" : "dayGridMonth",
        themeSystem: "bootstrap",
        bootstrapFontAwesome: false,
        buttonText: {
            today: "Today",
            next: ">",
            prev: "<",
        },
        headerToolbar: {
            left: "today",
            center: "title",
            right: "prev,next",
        },
        displayEventTime: false,
        contentHeight: 600,
        aspectRatio: 2,
    });
    calendar.render();
}

$(document).ready(function() {
    Page.FullLoading();
    FcRender();
    if (Cookie.Get('dsc-events') != "") {
        eCalendar = Helper.HTMLJsonToJson(Cookie.Get('dsc-events'));
        console.log(eCalendar);
        PostRender();
    } else {
        gapi.load("client", loadCalendar)
    }
    setTimeout(function() {
        Page.FullLoadingDismiss()
    }, 5000);
});