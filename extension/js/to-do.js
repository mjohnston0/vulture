document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.local.get(["todo", "tags"], function (result) {
        if (result.todo) {
            renderTable(result.todo.tasks, result.tags);
        } else {
            return;
        }
    });

    updateTagBox();

});

function updateTagBox() {
    chrome.storage.local.get(["tags"], function (result) {
        let tags = result.tags;
        let tagFilterBox = document.getElementById("tags");
        tagFilterBox.options.length = 1
        for (let key of Object.keys(tags)) {
            let newOption = document.createElement("option");
            newOption.value = key;
            newOption.textContent = key;
            tagFilterBox.appendChild(newOption);
        }
    })
}

function updateTagList() {
    chrome.storage.local.get(["tags"], function (result) {
        let tags = result.tags;
        let dropdownItems = document.getElementById('dropdown-items');

        dropdownItems.innerHTML = '<div class="dropdown-items" id="dropdown-items"></ div>'

        Object.keys(tags).forEach((key) => {
            let item = document.createElement('div');
            item.classList.add('item');
            item.addEventListener('click', (e) => {
                document.getElementById('selected-item').textContent = e.target.textContent;
                document.getElementById('dropdown-items').classList.remove('open')
            })

            let color = document.createElement('span');
            color.classList.add('item-color');
            color.style.background = tags[key]

            let name = document.createElement('span');
            name.classList.add('item-name');
            name.textContent = key;

            let itemBtn = document.createElement('button');
            itemBtn.classList.add('item-btn');
            itemBtn.addEventListener('click', () => {
                if (confirm("Are you sure you wish to delete this task?")) {
                    chrome.storage.local.get(['tags'], function (result) {
                        let t = result.tags;
                        delete t[key];
                        chrome.storage.local.set({'tags': t});
                        updateTagList();
                        updateTagBox();
                        document.getElementById('dropdown-items').classList.add('open')
                    })
                }
            })

            let deleteIcon = document.createElement('img');
            deleteIcon.classList.add('item-btn-img');
            deleteIcon.src = chrome.runtime.getURL('./images/deleticon.png')

            itemBtn.appendChild(deleteIcon);

            item.appendChild(color);
            item.appendChild(name);
            item.appendChild(itemBtn);

            dropdownItems.appendChild(item);
        })

        let item = document.createElement('div');
        item.classList.add('item');

        let name = document.createElement('label');
        name.classList.add('item-name');
        name.id = 'add-tag';
        name.htmlFor = 'add-tag-btn';
        name.textContent = 'Create New Tag';

        let itemBtn = document.createElement('button');
        itemBtn.id = 'add-tag-btn';
        itemBtn.classList.add('item-btn');
        itemBtn.addEventListener('click', insertAddTag);

        let addIcon = document.createElement('img');
        addIcon.classList.add('item-btn-img');
        addIcon.src = chrome.runtime.getURL('./images/addicon.png')

        itemBtn.appendChild(addIcon);

        item.appendChild(name);
        item.appendChild(itemBtn);

        dropdownItems.appendChild(item);
    })
}

function drawTable() {
    chrome.storage.local.get(["todo", "tags"], function (result) {
        renderTable(result.todo.tasks, result.tags);
    })
}

document.getElementById("showDone").addEventListener("change", function (e) {
    chrome.storage.local.get(["todo", "tags"], function (result) {
        renderTable(result.todo.tasks, result.tags);
    })
})

function renderTable(tasksDict, tags) {
    var table = document.getElementById("todo_table")
    table.innerHTML = '<tr class="table-header"><th id="tbl-title">Title</th><th id="tbl-description">Description</th><th id="tbl-due">Due time</th><th id="tbl-tag">Tag</th><th id="tbl-edit">Edit</th><th id="tbl-status">Status</th><th id="tbl-del">Delete</th></tr>'
    let tasks = sortTasks(tasksDict);
    let showDone = document.getElementById("showDone").checked;
    for (let entry of tasks) {
        let taskID = entry[0];
        let task = entry[1];
        var isDone = isInPast(task.DUE);
        if (!showDone && (task.STATUS|| isDone)) {
            continue;
        }
        var row = table.insertRow()
        var titleCell = row.insertCell()
        titleCell.innerHTML = task.TITLE

        var descCell = row.insertCell()
        descCell.id = 'data-des';
        descCell.innerHTML = task.DESCRIPTION

        var dueCell = row.insertCell()
        dueCell.innerHTML = task.DUE.slice(-5) + " " + task.DUE.slice(8, 10) + "/" + task.DUE.slice(5, 7) + " " + task.DUE.slice(0, 4)

        var tagCell = row.insertCell()
        var tag = document.createElement("div");
        tag.classList.add('task-tag')
        tag.style.background = tags[task.TAG]
        tag.innerHTML = task.TAG
        tagCell.appendChild(tag);

        var editCell = row.insertCell();
        var editButton = document.createElement('button');
        editButton.textContent = "⋯";
        editButton.classList.add('edit-button')
        editButton.addEventListener('click', function () {
            editTask(taskID);
        });
        editCell.appendChild(editButton);

        var toggle = document.createElement('label');
        toggle.classList.add('status-toggle')
        var span = document.createElement('span');
        
        var textSpan = document.createElement('span');
        var textNode = document.createTextNode("null");

        var statusCell = row.insertCell();
        var statusBox = document.createElement('input');
        
        statusBox.type = "checkbox"

        if (task.STATUS) {
            statusBox.checked = true;
            textNode.nodeValue = isDone ? "Finished" : "Inactive";
        } else {
            statusBox.checked = false ;
            textNode.nodeValue = isDone ? "Finished" : "Active";
        }

        statusBox.addEventListener("change", function (e) {
            var check = this.checked;
            chrome.storage.local.get(["todo"], function (result) {
                let todo = result.todo;
                todo.tasks[taskID].STATUS = check;
                chrome.storage.local.set({ todo: todo })
                drawTable();
            })

        })
        textSpan.appendChild(textNode);
        textSpan.classList.add('status-text');

        toggle.appendChild(statusBox);
        toggle.appendChild(span);


        statusCell.appendChild(toggle)
        statusCell.appendChild(textSpan)

        var deleteCell = row.insertCell();
        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('table-button');
        deleteButton.addEventListener('click', function () {
            if (confirm("Are you sure you wish to delete this task?")) {
                deleteTask(taskID);
            }
        });
        deleteCell.appendChild(deleteButton);
    }
}

function isInPast(otherDate){
    try {
        var providedDate = new Date(otherDate);
        var currentDate = new Date();
        return providedDate < currentDate
      } catch (error) {
        return -1;
      }
}

function sortTasks(taskDict) {
    let entries = Object.entries(taskDict);

    entries.sort(function compare(task1, task2) {
        return new Date(task1[1]['DUE']) - new Date(task2[1]['DUE'])
    })
    return entries;
}

function deleteTask(id) {
    chrome.storage.local.get(['todo', 'tags'], function (result) {
        let todo = result.todo;
        delete todo.tasks[id];
        todo.count--;
        chrome.storage.local.set({ todo: todo });
        renderTable(todo.tasks, result.tags);
    })
}

function editTask(id) {
    toggleEditBox();
    showEditBtn();
    chrome.storage.local.get(['todo'], function (result) {
        let todo = result.todo;
        document.getElementById("title").value = todo.tasks[id].TITLE;
        document.getElementById("selected-item").textContent = todo.tasks[id].TAG;
        document.getElementById("description").value = todo.tasks[id].DESCRIPTION;
        currentTodoId = id
        document.getElementById("taskDueDate").value = todo.tasks[id].DUE
    })

}

function sortTodoList(todos, by) {
    if (by === 'title') {
        todos.sort((todo1, todo2) =>
            todo2.status - todo1.status || todo1.title.localeCompare(todo2.title)
        );

    } else if (by === 'date') {
        todos.sort((todo1, todo2) =>
            todo2.status - todo1.status || new Date(todo1.date).getTime() - new Date(todo2.date).getTime() || todo1.title.localeCompare(todo2.title, undefined, { sensitivity: 'accent' })
        );
    }
}

function includes(todo, keyword) {
    return (todo.title.toLowerCase().includes(keyword.toLowerCase()) || todo.description.toLowerCase().includes(keyword.toLowerCase())) ? true : false;
}

function sameDate(date1, date2) {
    let d1 = new Date(date1);
    let day1 = d1.getDay();
    let month1 = d1.getMonth();
    let year1 = d1.getFullYear();

    let d2 = new Date(date2)
    let day2 = d2.getDay();
    let month2 = d2.getMonth();
    let year2 = d2.getFullYear();

    return ((day1 === day2) && (month1 === month2) && (year1 === year2)) ? true : false;
}

var title = document.getElementById('menuTitle')
const save = document.querySelector('.save');
const cancel = document.querySelector('.cancel');


const edit = document.querySelector('.edit');
const discard = document.querySelector('.discard');

const addMenu = document.querySelector(".editbox");

const editBtnDiv = document.getElementById("addGroup");
const addBtnDiv = document.getElementById("editGroup");
var currentTodoId = 0;

function showEditBtn() {
    editBtnDiv.style.display = "flex";
    addBtnDiv.style.display = "none";
    title.textContent = "Edit Task"

    updateTagList();
}


function showAddBtn() {
    addBtnDiv.style.display = "flex";
    editBtnDiv.style.display = "none";
    title.textContent = "Add Task"

    updateTagList();
}

// function updateTagList() {
//     let tag = document.getElementById('tagDropdown');

// }
// function updateTagList() {
//     tagElements = document.getElementsByClassName('tag-list');

//     chrome.storage.local.get(['tags'], function (result) {
//         tags = result.tags;

//         for (element of tagElements) {
//             element.options.length = 0

//             Object.keys(tags).forEach((key) => {
//                 option = new Option(key, key);
//                 element.options.add(option);
//             })
//         }

//     })
// }

document.getElementById("addTask").addEventListener("click", function () {
    clearText();
    showAddBtn();
    toggleEditBox();
})

cancel.addEventListener('click', toggleEditBox)
discard.addEventListener('click', toggleEditBox)

edit.addEventListener("click", function () {
    var title = document.getElementById("title").value
    var tag = document.getElementById("selected-item").textContent
    var description = document.getElementById("description").value
    var due = document.getElementById("taskDueDate").value

    if (title == "" || description == "" || due == "") {
        alert("invalid input")
        return;
    }
    chrome.storage.local.get(['todo', 'tags'], function (result) {
        let todo = result.todo;
        todo.tasks[currentTodoId] = { ID: currentTodoId, TITLE: title, DESCRIPTION: description, DUE: due, TAG: tag, STATUS: false };
        chrome.storage.local.set({ todo: todo });

        renderTable(todo.tasks, result.tags);

        chrome.runtime.sendMessage({ todo: todo.tasks[currentTodoId] }).catch();
        addMenu.classList.toggle("on");

    })
})

save.addEventListener("click", function () {
    var title = document.getElementById("title").value
    var tag = document.getElementById("selected-item").textContent
    var description = document.getElementById("description").value
    var due = document.getElementById("taskDueDate").value

    if (title == "" || description == "" || due == "") {
        alert("invalid input")
        return;
    }
    chrome.storage.local.get(['todo', 'tags'], function (result) {
        let todo = result.todo;
        task_id = todo.count + 1;
        todo.count++;
        todo.tasks[task_id] = { ID: task_id, TITLE: title, DESCRIPTION: description, DUE: due, TAG: tag, STATUS: false };
        chrome.storage.local.set({ todo: todo });
        renderTable(todo.tasks, result.tags);

        chrome.runtime.sendMessage({ todo: todo.tasks[task_id] }).catch();
        addMenu.classList.remove("on");

    })
})

function toggleEditBox() {
    addMenu.classList.toggle("on");
}

function clearText() {
    document.getElementById("title").value = "";
    document.getElementById("selected-item").textContent = "Select Tag";
    document.getElementById("description").value = "";
    document.getElementById("taskDueDate").value = "";
}

document.getElementById("clearTodo").addEventListener("click", function () {
    if (confirm("Are you sure you want to clear the To Do List? (This is permanent!)")) {
        resetTodo();
    }
})

document.getElementById("resetFilter").addEventListener("click", resetFilter)

function resetTodo() {
    chrome.storage.local.set({ todo: { count: 0, tasks: {} } });
    renderTable({}, undefined);
}

document.getElementById("search").addEventListener("input", filter)
document.getElementById("selectDate").addEventListener("input", filter)
document.getElementById("tags").addEventListener("change", filter)

function filter() {
    chrome.storage.local.get(["todo", "tags"], function (result) {
        let e = document.getElementById("search").value;
        let d = document.getElementById("selectDate").value;
        let tag = document.getElementById("tags").value;

        let filtered = {};

        let todo = result.todo;

        for (task in todo.tasks) {
            if (tag == "") {
                if ((todo.tasks[task]["TITLE"].toLowerCase().match(e.toLowerCase()) || todo.tasks[task]["DESCRIPTION"].toLowerCase().match(e.toLowerCase())) && todo.tasks[task]["DUE"].slice(0, 10).match(d)) {
                    filtered[task] = todo.tasks[task];
                }
            } else {
                if ((todo.tasks[task]["TITLE"].toLowerCase().match(e.toLowerCase()) || todo.tasks[task]["DESCRIPTION"].toLowerCase().match(e.toLowerCase())) && todo.tasks[task]["DUE"].slice(0, 10).match(d) && todo.tasks[task]["TAG"] == tag) {
                    filtered[task] = todo.tasks[task];
                }
            }
        }

        let msg = document.getElementById("search_error")
        if (Object.keys(filtered).length == 0) {
            msg.innerHTML = "NO MATCHES FOUND"
            renderTable({}, result.tags)
        } else {
            msg.innerHTML = ""
            renderTable(filtered, result.tags)
        }

    })
}

function resetFilter() {
    location.reload();
}

function randomColor() {
    colors = ['blueviolet', 'crimson', 'darkorchid', 'darkslateblue', 'darkmagenta', 'deeppink', 'tomato', 'teal', 'sienna',
        'rebeccapurple', 'peru', 'orangered', 'limegreen', 'lightslategrey', 'darkslategrey', 'dimgray', 'brown', 'darkred'];

    return colors[Math.floor(Math.random() * colors.length)]
}

async function addTag() {
    let name = document.getElementById('newtag-input').value;

    if (name === '') {
        alert("Tag name cannot be empty.");
        return;
    }
        
    const result = await chrome.storage.local.get(['tags']);
    let tags = result.tags;

    if (name in tags) {
        alert("Tag already exists.");
        return;
    }

    tags[name] = randomColor();

    await chrome.storage.local.set({ tags: tags });

    updateTagBox();
    updateTagList();

}

document.getElementById('dropdown-btn').addEventListener('click', () => {
    document.getElementById('dropdown-items').classList.toggle('open');
    updateTagList();
})

function insertAddTag() {
    let name  = document.getElementById('add-tag');

    let newTag = document.createElement('input');
    newTag.type = 'text';
    newTag.id = 'newtag-input';
    newTag.placeholder = 'New Tag'

    let confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Confirm';
    confirmBtn.addEventListener('click', addTag);
    confirmBtn.id = 'add-tag-confirm';
    
    name.insertAdjacentElement("beforebegin", newTag);
    name.insertAdjacentElement("beforebegin", confirmBtn);

    name.remove();
    document.getElementById('add-tag-btn').remove()
}

    // let name  = document.getElementById('add-tag');

    // let newTag = document.createElement('input');
    // newTag.type = 'text';
    
    // name.insertAdjacentElement("beforebegin", newTag);
    // name.remove()



    // let item = document.createElement('div');
    // item.classList.add('item');

    //     // let name = document.createElement('label');
    //     name.classList.add('item-name');
    //     name.id = 'add-tag';
    //     name.htmlFor = 'add-tag-btn';
    //     name.textContent = 'Create New Tag';

    //     let itemBtn = document.createElement('span');
    //     itemBtn.classList.add('item-btn');

    //     let addIcon = document.createElement('img');
    //     addIcon.classList.add('item-btn-img');
    //     addIcon.id = 'add-tag-btn';
    //     addIcon.src = chrome.runtime.getURL('./images/addicon.png')

    //     itemBtn.appendChild(addIcon);

    //     item.appendChild(name);
    //     item.appendChild(itemBtn);

    //     dropdownItems.appendChild(item);


// document.getElementById("newTagbtn").addEventListener("click", async function () {
//     tagName = document.getElementById("newTagName").value;
//     if (tagName == "") {
//         alert("Tag name cannot be empty.");
//         return;
//     }
//     await addTag(tagName);
//     updateTagList();
//     updateTagBox();

// })
// classList.toggle("on")
// document.getElementById("openEditTag").addEventListener("click", function() {
//     console.log("LPLP");
//     document.getElementById("tagPopup").classList.add("open")
// })

async function populateData() {


    for (i=0; i< 10; i++) {

        await addTag(`tag${i}`);
        updateTagList();
        updateTagBox();

    }


    chrome.storage.local.get(['index'], function(result) {
        let index = result.index;

        index['activists'] = ['https://www.bbc.co.uk/news/scotland', 'https://www.bbc.co.uk/news/world'];
        index['alerts'] = ['https://www.bbc.co.uk/news/scotland', 'https://www.bbc.co.uk/news/world'];
        index['care'] = ['https://www.bbc.co.uk/news/scotland', 'https://www.bbc.co.uk/news/world'];
        index['despite'] = ['https://www.bbc.co.uk/news/scotland', 'https://www.bbc.co.uk/news/world'];
        index['editorial'] = ['https://www.bbc.co.uk/news/scotland', 'https://www.bbc.co.uk/news/world'];
        index['food'] = ['https://www.bbc.co.uk/news/scotland', 'https://www.bbc.co.uk/news/world'];

        chrome.storage.local.set({index: index});
    })

    chrome.storage.local.get(['todo'], function(result) {
        let todo = result.todo;
        for (x=0; x<90; x++) {
            let z = x % 10;
            todo.count++;
            todo.tasks[x] = { ID: x, TITLE: `test${x}`, DESCRIPTION: `test${x}`, DUE: `2024-02-0${1+z}T0${z}:00`, TAG: `tag${z}`, STATUS: false };
        }

        chrome.storage.local.set({todo: todo});
        renderTable(todo.tasks);
    })   
}
