document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.local.get(["allowlist"], function (result) {
        if (result.allowlist) {
            // console.log(result.allowlist);
            renderTable(result.allowlist.list);
        } else {
            //console.error("No todoList found.");
            return;
        }
    });
});

function renderTable(allowlist) {
    console.log(allowlist);
    var table = document.getElementById("allowlist_tbl")
    table.innerHTML = '<tr class="table-header"><th id="tbl-title">Title</th><th id="tbl-description">Description</th><th id="tbl-due">Due time</th><th id="tbl-tag">Tag</th><th id="tbl-edit">Edit</th><th id="tbl-status">Status</th><th id="tbl-del">Delete</th></tr>'
    console.log("KOKOK");

    Object.values(allowlist).forEach((element) => {
        var row = table.insertRow()
        var titleCell = row.insertCell()
        titleCell.innerHTML = element.VALUE;

        var descCell = row.insertCell()
        descCell.id = 'data-des';
        let select = document.createElement("select");
        let options = ['SITE', 'PAGE', 'REGEX']

        options.forEach((element) => {
            select.options.add(new Option(element, element));
        })

        select.value = element.TYPE;

        descCell.appendChild(select);

        var radioCell = row.insertCell()
        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.checked = element.IS_ACTIVE;

        radioCell.appendChild(radio)

    })
}
