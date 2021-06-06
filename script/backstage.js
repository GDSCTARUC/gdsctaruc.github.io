var Modal = {
    AddMemberModal: () => {
        $("#AddMemberModal").modal('show');
    },
    AddMemberModalDismiss: () => {
        $("#AddMemberModal").modal('hide');
    },
    EditMemberModal: () => {
        $("#EditMemberModal").modal('show');
    },
    EditMemberModalDismiss: () => {
        $("#EditMemberModal").modal('hide');
    },
    DeleteMemberModal: () => {
        $("#DeleteMemberModal").modal('show');
    },
    DeleteMemberModalDismiss: () => {
        $("#DeleteMemberModal").modal('hide');
    },
    ClearFormData: () => {
        $("#addMemberForm").trigger('reset');
        $("#editMemberForm").trigger('reset');
        $("#editMemberAvatar > .avatar").css("background-image", "");
        $("#editMemberAvatar > .avatar").css("background-image", "");
    },

}

var memberTable;

function ToggleNav(obj) {
    var $e = $(obj);
    switch ($e.attr("id")) {
        case "contact":
            $e.addClass("active");
            $("#member").removeClass("active");
            $("#contact-records").show();
            $("#member-tab").hide();
            break;
        case "member":
            $e.addClass("active");
            $("#contact").removeClass("active");
            $("#contact-records").hide();
            $("#member-tab").show();
            break;
    }
}

async function redrawMemberTable() {
    memberTable.clear().draw();
    await GetMemberCollection();
    await $.each(Members, function(k, v) {
        var row = $("<tr>").append(
            $("<td>").text(k),
            $("<td>").text(v.name),
            $("<td>").text(v.position),
            $("<td>").append(
                $("<div>", { class: "form-avatar" }).css(
                    "background-image",
                    `url('${v.imageURL}')`
                )
            ),
            $("<td>").text(v.priority),
            $("<td>").text(v.active),
            $("<td>").append(
                $("<button>", {
                    type: "button",
                    class: "btn btn-warning",
                    onclick: `ModalEdit("${k}")`,
                }).text("Edit"),
                $("<button>", {
                    type: "button",
                    class: "btn btn-danger",
                    onclick: `ModalDelete("${k}")`,
                }).text("Delete")
            )
        );
        memberTable.rows.add(row);
    });
    memberTable.columns.adjust().draw();
}


async function DisplayMember() {
    await GetMemberCollection();
    await $.each(Members, function(k, v) {
        var row = $("<tr>").append(
            $("<td>").text(k),
            $("<td>").text(v.name),
            $("<td>").text(v.position),
            $("<td>").append($("<div>", { class: "form-avatar" }).css("background-image", `url('${v.imageURL}')`)),
            $("<td>").text(v.priority),
            $("<td>").text(v.active),
            $("<td>").append(
                $("<button>", { type: "button", class: "btn btn-warning", onclick: `ModalEdit("${k}")` }).text("Edit"),
                $("<button>", { type: "button", class: "btn btn-danger", onclick: `ModalDelete("${k}")` }).text("Delete"),
            ),
        );
        $("#member-body").append(row);
    });

    $("#member-body > #loader").remove();
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
}

function ModalEdit(id) {
    var m = Members[id];
    if (!m) {
        return;
    }
    $("#editMemberForm > #id").val(id);
    $("#editMemberForm > #name").val(m["name"]);
    $("#editMemberForm > #position").val(m["position"]);
    $("#editMemberForm > #priority").val(m["priority"]);
    $("#editMemberForm > #active").val(m["active"] + "");
    $("#editMemberAvatar > .avatar").css("background-image", `url('${m["imageURL"]}')`);
    $("#editSubmit").data("id", id);

    Modal.EditMemberModal();
}

function ModalAdd() {
    var id = generateID(4);
    var MemberIDs = Object.keys(Members);
    while (MemberIDs.includes(id)) {
        id = generateID(4);
    }

    $("#addMemberForm > #id").val(id);

    Modal.AddMemberModal();
}

function ModalDelete(id) {
    $("#deleteConfirm").data("id", id);
    Modal.DeleteMemberModal();
}

function GetFormData(type) {
    var formData;
    if (type == "addMember") {
        formData = new FormData($("#addMemberForm")[0])

    } else if (type == "editMember") {
        formData = new FormData($("#editMemberForm")[0])
    }
    return formData;
}

function renderProfilePic(input) {
    var modal = $(input).data("modal");
    if (input.files && input.files[0] && !!modal) {
        var reader = new FileReader();

        reader.onload = function(e) {
            $(`#${modal}MemberAvatar > .avatar`).css("background-image", `url(${e.target.result})`);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

function EditMember(ele) {
    var formData = GetFormData("editMember");
    var id = formData.get("id");
    var newData = {
        [id]: {
            active: formData.get("active") === "true",
            name: formData.get("name"),
            position: formData.get("position"),
            priority: parseInt(formData.get("priority")),
        },
    }
    var imageURL = formData.get("imageURL").name;

    var p1;
    if (!!imageURL) {
        var imgName = formData.get("id") + "." + getFileExtension(imageURL);

        var p1 = Firebase_Helper.MembersImgStorageRef.child(imgName).put(formData.get("imageURL"));

        newData[id]["imageURL"] = imgName;
    }

    var p2 = Firebase_Helper.MembersCollectionDoc
        .set(newData, { merge: true });

    Promise.allSettled([p1, p2]).then((results) => {
        var error = false;
        results.forEach(function(result) {
            if (result.status == "rejected") {
                error = true;
                console.log(error.reason);
            }
        })
        if (error) {
            alert("Something went wrong");
        } else {
            alert("Edit Successfull");
            Modal.ClearFormData();
            Modal.EditMemberModalDismiss();
            redrawMemberTable()
        }
    });
}

function AddMember() {
    var formData = GetFormData("addMember");
    var id = formData.get("id");
    var MemberIDs = Object.keys(Members);
    while (MemberIDs.includes(id)) {
        id = generateID(4);
    }
    var formData = GetFormData("addMember");

    var imgName = id + "." + getFileExtension(formData.get("imageURL").name);

    var p1 = Firebase_Helper.MembersImgStorageRef.child(imgName).put(
        formData.get("imageURL")
    );

    var p2 = Firebase_Helper.MembersCollectionDoc.update({
        [id]: {
            active: formData.get("active") === "true",
            imageURL: imgName,
            name: formData.get("name"),
            position: formData.get("position"),
            priority: parseInt(formData.get("priority")),
        },
    });

    Promise.allSettled([p1, p2]).then(function(results) {
        var error = false;
        results.forEach(function(result) {
            if (result.status == "rejected") {
                error = true;
                console.log(error.reason);
            }
        })

        if (error) {
            alert("Something went wrong");
        } else {
            alert("Add Successfull");
            Modal.ClearFormData();
            Modal.AddMemberModalDismiss();
            redrawMemberTable()
        }
    });
}

function DeleteMember() {
    var id = $("#deleteConfirm").data("id");
    if (id) {
        var p1 = Firebase_Helper.MembersCollectionDoc.update({
            [id]: firebase.firestore.FieldValue.delete()
        });
        var p2 = Firebase_Helper.StorageRef.refFromURL(Members[id]["imageURL"]).delete();

        Promise.allSettled([p1, p2]).then((results) => {
            var error = false;
            results.forEach(function(result) {
                if (result.status == "rejected") {
                    error = true;
                    console.log(error.reason);
                }
            })

            if (error) {
                alert("Something went wrong");
            } else {
                alert("Delete Successfull");
                Modal.DeleteMemberModalDismiss();
                redrawMemberTable()
            }
        })

    }
}

function getFileExtension(str) {
    return str.slice((str.lastIndexOf(".") - 1 >>> 0) + 2);
}

function generateID(length) {
    var result = [];
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result.push(characters.charAt(Math.floor(Math.random() *
            charactersLength)));
    }
    return result.join('');
}