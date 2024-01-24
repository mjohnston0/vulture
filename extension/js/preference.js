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
    table.innerHTML = '<tr class="table-header"><th id="tbl-value">Value</th><th id="tbl-type">Type</th><th id="tbl-enable">Enable</th><th id="tbl-delete">Delete</th>'

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

        var deleteCell = row.insertCell();
        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'DELETE';
        var deleteID = element.ID;
        deleteButton.addEventListener('click', function() {
            chrome.storage.local.get(['allowlist'], function (result) {
                let allowList = result.allowlist;
                delete allowList.list[deleteID];
                allowList.count--;
                chrome.storage.local.set({"allowlist": allowList});
                renderTable(allowList.list);
            })});
        deleteCell.appendChild(deleteButton);
        })
}

document.getElementById("add_entry_btn").addEventListener("click", function(){
    let textbox = document.getElementById("new_value");
    let typeSelect = document.getElementById("new_type");

    let value = textbox.value;
    let type = typeSelect.value;

    chrome.storage.local.get(["allowlist"], function(result){
        list = result.allowlist.list;
        console.log(list)
        count = result.allowlist.count;
        list[count] = {"ID": count, "VALUE": value, "TYPE": type, "IS_ACTIVE": true};
        count++;
        chrome.storage.local.set({"allowlist": {"count":count,"list":list}});
        renderTable(list);
    })
    textbox.value = "";
})


const deleteAll = document.querySelector('.deleteAll');

deleteAll.addEventListener("click", function() {
    let kw = document.getElementById("keywordToDelete").value;


    chrome.storage.get("index", function(result) {
        let index = result.index;
        if (index[kw]) {
            delete index[kw];
        } else {
            alert("No matching entries");
        }

        chrome.storage.local.set({index: index})
    })
})


