const FormEnum = Object.freeze({
    "Member": 1,
    "Event": 2,
});

var Modal = {
    ModalMember: () => {
        $("#Modal-Member").modal('show');
    },
    ModalMemberDismiss: () => {
        $("#Modal-Member").modal('hide');
    },
    ModalEvent: () => {
        $("#Modal-Event").modal('show');
    },
    ModalEventDismiss: () => {
        $("#Modal-Event").modal('hide');
    },
    ModalDelete: () => {
        $("#Modal-Delete").modal('show');
    },
    ModalDeleteDismiss: () => {
        $("#Modal-Delete").modal('hide');
    },
    ClearFormData: () => {
        $("#form-member").trigger('reset');
        $("#member-body > .avatar").css("background-image", "");
        $("#form-event").trigger('reset');
        $('#datetimepicker1').val('').datetimepicker('clear');
        $('#datetimepicker2').val('').datetimepicker('clear');
        $(`.poster-display`).attr("src", '');
        
    },

}

var memberTable;
var eventTable;

function ToggleNav(hash) {
    switch (hash) {
        case "contact":
            $("#contact").addClass("active");
            $("#member").removeClass("active");
            $("#event").removeClass("active");
            $("#contact-records").show();
            $("#member-tab").hide();
            $("#event-tab").hide();
            break;
        case "member":
            $("#member").addClass("active");
            $("#contact").removeClass("active");
            $("#event").removeClass("active");
            $("#contact-records").hide();
            $("#member-tab").show();
            $("#event-tab").hide();
            break;
        case "event":
            $("#event").addClass("active");
            $("#contact").removeClass("active");
            $("#member").removeClass("active");
            $("#contact-records").hide();
            $("#member-tab").hide();
            $("#event-tab").show();
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
                    `url('${v.picture}')`
                )
            ),
            $("<td>").text(v.priority),
            $("<td>").text(v.active),
            $("<td>").append(
                $("<button>", {
                    type: "button",
                    class: "btn btn-warning",
                    onclick: `MemberModalEdit("${k}")`,
                }).text("Edit"),
                $("<button>", {
                    type: "button",
                    class: "btn btn-danger",
                    onclick: `MemberModalDelete("${k}")`,
                }).text("Delete")
            )
        );
        memberTable.rows.add(row);
    });
    memberTable.columns.adjust().draw();
}


async function DisplayMember() {
    await GetMemberCollection();
    await $.each(Members, function (k, v) {
		var row = $("<tr>").append(
			$("<td>").text(k),
			$("<td>").text(v.name),
			$("<td>").text(v.position),
			$("<td>").append(
				$("<div>", { class: "form-avatar" }).css(
					"background-image",
					`url('${v.picture}')`
				)
			),
			$("<td>").text(v.priority),
			$("<td>").text(v.active),
			$("<td>").append(
				$("<button>", {
					type: "button",
					class: "btn btn-warning",
					onclick: `MemberModalEdit("${k}")`,
				}).text("Edit"),
				$("<button>", {
					type: "button",
					class: "btn btn-danger",
					onclick: `MemberModalDelete("${k}")`,
				}).text("Delete")
			)
		);
		$("#member-table-body").append(row);
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
}

async function DisplayEvent() {
    await ReadEvents();
    await $.each(Events, function(k, v) {
        var row = $("<tr>").append(
            $("<td>").text(v.title),
            $("<td>").text(v.start.format("DD/MMM/YYYY LT")),
            $("<td>").text(v.end.format("DD/MMM/YYYY LT")),
            $("<td>").text(v.platform),
            $("<td>").text(v.type == EventTypeEnum.Workshop ? "WORKSHOP" : (v.type == EventTypeEnum.Talk ? "TALK" : "EVENT")),
            $("<td>").text(v.active),
            $("<td>").append(
                $("<button>", { type: "button", class: "btn btn-warning", onclick: `EventModalEdit("${k}")` }).text("Edit"),
                $("<button>", { type: "button", class: "btn btn-danger", onclick: `EventModalDelete("${k}")` }).text("Delete"),
            ),
        );
        $("#event-table-body").append(row);
    });
    $.fn.dataTable.moment("DD/MMM/YYYY LT");
    $("#event-table-body > #loader").remove();
    eventTable = $("#event-table").DataTable({
        order: [
            [5, "desc"],
            [1, "desc"]
        ],
        iDisplayLength: 25,
    });
}

function MemberModalEdit(id) {
    var m = Members[id];
    if (!m) {
        return;
    }

    var form = $("#form-member");

    form.find("[name=id]").val(id);
    form.find("[name=name]").val(m["name"]);
    form.find("[name=position]").val(m["position"]);
    form.find("[name=priority]").val(m["priority"]);
    form.find("[name=active]").val(m["active"] + "");
    $("#member-avatar > .avatar").css("background-image", `url('${m["picture"]}')`);

    Modal.ModalMember();
}

function MemberModalAdd() {
    var newid = Firebase_Helper.MembersCollectionRef.doc().id;

    $("#form-member > #id").val(newid);
    $("#Modal-Member .modal-title").text("Add New Member");
    Modal.ModalMember();
}

function MemberModalDelete(id) {
	$("#deleteConfirm").data("id", id);
	$("#deleteConfirm").data("collection", FormEnum.Member);
	Modal.ModalDelete();
}

function EventModalAdd() {
    Modal.ClearFormData();
    var newid = Firebase_Helper.EventCollectionRef.doc().id;
    $("#form-event [name=id]").val(newid);
    $("#Modal-Event .modal-title").text("Add new event");
    Modal.ModalEvent();
}

function EventModalEdit(id) {
    var e = Events[id];
    if (!e) {
        return;
    }
    var form = $("#form-event");
    
    form.find("[name=id]").val(id);
    form.find("[name=title]").val(e["title"]);
    form.find("[name=desc]").val(e["desc"]);
    form.find("[name=type]").val(e["type"]);
    $("#datetimepicker1").datetimepicker('date', e.start);
    $("#datetimepicker2").datetimepicker('date', e.end);
    form.find("[name=platform]").val(e["platform"]);
    form.find("[name=regUrl]").val(e["regUrl"]);
    form.find("[name=fbUrl]").val(e["fbUrl"] + "");
    form.find("[name=active]").val(e["active"] + "");
    $(`.poster-display`).attr("src", `${e.poster}`);

    $("#Modal-Event .modal-title").text("Edit event");
    Modal.ModalEvent();
}

function EventModalDelete(id) {
	$("#deleteConfirm").data("id", id);
	$("#deleteConfirm").data("collection", FormEnum.Event);
	Modal.ModalDelete();
}

function GetFormData(type) {
    var formData;
    switch (type) {
		case FormEnum.Member:
			formData = new FormData($("#form-member")[0]);
			break;
        case FormEnum.Event:
            formData = new FormData($("#form-event")[0]);
            break;
	}
    return formData;
}

function renderProfilePic(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            $(`#member-avatar > .avatar`).css("background-image", `url(${e.target.result})`);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function renderPoster(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            $(`.poster-display`).attr("src", `${e.target.result}`);
        }
        reader.readAsDataURL(input.files[0]);
    }
}


function SubmitMember() {
    try {
        var formData = GetFormData(FormEnum.Member);
        var id = formData.get("id");
        var pictureName = "";
        var promises = [];
        if(formData.get("picture").size > 0) {
            pictureName = id + "." + getFileExtension(formData.get("picture").name);
    
            var p1 = Firebase_Helper.MembersImgStorageRef.child(pictureName).put(
                formData.get("picture")
            );

            promises.push(p1);
        }

        var m = {
            active: formData.get("active") === "true",
            name: formData.get("name"),
            position: formData.get("position"),
            priority: parseInt(formData.get("priority")),
        };

        if(!!pictureName) {
            m["picture"] = pictureName;
        }
    
        var p2 = Firebase_Helper.MembersCollectionRef.doc(id).set(m, {merge: true});

        promises.push(p2);
    
        Promise.allSettled(promises).then(function(results) {
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
                alert("Submit Successfull");
                Modal.ClearFormData();
                Modal.ModalMemberDismiss();
                window.location.reload();
            }
        });
    } catch(ex) {
        alert(ex);
    }
    
}

function SubmitEvent(ele) {
    try {
        var promise = [];
        var formData = GetFormData(FormEnum.Event);
        var id = formData.get("id");
        var posterName = "";
        if(formData.get("poster").size > 0) {
            posterName = id + "." + getFileExtension(formData.get("poster").name);
            var p1 = Firebase_Helper.EventImgStorageRef.child(posterName).put(
                formData.get("poster")
            );
            promise.push(p1);
        }
        
        var e = {
            title: formData.get("title"),
            desc: formData.get("desc"),
            type: formData.get("type"),
            start: firebase.firestore.Timestamp.fromDate(new Date(formData.get("start"))),
            end: firebase.firestore.Timestamp.fromDate(new Date(formData.get("end"))),
            platform: formData.get("platform"),
            regUrl: formData.get("regUrl"),
            fbUrl: formData.get("fbUrl"),
            active: formData.get("active") === "true",
        };

        if(!!posterName) {
            e["poster"] = posterName;
        }

        var p2 = Firebase_Helper.EventCollectionRef.doc(id).set(e, {merge: true});
        promise.push(p2);
        Promise.allSettled(promise).then(function(results) {
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
                alert("Submit Successfull");
                Modal.ClearFormData();
                Modal.ModalEventDismiss();
                window.location.reload();
            }
        });
    } catch(ex) {
        alert(ex);
    }
    
}


function SubmitDelete() {
    var id = $("#deleteConfirm").data("id");
    var collection = $("#deleteConfirm").data("collection");
    if (!!id && !!collection) {
        var promises = [];
        if (collection == FormEnum.Event) {
            var p1 = Firebase_Helper.EventCollectionRef.doc(id).delete();
            promises.push(p1);
			try {
				var p2 = Firebase_Helper.StorageRef.refFromURL(
					Events[id]["poster"]
				).delete();
				promises.push(p2);
			} catch (ex) {
				console.log(ex);
			}
        } else if(collection == FormEnum.Member) {
            var p1 = Firebase_Helper.MembersCollectionRef.doc(id).delete();
			promises.push(p1);
			try {
				var p2 = Firebase_Helper.StorageRef.refFromURL(
					Members[id]["picture"]
				).delete();
				promises.push(p2);
			} catch (ex) {
				console.log(ex);
			}
        }
        
        Promise.allSettled(promises).then((results) => {
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
                Modal.ModalDeleteDismiss();
                window.location.reload();
            }
        });
    }
}

function getFileExtension(str) {
    return str.slice((str.lastIndexOf(".") - 1 >>> 0) + 2);
}