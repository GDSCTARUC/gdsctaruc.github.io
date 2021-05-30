var memberImgStorageRef = firebase.storage().ref("images/committees/");
var db = firebase.firestore();
var Members = [];

function Append_To_Team_Div(members_data) {
    var member_size = members_data.length;
    var our_team_div = $("#teams");
    while (member_size > 0) {
        var col_md_n = 3;
        if (parseInt(member_size - 4) < 0) {
            col_md_n = 12 / member_size;
            member_size = -1;
        } else {
            member_size -= 4;
        }
        var div_member_row = $("<div>", {
            class: "row member-row"
        });

        for (j = 0; j < (12 / col_md_n); j++) {
            var m = members_data.shift()[1];
            var div_member = $("<div>", {
                class: `member-photo col-sm-6 col-md-${col_md_n} text-center mt-2`
            });

            var div_photo = $("<div>", {
                class: "avatar",
                style: `background-image:url('${m["imageURL"]}');`
            });
            var h4_name = $("<h4>");
            h4_name.text(m["name"]);

            var p_post = $("<p>").text(m["position"]);

            div_member.append(div_photo);
            div_member.append(h4_name);
            div_member.append(p_post);
            div_member_row.append(div_member);
        }
        our_team_div.append(div_member_row);
    }
}

async function async_updateImgURL() {
    await db.collection("dsc").doc("members").get().then((querySnapshot) => {
        var data = querySnapshot.data();
        members = Object.keys(data).map(function(key) {
            return [key, data[key]];
        });
        members.sort(function(first, second) {
            return first[1]["priority"] - second[1]["priority"];
        })
    });
    for (i = 0; i < members.length; i++) {
        let url = await memberImgStorageRef.child(members[i][1]["imageURL"]).getDownloadURL();
        members[i][1]["imageURL"] = url;
    }
    Members.push(...members);
    Append_To_Team_Div(members);

}

$(document).ready(function() {
    Page.FullLoading();
    if (Cookie.Get("dsc-members") != "") {
        Members = Helper.HTMLJsonToJson(Cookie.Get("dsc-members"));
        Append_To_Team_Div(Members);
    } else {
        async_updateImgURL().then(function(result) {
            Cookie.Create("dsc-members", JSON.stringify(Members), 30 / 24 / 60)
        });
    }
    setTimeout(function() {
        Page.FullLoadingDismiss()
    }, 5000);
});