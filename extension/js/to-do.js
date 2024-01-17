document.addEventListener("DOMContentLoaded", function() {
    chrome.storage.local.get(["todo"], function(result) {
        if (result.todo) {
            renderTable(result.todo.tasks);
        } else {
            //console.error("No todoList found.");
            return;
        }
    });
});

function drawTable() {
    chrome.storage.local.get(["todo"], function(result) {
        renderTable(result.todo.tasks);
    })
}

document.getElementById("showDone").addEventListener("change", function(e){
    chrome.storage.local.get(["todo"], function(result) {
        renderTable(result.todo.tasks);
    })
})

function renderTable(tasksDict){
    var table = document.getElementById("todo_table")
    table.innerHTML = '<tr class="table-header"><th id="tbl-title">Title</th><th id="tbl-description">Description</th><th id="tbl-due">Due time</th><th id="tbl-tag">Tag</th><th id="tbl-edit">Edit</th><th id="tbl-status">Status</th><th id="tbl-del">Delete</th></tr>'
    let tasks = sortTasks(tasksDict);
    let showDone = document.getElementById("showDone").checked;
    for (let entry of tasks) {
        let taskID = entry[0];
        let task = entry[1];
        if (!showDone && task.STATUS){
            continue;
        }
        var row = table.insertRow()
        var titleCell = row.insertCell()
        titleCell.innerHTML = task.TITLE

        var descCell = row.insertCell()
        descCell.id = 'data-des';
        descCell.innerHTML = task.DESCRIPTION

        var dueCell = row.insertCell()
        dueCell.innerHTML = task.DUE.slice(-5) + " "+task.DUE.slice(8,10)+"/" +task.DUE.slice(5,7) + " " + task.DUE.slice(0,4)

        var tagCell = row.insertCell()
        //console.log(task.TAG)
        tagCell.innerHTML = task.TAG

        var editCell = row.insertCell();
        var editButton = document.createElement('button');
        editButton.textContent = "⋯";
        editButton.classList.add('table-button')
        editButton.addEventListener('click', function() {
            editTask(taskID);
        });
        editCell.appendChild(editButton);

        var toggle = document.createElement('label');
        toggle.classList.add('status-toggle')
        var span = document.createElement('span');

        var statusCell = row.insertCell()
        var statusBox = document.createElement('input')
        statusBox.type = "checkbox"
        if (task.STATUS == true){
            statusBox.checked = true;
        }
        statusBox.addEventListener("change", function(e) {
            var check = this.checked;
            chrome.storage.local.get(["todo"], function(result) {
                let todo = result.todo;
                todo.tasks[taskID].STATUS = check;
                chrome.storage.local.set({todo : todo})
                drawTable();
            })
            
        })
        toggle.appendChild(statusBox);
        toggle.appendChild(span);

        statusCell.appendChild(toggle)


        var deleteCell = row.insertCell();
        var deleteButton = document.createElement('button');
        deleteButton.textContent = '—';
        deleteButton.classList.add('table-button');
        deleteButton.addEventListener('click', function() {
            deleteTask(taskID);
        });
        deleteCell.appendChild(deleteButton);
    }
}

function sortTasks(taskDict) {
    let entries = Object.entries(taskDict);

    entries.sort(function compare(task1, task2) {
        return new Date(task1[1]['DUE']) - new Date(task2[1]['DUE'])
    })
    return entries;
}

// delete task based on ID
function deleteTask(id) {
    chrome.storage.local.get(['todo'], function (result) {
        let todo = result.todo;
        delete todo.tasks[id];
        todo.count--;
        chrome.storage.local.set({todo: todo});
        renderTable(todo.tasks);
    })
}

// edit task
function editTask(id) {
    toggleEditBox();
    showEditBtn();
    chrome.storage.local.get(['todo'], function (result) {
        let todo = result.todo;
        document.getElementById("title").value = todo.tasks[id].TITLE;
        document.getElementById("tag").value = todo.tasks[id].TAG;
        document.getElementById("description").value = todo.tasks[id].DESCRIPTION;
        //console.log(typeof todo.tasks[id].DUE)
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
            todo2.status - todo1.status || new Date(todo1.date).getTime() - new Date(todo2.date).getTime() || todo1.title.localeCompare(todo2.title, undefined, {sensitivity: 'accent'})
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

function showEditBtn(){
    editBtnDiv.style.display = "flex";
    addBtnDiv.style.display = "none";
    title.textContent = "Edit todo item"
}


function showAddBtn(){
    addBtnDiv.style.display = "flex";
    editBtnDiv.style.display = "none";
    title.textContent = "Add todo item"
}

document.getElementById("addTask").addEventListener("click",   function (){
    clearText();
    showAddBtn();
    toggleEditBox();
})

cancel.addEventListener('click',  toggleEditBox)
discard.addEventListener('click',  toggleEditBox)

edit.addEventListener("click", function(){
    var title = document.getElementById("title").value 
    var tag = document.getElementById("tag").value 
    var description = document.getElementById("description").value 
    var due = document.getElementById("taskDueDate").value

    if(title == "" ||  description == "" || due == ""){
        alert("invalid input")
        return;
    }
    chrome.storage.local.get(['todo'], function (result) {
        let todo = result.todo;
        //console.log(todo);
        todo.tasks[currentTodoId] = {ID: currentTodoId, TITLE: title, DESCRIPTION: description, DUE: due, TAG: tag, STATUS: false };
        chrome.storage.local.set({ todo: todo });

        //deleteTask(currentTodoId)
        renderTable(todo.tasks);

        chrome.runtime.sendMessage({todo: todo.tasks[currentTodoId]}).catch();
        addMenu.classList.toggle("on");

    })
})

save.addEventListener("click", function (){
    var title = document.getElementById("title").value 
    var tag = document.getElementById("tag").value 
    var description = document.getElementById("description").value 
    var due = document.getElementById("taskDueDate").value

    if(title == "" ||  description == "" || due == ""){
        alert("invalid input")
        return;
    }
    chrome.storage.local.get(['todo'], function (result) {
        let todo = result.todo;
        //console.log(todo);
        task_id = todo.count + 1;
        todo.count++;
        todo.tasks[task_id] = {ID: task_id, TITLE: title, DESCRIPTION: description, DUE: due,TAG : tag, STATUS: false };
        chrome.storage.local.set({ todo: todo });
        renderTable(todo.tasks);

        chrome.runtime.sendMessage({todo: todo.tasks[task_id]}).catch();
        addMenu.classList.remove("on");

    })
})

function toggleEditBox(){
    addMenu.classList.toggle("on");
}

// reset fields after adding task
function clearText()  
{
    document.getElementById("title").value = "";
    document.getElementById("tag").value = "";
    document.getElementById("description").value = "";
    document.getElementById("taskDueDate").value = "";
}

// clear all tasks listener
document.getElementById("clearTodo").addEventListener("click", function() {
    resetTodo();
})

document.getElementById("resetFilter").addEventListener("click",resetFilter)

function resetTodo(){
    chrome.storage.local.set({todo: {count: 0, tasks: {}}});
    renderTable({});
}

document.getElementById("search").addEventListener("input", filter)
document.getElementById("selectDate").addEventListener("input", filter)

function filter() {
    chrome.storage.local.get(["todo"], function(result) {
        let e = document.getElementById("search").value;
        let d = document.getElementById("selectDate").value;

        let filtered = {};

        let todo = result.todo;

        for (task in todo.tasks) {
            if ((todo.tasks[task]["TITLE"].toLowerCase().match(e.toLowerCase()) || todo.tasks[task]["DESCRIPTION"].toLowerCase().match(e.toLowerCase())) && todo.tasks[task]["DUE"].slice(0, 10).match(d)) {
                filtered[task] = todo.tasks[task];
            }
        }

        let msg = document.getElementById("search_error")
        if(Object.keys(filtered).length == 0){
            msg.innerHTML = "NO MATCHES FOUND"
            renderTable({})
        } else {
            msg.innerHTML = ""
            renderTable(filtered)
        }

    })
}

function resetFilter(){
    location.reload();
}

// document.getElementById("search").addEventListener("input", function (e){
//     chrome.storage.local.get(["todo"], function(result){
//         let e = document.getElementById("search").value
//         filtered = {}
//         let todo = result.todo
//         //console.log(e)
//         for (let task in todo.tasks) {
//             if (todo.tasks[task]["TITLE"].match(e)){
//                 filtered[task] = todo.tasks[task]
//             }
//         }
//         //console.log(filtered)
//         let msg = document.getElementById("search_error")
//         if(Object.keys(filtered).length == 0){
//             msg.innerHTML = "NO MATCHES FOUND"
//         } else {
//             msg.innerHTML = ""
//             renderTable(filtered)
//         }
//     })
// })



// // *** for testing getTodos - need to edit some code in index.html file in order to run the following line of code ***
// document.getElementById('close').addEventListener('click', (evt) => getTodos("a", false));

// function getTodos(keyword = undefined, doneOnly = false, date = undefined, evt) {
//     // todos - store list of the todo that match with keyword and date defined, or when need only done object to be included
//     let todos = []

//     chrome.storage.local.get(['todos'], result => {

//         for (todo of result['todos']) {

//             if (keyword && !includes(todo, keyword)) continue;

//             if (doneOnly && todo.status) continue;

//             if (date && !sameDate(todo.date, date)) continue;

//             todos.push(todo);
//         }

//         sortTodoList(todos, 'title');

//         // *** use to test if this work (can be removed) ***
//         for (todo of todos) {
//             console.log(todo.title, todo.date, todo.status);
//         }

//         // *** Call function for display todo list - EXAMPLE ***
//         // *** display(todos); ***
//     })
// }

// // **** ----------------------------------------------- TEST ----------------------------------------------------------- ****


// // *** use for testing if the getTodos function work - need to be rewrite to make it works when add only one todo per time. ***

// // *** for testing and run addTodos and getTodos - need to edit some code in index.html file in order to run the following line of code***
// document.getElementById('save').addEventListener('click', addTodos)

// function addTodos() {
//     class ToDo {
//         title = '';
//         description = '';
//         date = '';
//         tag = '';
//         status = false; // inactive or done

//         constructor(title, description, date, tag, status) {
//             this.title = title;
//             this.description = description;
//             this.date = date;
//             this.tag = tag;
//             this.status = status;
//         }
//     }

//     let t1 = new ToDo('abce', 'j', '2024-01-04', 'lplp', false);

//     let t2 = new ToDo('aako', 'ojo', '2024-01-04', 'lplp', true);
//     let t3 = new ToDo('polo', 'j', '2022-06-21', 'lplp', false);
//     let t4 = new ToDo('bbce', 'ojo', '2022-06-21', 'lplp', false);
//     let t5 = new ToDo('AAkop', 'ojo', '2003-06-13', 'lplp', true);
//     let t6 = new ToDo('bari', 'ojo', '2024-05-24', 'lplp', true);

//     let todos = [t1, t2, t3, t4, t5, t6];

//     chrome.storage.local.set({ 'todos': todos }, () => {
//         console.log(typeof (todos));
//     });
// }