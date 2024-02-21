document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['todo', 'tags'], function (result) {
        if (result.todo) {
            renderTable(result.todo.tasks, result.tags);
        } else {
            return;
        }
    });

    updateTagBox();

});

function drawTable() {
    chrome.storage.local.get(['todo', 'tags'], function (result) {
        renderTable(result.todo.tasks, result.tags);
    })
}

document.getElementById('showDone').onchange = filter;

function renderTable(tasksDict, tags) {
    var table = document.getElementById('todo_table');
    table.innerHTML = '<tr class="table-header"><th id="tbl-title">Title</th><th id="tbl-description">Description</th><th id="tbl-due">Due time</th><th id="tbl-tag">Tag</th><th id="tbl-edit">Edit</th><th id="tbl-status">Status</th><th id="tbl-del">Delete</th></tr>';
    let tasks = sortTasks(tasksDict);
    let showDone = document.getElementById('showDone').checked;

    for (let entry of tasks) {
        let taskID = entry[0];
        let task = entry[1];

        if (!showDone && task.STATUS) {
            continue;
        }

        var row = table.insertRow();
        var titleCell = row.insertCell();
        if (isInPast(task.DUE)) {
            var exclamationSpan = document.createElement('span');

            var exclamationNode = document.createTextNode('null');
            exclamationNode.nodeValue = '!';

            exclamationSpan.appendChild(exclamationNode);
            exclamationSpan.classList.add('exclamation-text');

            var titleSpan = document.createElement('span');
            titleSpan.textContent = task.TITLE;
            titleSpan.classList.add('title-span');

            titleCell.appendChild(exclamationSpan);
            titleCell.appendChild(titleSpan);
        } else {
            titleCell.innerHTML = task.TITLE;
        }

        titleCell.style.fontWeight = "bold";

        var descCell = row.insertCell();
        descCell.id = 'data-des';
        descCell.innerHTML = task.DESCRIPTION;

        var dueCell = row.insertCell();
        dueCell.innerHTML = task.DUE.slice(-5) + ' ' + task.DUE.slice(8, 10) + '/' + task.DUE.slice(5, 7) + ' ' + task.DUE.slice(0, 4);

        var tagCell = row.insertCell();
        var tag = document.createElement('div');
        tag.classList.add('task-tag');
        if (!(task.TAG in tags)) {
            task.TAG = 'DEFAULT'
        }
        tag.style.background = tags[task.TAG];
        tag.innerHTML = task.TAG;
        tagCell.appendChild(tag);

        var editCell = row.insertCell();
        var editButton = document.createElement('button');
        editButton.textContent = '⋯';
        editButton.classList.add('edit-button');
        editButton.onclick = function () {
            editTask(taskID);
        }
        editCell.appendChild(editButton);

        var toggle = document.createElement('label');
        toggle.classList.add('status-toggle');
        var span = document.createElement('span');

        var textSpan = document.createElement('span');
        var textNode = document.createTextNode("null");

        var statusCell = row.insertCell();
        var statusBox = document.createElement('input');
        
        statusBox.type = "checkbox"

        if (task.STATUS) {
            statusBox.checked = true;
            textNode.nodeValue = "Inactive";
        } else {
            statusBox.checked = false ;
            textNode.nodeValue = "Active";
        }

        statusBox.onchange = function (e) {
            var check = this.checked;
            chrome.storage.local.get(['todo'], function (result) {
                let todo = result.todo;
                todo.tasks[taskID].STATUS = check;
                chrome.storage.local.set({ todo: todo });
                drawTable();
            })

        }

        textSpan.appendChild(textNode);
        textSpan.classList.add('status-text');

        toggle.appendChild(statusBox);
        toggle.appendChild(span);

        statusCell.appendChild(toggle);
        statusCell.appendChild(textSpan);

        var deleteCell = row.insertCell();
        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('table-button');
        deleteButton.onclick = function () {
            if (confirm('Are you sure you wish to delete this task?')) {
                deleteTask(taskID);
            }
        }
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
        return new Date(task1[1]['DUE']) - new Date(task2[1]['DUE']);
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
        document.getElementById('title').value = todo.tasks[id].TITLE;
        document.getElementById('selected-item').textContent = todo.tasks[id].TAG;
        document.getElementById('description').value = todo.tasks[id].DESCRIPTION;
        currentTodoId = id;
        document.getElementById('taskDueDate').value = todo.tasks[id].DUE;

        displayTag(todo.tasks[id].TAG);
    })

}

var title = document.getElementById('menuTitle');
const save = document.querySelector('.save');
const cancel = document.querySelector('.cancel');


const edit = document.querySelector('.edit');
const discard = document.querySelector('.discard');

const addMenu = document.querySelector('.editbox');

const editBtnDiv = document.getElementById('addGroup');
const addBtnDiv = document.getElementById('editGroup');
var currentTodoId = 0;

function showEditBtn() {
    editBtnDiv.style.display = 'flex';
    addBtnDiv.style.display = 'none';
    title.textContent = 'Edit Task';

    updateTagList();
}

function showAddBtn() {
    addBtnDiv.style.display = 'flex';
    editBtnDiv.style.display = 'none';
    title.textContent = 'Add Task';

    updateTagList();
}

document.getElementById('addTask').onclick = function () {
    clearText();
    showAddBtn();
    toggleEditBox();
}

cancel.onclick = toggleEditBox;
discard.onclick = toggleEditBox;

edit.onclick = function () {
    var title = document.getElementById('title').value;
    var tag = document.getElementById('selected-item').textContent;
    var description = document.getElementById('description').value;
    var due = document.getElementById('taskDueDate').value;

    if (title === '' || description === '' || due === '' || tag === 'Select Tag') {
        alert('Tasks require a title, a description, a due date and time, and a tag.');
        return;
    }
    chrome.storage.local.get(['todo', 'tags'], function (result) {
        let todo = result.todo;
        todo.tasks[currentTodoId] = { ID: currentTodoId, TITLE: title, DESCRIPTION: description, DUE: due, TAG: tag, STATUS: false };
        chrome.storage.local.set({ todo: todo });

        renderTable(todo.tasks, result.tags);

        chrome.runtime.sendMessage({ todo: todo.tasks[currentTodoId] }).catch();
        addMenu.classList.toggle('on');

    })
}

save.onclick = function () {
    var title = document.getElementById('title').value;
    var tag = document.getElementById('selected-item').textContent;
    var description = document.getElementById('description').value;
    var due = document.getElementById('taskDueDate').value;

    if (title === '' || description === '' || due === '' || tag === 'Select Tag') {
        alert('Tasks require a title, a description, a due date, and a tag.');
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
        addMenu.classList.remove('on');

    })
}

function toggleEditBox() {
    addMenu.classList.toggle('on');
}

function clearText() {
    document.getElementById('title').value = '';
    document.getElementById('selected-item').textContent = 'Select Tag';
    document.getElementById('description').value = '';
    document.getElementById('taskDueDate').value = '';
}

document.getElementById('clearTodo').onclick = function () {
    if (confirm('Are you sure you want to clear the To Do List? (This is permanent!)')) {
        resetTodo();
    }
}

function resetTodo() {
    chrome.storage.local.set({ todo: { count: 0, tasks: {} } });
    renderTable({}, undefined);
}

document.getElementById('search').oninput = filter;
document.getElementById('selectDate').oninput = filter;
document.getElementById('tags').onchange = filter;

function filter() {
    chrome.storage.local.get(['todo', 'tags'], function (result) {
        let e = document.getElementById('search').value;
        let d = document.getElementById('selectDate').value;
        let tag = document.getElementById('tags').value;

        let filtered = {};

        let todo = result.todo;

        for (task in todo.tasks) {
            if (tag == '') {
                if ((todo.tasks[task]['TITLE'].toLowerCase().match(e.toLowerCase()) || todo.tasks[task]['DESCRIPTION'].toLowerCase().match(e.toLowerCase())) && todo.tasks[task]['DUE'].slice(0, 10).match(d)) {
                    filtered[task] = todo.tasks[task];
                }
            } else {
                if ((todo.tasks[task]['TITLE'].toLowerCase().match(e.toLowerCase()) || todo.tasks[task]['DESCRIPTION'].toLowerCase().match(e.toLowerCase())) && todo.tasks[task]['DUE'].slice(0, 10).match(d) && todo.tasks[task]['TAG'] == tag) {
                    filtered[task] = todo.tasks[task];
                }
            }
        }

        let msg = document.getElementById('search_error')
        if (Object.keys(filtered).length == 0) {
            msg.innerHTML = 'NO MATCHES FOUND';
            renderTable({}, result.tags);
        } else {
            msg.innerHTML = '';
            renderTable(filtered, result.tags);
        }

    })
}

document.getElementById('reset-filter-btn').onclick = resetFilter;

function resetFilter() {
    location.reload();
}

function updateTagBox() {
    chrome.storage.local.get(['tags'], function (result) {
        let tags = result.tags;
        let tagFilterBox = document.getElementById('tags');

        tagFilterBox.options.length = 1;

        for (let key of Object.keys(tags)) {
            let newOption = document.createElement('option');
            newOption.value = key;
            newOption.textContent = key;
            tagFilterBox.appendChild(newOption);
        }
    })
}

function displayTag(name) {
    chrome.storage.local.get(['tags'], function (result) {
        let tags = result.tags;
        let selectedItem = document.getElementById('selected-item');

        selectedItem.innerHTML = '<span id="selected-item"></span>';

        let tag = document.createElement('div');
        tag.classList.add('task-tag');
        tag.style.background = tags[name];
        tag.innerHTML = name;

        selectedItem.appendChild(tag);

        document.getElementById('dropdown-btn').style.padding = '10px';

        document.getElementById('dropdown-items').classList.remove('open');
    })
}

function updateTagList() {
    chrome.storage.local.get(['tags'], function (result) {
        let tags = result.tags;
        let dropdownItems = document.getElementById('dropdown-items');

        dropdownItems.innerHTML = '<div class="dropdown-items" id="dropdown-items"></ div>'

        Object.keys(tags).forEach(function (key) {
            let item = document.createElement('div');
            item.classList.add('item');
            item.value = key;
            item.onclick = function (e) {
                if (e.target.value) {
                    displayTag(e.target.value);
                }
            }

            let color = document.createElement('span');
            color.classList.add('item-color');
            color.style.background = tags[key]
            color.value = key;

            let name = document.createElement('span');
            name.classList.add('item-name');
            name.textContent = key;
            name.value = key;

            let itemBtn = document.createElement('button');
            itemBtn.classList.add('item-btn');
            itemBtn.onclick = function () {
                chrome.storage.local.get(['todo', 'tags'], function (result) {
                    if (confirm('Are you sure you wish to delete this tag?')) {
                        let t = result.tags;
                        delete t[key];

                        let selectedItem = document.getElementById('selected-item');

                        if (key === selectedItem.textContent) {
                            selectedItem.textContent = 'Select Tag'
                            document.getElementById('dropdown-btn').style.padding = '13px 10px';
                        }

                        chrome.storage.local.set({ 'tags': t });
                        updateTagList();
                        updateTagBox();
                        renderTable(result.todo.tasks, result.tags)
                    }
                    document.getElementById('dropdown-items').classList.add('open');
                })
            }

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
        itemBtn.onclick = insertAddTag;

        let addIcon = document.createElement('img');
        addIcon.classList.add('item-btn-img');
        addIcon.src = chrome.runtime.getURL('./images/addicon.png');

        itemBtn.appendChild(addIcon);

        item.appendChild(name);
        item.appendChild(itemBtn);

        dropdownItems.appendChild(item);
    })
}

document.getElementById('dropdown-btn').onclick = function () {
    document.getElementById('dropdown-items').classList.toggle('open');
    updateTagList();
}

document.onclick = function (e) {
    if (!(e.target.closest('.ipt-tag') || e.target.closest('.item-btn'))) {
        document.getElementById('dropdown-items').classList.remove('open');
    }
}

function insertAddTag() {
    let addTag = document.getElementById('add-tag');

    let newTag = document.createElement('input');
    newTag.type = 'text';
    newTag.id = 'newtag-input';
    newTag.placeholder = 'New Tag';

    newTag.onkeydown = async function (e) {
        if (e.code == 'Enter') {
            let name = document.getElementById('newtag-input').value;

            if (name === '') {
                alert('Tag name cannot be empty.');
                updateTagBox();
                updateTagList();
                return;
            }

            const result = await chrome.storage.local.get(['tags']);
            let tags = result.tags;

            if (name in tags) {
                if (!confirm("Tag already exists. Replace it?")) {
                    updateTagBox();
                    updateTagList();
                    return;
                }
            }

            tags[name] = document.getElementById('color-picker').value;

            await chrome.storage.local.set({ tags: tags });

            updateTagBox();
            updateTagList();
        }
    }

    let colorPickerWrapper = document.createElement('div');
    colorPickerWrapper.id = 'color-picker-wrapper';

    let colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.id = 'color-picker';
    colorPicker.value = '#00A6DB';

    colorPicker.onchange = function () {
        colorPickerWrapper.style.backgroundColor = colorPicker.value;
    }

    colorPickerWrapper.appendChild(colorPicker);

    addTag.insertAdjacentElement('beforebegin', newTag);
    addTag.insertAdjacentElement('beforebegin', colorPickerWrapper);

    newTag.focus();

    addTag.remove();
    document.getElementById('add-tag-btn').remove();
}

async function populateData() {


    for (i = 0; i < 10; i++) {

        await addTag(`tag${i}`);
        updateTagList();
        updateTagBox();

    }


    chrome.storage.local.get(['index'], function (result) {
        let index = result.index;

        index['activists'] = ['https://www.bbc.co.uk/news/scotland', 'https://www.bbc.co.uk/news/world'];
        index['alerts'] = ['https://www.bbc.co.uk/news/scotland', 'https://www.bbc.co.uk/news/world'];
        index['care'] = ['https://www.bbc.co.uk/news/scotland', 'https://www.bbc.co.uk/news/world'];
        index['despite'] = ['https://www.bbc.co.uk/news/scotland', 'https://www.bbc.co.uk/news/world'];
        index['editorial'] = ['https://www.bbc.co.uk/news/scotland', 'https://www.bbc.co.uk/news/world'];
        index['food'] = ['https://www.bbc.co.uk/news/scotland', 'https://www.bbc.co.uk/news/world'];

        chrome.storage.local.set({ index: index });
    })

    chrome.storage.local.get(['todo'], function (result) {
        let todo = result.todo;
        for (x = 0; x < 90; x++) {
            let z = x % 10;
            todo.count++;
            todo.tasks[x] = { ID: x, TITLE: `test${x}`, DESCRIPTION: `test${x}`, DUE: `2024-02-0${1 + z}T0${z}:00`, TAG: `tag${z}`, STATUS: false };
        }

        chrome.storage.local.set({ todo: todo });
        renderTable(todo.tasks);
    })
}
