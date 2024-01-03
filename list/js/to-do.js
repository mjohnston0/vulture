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

function search() {
    console.log("HOHO");
}


// ----------------------------------------------- TEST -----------------------------------------------------------

class ToDo {
    title = '';
    description = '';
    date = Date();
    tag = '';
    status = false; // inactive

    constructor(title, description, date, tag, status) {
        this.title = title;
        this.description = description;
        this.date = date;
        this.tag = tag;
        this.status = status;
    }
}

let t1 = new ToDo('abce', 'ojo', new Date(), 'lplp', false);

let t2 = new ToDo('aakop', 'ojo', new Date(), 'lplp', false);
let t3 = new ToDo('polo', 'ojo', new Date('06/21/2022'), 'lplp', false);
let t4 = new ToDo('bbce', 'ojo', new Date('06/21/2022'), 'lplp', false);
let t5 = new ToDo('aakop', 'ojo', new Date('06/12/2003'), 'lplp', false);
let t6 = new ToDo('bari', 'ojo', new Date('06/10/2024'), 'lplp', false);

var todos = [t1, t2, t3, t4, t5, t6];

for (todo of todos) {
    console.log(todo.title);
}

sortTodoList(todos, 'date')

console.log('\n');

for (todo of todos) {
    console.log(todo.title, todo.date);
}

// function sortTodoList(todos) {
//     todos.sort((todo1, todo2) =>
//         todo1.title.localeCompare(todo2.title) || new Date(todo1.date).getTime() - new Date(todo2.date).getTime()
//     );
// }