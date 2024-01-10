function addSavedEntries(){
    var table = document.getElementById("todo_table")
    var todoList = chrome.storage.local.get(["todoList"])

    for (var i = 0; i < todoList.length; i++) {
        var entry = todoList[i]
        var row = table.insertRow()
        var titleCell = row.insertCell()
        titleCell.innerHTML = entry.TITLE
        var descCell = row.insertCell()
        descCell.innerHTML = entry.DESCRIPTION
        var timeCell = row.insertCell()
        timeCell.innerHTML = entry.TIME
        var editCell = row.insertCell()
        editCell.innerHTML = "EDIT"
        var statusCell = row.insertCell()
        statusCell.innerHTML = entry.STATUS
        var deleteCell = row.insertCell()
        deleteCell.innerHTML = '<img src="../images/closeicon.png">'
    }
}
addSavedEntries()

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

// *** for testing getTodos - need to edit some code in index.html file in order to run the following line of code ***
document.getElementById('close').addEventListener('click', (evt) => getTodos("a", false));

function getTodos(keyword = undefined, doneOnly = false, date = undefined, evt) {
    // todos - store list of the todo that match with keyword and date defined, or when need only done object to be included
    let todos = []

    chrome.storage.local.get(['todos'], result => {

        for (todo of result['todos']) {

            if (keyword && !includes(todo, keyword)) continue;

            if (doneOnly && todo.status) continue;

            if (date && !sameDate(todo.date, date)) continue;

            todos.push(todo);
        }

        sortTodoList(todos, 'title');

        // *** use to test if this work (can be removed) ***
        for (todo of todos) {
            console.log(todo.title, todo.date, todo.status);
        }

        // *** Call function for display todo list - EXAMPLE ***
        // *** display(todos); ***
    })
}

// **** ----------------------------------------------- TEST ----------------------------------------------------------- ****


// *** use for testing if the getTodos function work - need to be rewrite to make it works when add only one todo per time. ***

// *** for testing and run addTodos and getTodos - need to edit some code in index.html file in order to run the following line of code***
document.getElementById('save').addEventListener('click', addTodos)

function addTodos() {
    class ToDo {
        title = '';
        description = '';
        date = '';
        tag = '';
        status = false; // inactive or done

        constructor(title, description, date, tag, status) {
            this.title = title;
            this.description = description;
            this.date = date;
            this.tag = tag;
            this.status = status;
        }
    }

    let t1 = new ToDo('abce', 'j', '2024-01-04', 'lplp', false);

    let t2 = new ToDo('aako', 'ojo', '2024-01-04', 'lplp', true);
    let t3 = new ToDo('polo', 'j', '2022-06-21', 'lplp', false);
    let t4 = new ToDo('bbce', 'ojo', '2022-06-21', 'lplp', false);
    let t5 = new ToDo('AAkop', 'ojo', '2003-06-13', 'lplp', true);
    let t6 = new ToDo('bari', 'ojo', '2024-05-24', 'lplp', true);

    let todos = [t1, t2, t3, t4, t5, t6];

    chrome.storage.local.set({ 'todos': todos }, () => {
        console.log(typeof (todos));
    });
}