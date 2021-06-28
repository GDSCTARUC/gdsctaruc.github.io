const EventTypeEnum = Object.freeze({
    Workshop: 1,
    Talk: 2,
    Event: 3,
});
var Events = {};

var Event_Styles = {
    [EventTypeEnum.Workshop]: {
        color: "#FFFFFF",
        backgroundColor: "#00796b",
    },
    [EventTypeEnum.Event]: {
        color: "#FFFFFF",
        backgroundColor: "#e64a19",
    },
    [EventTypeEnum.Talk]: {
        color: "#FFFFFF",
        backgroundColor: "#1976d2",
    },
};

var Global_Promise = [];

function IsCurrentEvent(event) {
    if (event == undefined) {
        return false;
    }
    let eStart = event.start;
    let eEnd = event.end;
    let now = moment();
    if (now - eStart > 0 && now - eEnd < 0) {
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

    let eStart = event.start;
    x = setInterval(function() {
        let now = moment();
        let distance = eStart - now;
        if (distance < 0) {}
        $("#days").text(Math.floor(distance / day));
        $("#hours").text(Math.floor((distance % day) / hour));
        $("#minutes").text(Math.floor((distance % hour) / minute));
        $("#seconds").text(Math.floor((distance % minute) / second));

        //seconds
    }, 0);
    $("#countdown-block").show();
}

async function LoadEvents() {
    if (Cookie.Get("dsc-events") != "") {
        console.log("INFO: Events Cookies Found: Reusing Cookie Data");
        Events = Helper.HTMLJsonToJson(Cookie.Get("dsc-events"));
    } else {
        console.log("INFO: Events Cookies Not Found: Reloading cookies");
        await ReadEvents();
        Cookie.Create("dsc-events", JSON.stringify(eCalendar), 30 / 24 / 60);
    }
    Events = GetActiveEvents(Events);
    var [past, upcoming] = EventsSpliterAndSort(Events);
    FcRender();
    PostRender(past, upcoming);
}

async function ReadEvents() {
    await Firebase_Helper.EventCollectionRef.get().then((docs) => {
        docs.forEach((doc) => {
            var id = doc.id;
            var event = doc.data();
            event.start = moment(event.start.toDate());
            event.end = moment(event.end.toDate());
            Events[id] = event;
        });
    });
    for (var k of Object.keys(Events)) {
        try {
            Events[k].poster = await Firebase_Helper.GetMediaURLAsPromise(
                StorageMediaTypeEnum.Events,
                Events[k].poster
            );
        } catch (ex) {} finally {
            continue;
        }
    }
}

function GetActiveEvents(events) {
    var result = {};
    for (var k of Object.keys(events)) {
        if(events[k].active) {
            result[k] = events[k];
        }
    }
    return result;
}

function EventsSpliterAndSort(events) {
    var past = [];
    var upcoming = [];

    var current_date_time = moment();

    for (var k of Object.keys(events)) {
        if (events[k].end - current_date_time > 0) {
            upcoming.push(events[k]);
        } else {
            past.push(events[k]);
        }
    }
    past.sort((a, b) => (a.start > b.start ? -1 : b.start > a.start ? 1 : 0));
    upcoming.sort((a, b) =>
        a.start > b.start ? 1 : b.start > a.start ? -1 : 0
    );
    return [past, upcoming];
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
            src: e.poster,
            alt: e.title + " Poster",
        });
        var $title = $("<h5>", { class: "card-title" }).text(e.title);
        $body.append($title);
        var $desc = $("<p>", { class: "card-text" }).text(e.desc);
        $body.append($desc);
        var $redirect = $("<a>", {
            class: "btn btn-primary",
            href: e.fbUrl,
        }).text("Go");
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
    var $calendarIcon = $("<i>", {
        class: "col far fa-calendar-alt short-detail-icon",
    });
    var $clockIcon = $("<i>", { class: "col far fa-clock short-detail-icon" });
    var $locationIcon = $("<i>", {
        class: "col fas fa-map-marked-alt short-detail-icon",
    });
    var $shortDetailRowDiv = $("<div>", { class: "row" });
    var $shortDetailTextP = $("<p>", { class: "col short-detail-text" });

    $.each(events, function(idx, e) {
        // poster
        var $nextEventPhotoDiv = $("<div>", {
            class: "event-photo col-sm12 col-md-6",
        });
        var $img = $("<img>", {
            class: "",
            src: e.poster,
            alt: e.title + " Poster",
        });
        $nextEventPhotoDiv.append($img);

        // detail
        var $nextEventDetailDiv = $("<div>", {
            class: "next-event-detail col-sm-12 col-md-6",
        });
        var $newSup = $("<sup>", { id: "title", class: "sup-new" }).text(
            " NEW"
        );
        var $badge = $("<span>", { id: "e-badge", class: "badge" });

        if (e.type == EventTypeEnum.Workshop) {
            $badge.css(Event_Styles[EventTypeEnum.Workshop]);
            $badge.text("WORKSHOP");
        } else if (e.type == EventTypeEnum.Event) {
            $badge.css(Event_Styles[EventTypeEnum.Event]);
            $badge.text("EVENT");
        } else if (e.type == EventTypeEnum.Talk) {
            $badge.css(Event_Styles[EventTypeEnum.Talk]);
            $badge.text("TALK");
        }

        var $badgeDiv = $("<div>", { class: "e-badge-container" }).append(
            $badge
        );
        var $titleH4 = $("<h4>", { class: "upc-event-title" }).html(
            e.title + $newSup[0].outerHTML
        );
        var $descP = $("<p>", { class: "font-weight-light" }).text(e.desc);
        // short detail
        var $ShortDetailDiv = $("<div>", { class: "next-event-short-details" });
        var dayText = "";
        if(e.end.diff(e.start, 'days') < 1) {
            dayText = e.start.format("DD MMM YYYY");
        } else {
            dayText = e.start.format("DD MMM YYYY") + " - " + e.end.format("DD MMM YYYY")
        }
        $shortDetailRowDiv.append(
            $calendarIcon,
            $shortDetailTextP.text(dayText)
        );
        $ShortDetailDiv.append($shortDetailRowDiv.clone());
        $shortDetailRowDiv.empty();
        $shortDetailRowDiv.append(
            $clockIcon,
            $shortDetailTextP.text(e.start.format("LT") + " - " + e.end.format("LT"))
        );
        $ShortDetailDiv.append($shortDetailRowDiv.clone());
        $shortDetailRowDiv.empty();

        $shortDetailRowDiv.append(
            $locationIcon,
            $shortDetailTextP.text(e.platform)
        );
        $ShortDetailDiv.append($shortDetailRowDiv.clone());
        $shortDetailRowDiv.empty();

        var $redirectBtn;
        var $redirectDiv;
        if (IsCurrentEvent(e)) {
            $redirectBtn = $("<a>", {
                href: e.regUrl,
                class: "btn btn-danger",
            }).text("On-Air");
            $redirectDiv = $("<div>", { class: "e-inprogress" }).append(
                $redirectBtn
            );
        } else {
            $redirectBtn = $("<a>", {
                href: e.regUrl,
                class: "btn btn-primary",
            }).text("Register Now");
            $redirectDiv = $("<div>").append($redirectBtn);
        }

        $nextEventDetailDiv.append(
            $titleH4,
            $badgeDiv,
            $descP,
            $ShortDetailDiv,
            $redirectDiv
        );

        var $eventContainer;
        if (idx % 2 != 0) {
            $eventContainer = $("<div>", {
                class: "event-container row",
                id: "about-us",
            }).append($nextEventDetailDiv, $nextEventPhotoDiv);
            $nextEventPhotoDiv.addClass("text-right");
        } else {
            $eventContainer = $("<div>", {
                class: "event-container row",
                id: "about-us",
            }).append($nextEventPhotoDiv, $nextEventDetailDiv);
            $nextEventPhotoDiv.addClass("text-left");
        }

        $("#upcoming-events").append($eventContainer);
    });
    Page.EventOn();
}

function PostRender(past, upcoming) {
    AppendPassEvents(past);
    AppendUpcomingEvents(upcoming);
    Countdown(upcoming[0]);
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
        ],
    });

    Page.FullLoadingDismiss();
    AOS.init();
}

function FcRender() {
    var calendarEl = document.getElementById("calendar");
    var events = FcEventConverter(Events);
    var calendar = new FullCalendar.Calendar(calendarEl, {
        events: events,
        eventDidMount: function(e) {
            var start = moment(e.event.start).format("HH:mm");
            var end = moment(e.event.end).format("HH:mm");
            $(e.el).tooltip({
                title: "Time: " + start + "-" + end,
            });
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



function FcEventConverter(events) {
    var fcEvents = [];

    for (var k of Object.keys(events)) {
        var e = {};
        e.id = k;
        e.start = events[k].start.toISOString();
        e.end = events[k].end.toISOString();
        e.allDay = false;
        e.title = events[k].title;

        e.url =
            events[k].regNowUrl ??
            "https://dsc.community.dev/tunku-abdul-rahman-university-college/";

        if (events[k].type == EventTypeEnum.Workshop) {
            e.classNames = ["workshop"];
        } else if (events[k].type == EventTypeEnum.Event) {
            e.classNames = ["event"];
        } else if (events[k].type == EventTypeEnum.Talk) {
            e.classNames = ["talk"];
        }
        fcEvents.push(e);
    }
    return fcEvents;
}