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
  var table = document.getElementById("allowlist_tbl");
  table.innerHTML =
    '<tr class="table-header"><th id="tbl-value">Value</th><th id="tbl-type">Type</th><th id="tbl-enable">Enable</th><th id="tbl-delete">Delete</th>';

  Object.values(allowlist).forEach((element) => {
    var row = table.insertRow();
    var titleCell = row.insertCell();
    var allowedItemID = element.ID;

    titleCell.innerHTML = element.VALUE;
    titleCell.setAttribute("contenteditable", "true");
    titleCell.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();

        chrome.storage.local.get(['allowlist'], function (result) {
          let allowList = result.allowlist;
          if (confirm(
            `Are you sure you want to change item value from"${allowList.list[allowedItemID].VALUE}"  to "${titleCell.innerHTML}"?`
          )) {
            allowList.list[allowedItemID].VALUE = titleCell.innerHTML
            console.log(titleCell.innerHTML);
            chrome.storage.local.set({ allowlist: allowList });
            renderTable(allowList.list);
          } else {
            location.reload();
          }

        })
      }
    });

    let typeColor = {'DOMAIN': '#00A6DB', 'PAGE': '#A0D019', 'REGEX': '#DB8300'} 

    var typeCell = row.insertCell();
    var type = document.createElement('div');
    type.classList.add('type-tag');
    type.style.background = typeColor[element.TYPE];
    type.innerHTML = element.TYPE;
    typeCell.appendChild(type);

    var checkCell = row.insertCell();
    var checkActive = document.createElement("input");

    checkActive.type = "checkbox";
    checkActive.checked = element.IS_ACTIVE;


    checkCell.appendChild(checkActive);

    checkActive.onchange = function (e) {
      var check = this.checked;
      chrome.storage.local.get(['allowlist'], function (result) {
        let allowList = result.allowlist;
        allowList.list[allowedItemID].IS_ACTIVE = check;
        chrome.storage.local.set({ allowlist: allowList });
        renderTable(allowList.list);
      })

    }

    var deleteCell = row.insertCell();
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.classList.add('table-button');
    deleteButton.onclick = function () {
      if (confirm(
        `Are you sure you want to delete this allow list item?
        \nThis is permanent and cannot be undone!`
      )) {
        chrome.storage.local.get(["allowlist"], function (result) {
          let allowList = result.allowlist;
          delete allowList.list[allowedItemID];
          allowList.count--;
          chrome.storage.local.set({ allowlist: allowList });
          renderTable(allowList.list);
        });
      } else {
        location.reload();
      }
    }
    deleteCell.appendChild(deleteButton);


    // var deleteCell = row.insertCell();
    // var deleteButton = document.createElement("button");
    // deleteButton.textContent = "DELETE";

    // deleteButton.onclick = function () {
    //   if (confirm(
    //     `Are you sure you want to delete this allow list item?
    //     \nThis is permanent and cannot be undone!`
    //   )) {
    //     chrome.storage.local.get(["allowlist"], function (result) {
    //       let allowList = result.allowlist;
    //       delete allowList.list[allowedItemID];
    //       allowList.count--;
    //       chrome.storage.local.set({ allowlist: allowList });
    //       renderTable(allowList.list);
    //     });
    //   } else {
    //     location.reload();
    //   }

    // };

    // deleteCell.appendChild(deleteButton);
  });
}

document.getElementById("add_entry_btn").addEventListener("click", function () {
  let textbox = document.getElementById("new_value");
  let typeSelect = document.getElementById("new_type");

  let value = textbox.value;
  let type = typeSelect.value;

  chrome.storage.local.get(["allowlist"], function (result) {
    list = result.allowlist.list;
    console.log(list);
    count = result.allowlist.count;
    list[count] = { ID: count, IS_ACTIVE: true, TYPE: type, VALUE: value };
    count++;
    chrome.storage.local.set({ allowlist: { count: count, list: list } });
    renderTable(list);
  });
  textbox.value = "";
});

const deleteAll = document.getElementById("delete_all");
document
  .getElementById("delete_value")
  .addEventListener("input", showAssociatedKeywords);

function showAssociatedKeywords() {
  let dropdown = document.getElementById("suggestions_dropdown");

  chrome.storage.local.get(["index"], function (result) {
    let search = document.getElementById("delete_value").value;
    let filtered = [];

    let index = result.index;

    for (let kw of Object.keys(index)) {
      if (kw.toLowerCase().match(search.toLowerCase())) {
        filtered.push(kw);
      }
    }

    if (filtered.length == 0) {
      dropdown.innerHTML =
        '<option value="" disabled selected>No entries found</option>';
    } else {
      dropdown.innerHTML = "";
    }

    for (let option of filtered) {
      let optionElement = document.createElement("option");
      optionElement.value = option;
      optionElement.text = option;

      dropdown.add(optionElement);
    }
  });
}

deleteAll.addEventListener("click", function () {
  let kw = document.getElementById("suggestions_dropdown").value;

  console.log("1");
  if (kw == "") {
    alert("Please input a valid keyword");
  }
  else if (
    confirm(
      `Are you sure you want to delete all URLs associated with the keyword: "${kw}" ?
      \nThis is permanent and cannot be undone!`
    )
  ) {
    chrome.storage.local.get("index", function (result) {
      let index = result.index;
      if (index[kw]) {
        delete index[kw];
      } else {
        alert("No matching entries");
      }

      chrome.storage.local.set({ index: index });

      document.getElementById("suggestions_dropdown").innerHTML =
        '<option value="" disabled selected>Select keyword to delete</option>';
      document.getElementById("delete_value").value = "";

      console.log("deleted");
    });
  }
});
