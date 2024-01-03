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
    let day1 = date1.getDay();
    let month1 = date1.getMonth();
    let year1 = date1.getFullYear();

    let day2 = date2.getDay();
    let month2 = date2.getMonth();
    let year2 = date2.getFullYear();

    return ((day1 === day2) && (month1 === month2) && (year1 === year2)) ? true: false;
}

function queryTodo(todos, keyword = null, doneOnly = false, date = undefined) {
    var qtodos = []

    console.log(doneOnly, keyword);

    for (todo of todos) {
        
        if (keyword && !includes(todo, keyword)) continue;

        if (doneOnly && todo.status) continue;

        if (date && !sameDate(todo.date, date)) continue;

        qtodos.push(todo);
    }

    return qtodos;
}


// ----------------------------------------------- TEST -----------------------------------------------------------

class ToDo {
    title = '';
    description = '';
    date = Date();
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

let t1 = new ToDo('abce', 'j', new Date(), 'lplp', false);

let t2 = new ToDo('aako', 'ojo', new Date(), 'lplp', true);
let t3 = new ToDo('polo', 'j', new Date('06/21/2022'), 'lplp', false);
let t4 = new ToDo('bbce', 'ojo', new Date('06/21/2022'), 'lplp', false);
let t5 = new ToDo('aakop', 'ojo', new Date('06/12/2003'), 'lplp', true);
let t6 = new ToDo('bari', 'ojo', new Date('06/10/2024'), 'lplp', false);

var todos = [t1, t2, t3, t4, t5, t6];

// for (todo of todos) {
//     console.log(todo.title);
// }

// sortTodoList(todos, 'date')

// console.log('\n');

// for (todo of todos) {
//     console.log(todo.title, todo.date);
// }

var qtodos = queryTodo(todos, 'aa', true, new Date('06/12/2003'));

for (todo of qtodos) {
    console.log(todo.title, todo.date);
}

// function sortTodoList(todos) {
//     todos.sort((todo1, todo2) =>
//         todo1.title.localeCompare(todo2.title) || new Date(todo1.date).getTime() - new Date(todo2.date).getTime()
//     );
// }