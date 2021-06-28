var Members = {};

function Append_To_Team_Div(members_data) {
    var members_data = SortingMembersToArray(members_data);
    members_data = members_data.filter((item) => {
        return item[1]["active"];
    });
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
                style: `background-image:url('${m["picture"]}');`
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
async function GetMemberCollection() {
    await Firebase_Helper.MembersCollectionRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            Members[doc.id] = doc.data();
        });
    });
    for (k in Members) {
        try {
            let url = await Firebase_Helper.GetMediaURLAsPromise(StorageMediaTypeEnum.Members, Members[k]["picture"]);
            Members[k]["picture"] = url;
        } catch(ex) {
            Members[k]["picture"] = `${Helper.LocalMediaPath}/default_profile_pic.jpg`;
        }
        
        
    }
}

async function GetTeams() {
    await GetMemberCollection();
    Append_To_Team_Div(Members);
}

function SortingMembersToArray(members) {
    members = Object.keys(members).map(function(key) {
        return [key, members[key]];
    });
    members.sort(function(first, second) {
        return first[1]["priority"] - second[1]["priority"];
    })
    return members;
}