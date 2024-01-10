document.addEventListener("DOMContentLoaded", function() {
    chrome.storage.local.get(["todo"], function(result) {
        if (result.todo) {
            renderTable(result.todo.tasks);
        } else {
            console.error("No todoList found.");
        }
    });
});

function renderTable(tasks){
    var table = document.getElementById("todo_table")
    table.innerHTML = "<tr><td>Title</td><td>Description</td><td>Due time</td><td>Edit</td><td>Status</td><td>Delete</td></tr>"
    for (let entry in tasks) {
        var row = table.insertRow()
        var titleCell = row.insertCell()
        titleCell.innerHTML = tasks[entry].TITLE
        var descCell = row.insertCell()
        descCell.innerHTML = tasks[entry].DESCRIPTION
        var timeCell = row.insertCell()
        timeCell.innerHTML = tasks[entry].TIME
        var editCell = row.insertCell()
        editCell.innerHTML = "EDIT"
        var statusCell = row.insertCell()
        statusCell.innerHTML = tasks[entry].STATUS
        var deleteCell = row.insertCell();
        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete Task';
        deleteButton.addEventListener('click', function() {
            deleteTask(entry);
        });
        deleteCell.appendChild(deleteButton);
    }
}

// delete task based on ID
function deleteTask(id) {
    chrome.storage.local.get(['todo'], function (result) {
        let todo = result.todo;
        delete todo.tasks[id];
        chrome.storage.local.set({todo: todo});
        renderTable(todo.tasks);
    })
}

// edit task
function editTask() {
    console.log("EDITED");
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


// add task listener
document.getElementById("addTask").addEventListener("click", function () {
    let title = document.getElementById("taskTitle").value;
    let due = document.getElementById("taskDue").value;
    chrome.storage.local.get(['todo'], function (result) {
        let todo = result.todo;
        console.log(todo);
        task_id = todo.count + 1;
        todo.count++;
        todo.tasks[task_id] = {TITLE: title, DESCRIPTION: "test", TIME: due, STATUS: false };
        chrome.storage.local.set({ todo: todo });
        clearText();
        renderTable(todo.tasks);
    })
})

// reset fields after adding task
function clearText()  
{
    document.getElementById('taskTitle').value = "";
    document.getElementById('taskDue').value = "";
}  

// clear all tasks listener
document.getElementById("clearTodo").addEventListener("click", function() {
    chrome.storage.local.set({todo: {count: 0, tasks: {}}});
    renderTable({});
})

document.getElementById("search").addEventListener("input", function (e){
    chrome.storage.local.get(["todo"], function(result){
        let e = document.getElementById("search").value
        filtered = {}
        let todo = result.todo
        console.log(e)
        for (let task in todo.tasks) {
            if (todo.tasks[task]["TITLE"].match(e)){
                filtered[task] = todo.tasks[task]
            }
        }
        console.log(filtered)
        let msg = document.getElementById("search_error")
        if(Object.keys(filtered).length == 0){
            msg.innerHTML = "NO MATCHES FOUND"
        } else {
            msg.innerHTML = ""
            renderTable(filtered)
        }
    })
})

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