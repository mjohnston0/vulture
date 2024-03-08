let taskView;
document.addEventListener("DOMContentLoaded", function() {
  let todoButton = document.querySelector(".tab-item");
  let preferencesButton = document.getElementById('pref-icon-wrapper');


  taskView = document.querySelector(".task-view");
    chrome.storage.local.get(["todo"], function (result) {
        if (result.todo) {
            renderTable(result.todo.tasks);
        } else {
            return;
        }
    });

  document.getElementById('task_filter').addEventListener('change', function() {
    drawTable();
  });
  
})

function drawTable() {
  chrome.storage.local.get(["todo"], function (result) {
      renderTable(result.todo.tasks);
  })
}

  function renderTable(tasksDict) {
    var table = document.getElementById("todo_table")
    table.innerHTML = '<thead><tr class="table-header"><th id="tbl-title">Title</th><th id="tbl-description">Description</th><th id="tbl-due">Due time</th><th id="tbl-tag">Tag</th><th id="tbl-status">Status</th</tr><thead>'
    let tbody = document.createElement('tbody');
    table.appendChild(tbody);
    let tasks = sortTasks(tasksDict);

    let filter_option = document.getElementById('task_filter').value;

    let toShow = []

    const beignTargetDate = new Date().setHours(0, 0, 0, 0);
    let endTargetDate = new Date();
    switch (filter_option) {
      case 'today':
        break;
      case '7days':
        endTargetDate.setDate(endTargetDate.getDate() + 6);
        break;
      case '30days':
        endTargetDate.setDate(endTargetDate.getDate() + 29);
        break;
    }

    for (let entry of tasks) {
      let task = entry[1];
      let taskDate = new Date(task.DUE).setHours(0, 0, 0, 0);
      if (beignTargetDate <= taskDate && taskDate <= endTargetDate.setHours(0, 0, 0, 0) && !task.STATUS) {
        toShow.push(entry);
      }
    }

    for (let entry of toShow) {
      let taskID = entry[0];
      let task = entry[1];

        var row = tbody.insertRow()
        row.addEventListener('click', function(e) {
          console.log(e.target);
          if (e.target.tagName.toLowerCase() === 'td') {
            openTaskView(task);;
          } else {
            return;
          }
        })
        var titleCell = row.insertCell()
        titleCell.innerHTML = task.TITLE

        var descCell = row.insertCell()
        descCell.id = 'data-des';
        descCell.innerHTML = task.DESCRIPTION

        var dueCell = row.insertCell()
        dueCell.innerHTML = task.DUE.slice(-5) + " " + task.DUE.slice(8, 10) + "/" + task.DUE.slice(5, 7)

        var tagCell = row.insertCell()
        tagCell.innerHTML = task.TAG

        var toggle = document.createElement('label');
        toggle.classList.add('status-toggle')
        var span = document.createElement('span');

        var statusCell = row.insertCell()
        var statusBox = document.createElement('input')
        statusBox.type = "checkbox"
        if (task.STATUS == true) {
            statusBox.checked = true;
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
        toggle.appendChild(statusBox);
        toggle.appendChild(span);

        statusCell.appendChild(toggle)
    }
  }

function sortTasks(taskDict) {
  let entries = Object.entries(taskDict);

  entries.sort(function compare(task1, task2) {
      return new Date(task1[1]['DUE']) - new Date(task2[1]['DUE'])
  })
  return entries;
}

function openTaskView(task) {
  document.getElementById('task-view-name').innerText = task.TITLE;
  document.getElementById('task-view-description').innerText = task.DESCRIPTION;
  document.getElementById('task-view-due').innerText = new Date(task.DUE).toLocaleString();
  document.getElementById('task-view-tag').innerText = task.TAG;

  taskView.style.display = 'flex';

  document.getElementById('close-task').addEventListener('click', function() {
    closeTaskView();
  })
}

function closeTaskView() {
  taskView.style.display = 'none';
}
