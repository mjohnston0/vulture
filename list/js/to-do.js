function compareByDate(todo1, todo2) {
    date1 = new Date(todo1.date).getTime();
    date2 = new Date(todo2.date).getTime();

    if (date1 < date2) return -1;

    if (date1 > date2) return 1;

    return 0;
};

function sortTodoList(todos, by) {
    if (by === 'title') {
        todos.sort((todo1, todo2) =>
            todo1.title.localeCompare(todo2.title)
        );

    } else if (by === 'date') {
        todos.sort(compareByDate);
    }
}

function includes(todo, keyword) {
    return (todo.title.includes(keyword) || todo.description.includes(keyword)) ? true: false;
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

    return ((day1 === day2) && (month1 === month2) && (year1 === year2)) ? true: false;
}

// document.getElementById('close').addEventListener('click', (evt) => getTodos("a", false));

function getTodos(query=undefined, doneOnly=false, date=undefined, evt) {
    let todos = []

    chrome.storage.local.get(['todos'], result => {

        for (todo of result['todos']) {

            if (query && !includes(todo, query)) continue;

            if (doneOnly && todo.status) continue;

            if (date && !sameDate(todo.date, date)) continue;

            todos.push(todo);
        }

        sortTodoList(todos);

        for (todo of todos) {
            console.log(todo.title, todo.date);
        }

        // display(todos);
    })
}

// ----------------------------------------------- TEST -----------------------------------------------------------

// document.getElementById('save').addEventListener('click', addTodos)

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
    let t5 = new ToDo('aakop', 'ojo', '2003-06-13', 'lplp', false);
    let t6 = new ToDo('bari', 'ojo', '2024-05-24', 'lplp', false);
    
    let todos = [t1, t2, t3, t4, t5, t6];

    chrome.storage.local.set({'todos': todos}, () => {
        console.log(typeof(todos));
    });
}