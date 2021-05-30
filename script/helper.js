function TriggerFullLoadingModal() {
    var bgcolor = $("#modal-loading").data("bg-color");
    if (bgcolor != null) {
        $("#modal-loading").css("background-color", bgcolor);
    } else {
        $("#modal-loading").css("background-color", '');
    }
    $("#modal-loading").modal("show");
}

function DismissFullLoadingModal() {
    $("#modal-loading").modal("hide");
}

function CheckMobile() {
    let check = false;
    (function(a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}

async function GetFirebaseMediaPromise(file) {
    var url;
    var storageRef = firebase.storage().ref("images/events/");
    await storageRef.child(file).getDownloadURL().then((result) => {
        url = result;
    });
    return url;
}



var Helper = {
    isMobile: CheckMobile(),
    isDesktop: !CheckMobile(),
    LocalMediaPath: 'images/',
    GetFirebaseMediaURLAsPromise: GetFirebaseMediaPromise,
    HTMLJsonToJson: HTMLJsonToJson,
}

var Page = {
    FullLoading: TriggerFullLoadingModal,
    FullLoadingDismiss: DismissFullLoadingModal,
    EventOn: () => {
        $("#stay-turned").hide();
        $("#dsc-upcoming-events").show();
        $("#countdown-block").show();
    },
    EventOff: () => {
        $("#stay-turned").show();
        $("#dsc-upcoming-events").hide();
        $("#countdown-block").hide();
    },
}

var Cookie = {
    Create: function(n, t, r) {
        var u, f, e;
        if (r ? (e = new Date,
                e.setTime(e.getTime() + r * 864e5),
                u = "; expires=" + e.toGMTString()) : u = "",
            host = location.hostname,
            host.split(".").length === 1 || isIPDomain(host))
            f = host,
            document.cookie = n + "=" + t + u + "; path=/; domain=" + f;
        else {
            if (domainParts = host.split("."),
                host.split(".").length >= 3) {
                for (i = 1; i <= host.split(".").length - 2; i++)
                    domainParts.shift();
                f = "." + domainParts.join(".")
            }
            document.cookie = n + "=" + t + u + "; path=/; domain=" + f
        }
    },
    Delete: function(n) {
        Cookie.Create(n, "", -1);
        document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    },
    Get: function(n) {
        for (var t, r = n + "=", u = document.cookie.split(";"), i = 0; i < u.length; i++)
            if (t = $.trim(u[i]),
                t.indexOf(r) === 0)
                return t.substring(r.length, t.length);
        return ""
    }
};

function HTMLJsonToJson(s) {
    s = s.replace(
        /(<([^>]+)>)|(<br>)|(&nbsp;)/gi,
        ""
    );
    return JSON.parse(s);
}