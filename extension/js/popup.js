let taskView;
let addMenu;
let save;
let cancel;
document.addEventListener("DOMContentLoaded", function() {
  let todoButton = document.querySelector(".tab-item");
  let preferencesButton = document.getElementById('pref-icon-wrapper');


  taskView = document.querySelector(".task-view");
  addMenu = document.querySelector('.editbox');
  save = document.querySelector('#add-task');
  cancel = document.querySelector('#cancel')

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

  document.getElementById('add-task-btn').addEventListener('click', function() {
    console.log("test");
    document.getElementById('layout').style.display = 'none';
    toggleAddBox();
  });

  save.addEventListener('click', function() {
    let title = document.getElementById('title').value;
    let tag = document.getElementById('selected-item').textContent;
    let description = document.getElementById('description').value;
    let due = document.getElementById('taskDueDate').value;

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

    addMenu.style.display = 'none';
    document.getElementById('layout').style.display = 'block';
  });

  cancel.addEventListener('click', function() {
    addMenu.style.display = 'none';
    document.getElementById('layout').style.display = 'block';
  });

    
  document.getElementById('dropdown-btn').onclick = function () {
    document.getElementById('dropdown-items').classList.toggle('open');
    updateTagList();
  }

  document.onclick = function (e) {
    if (!(e.target.closest('.ipt-tag') || e.target.closest('.item-btn'))) {
        document.getElementById('dropdown-items').classList.remove('open');
    }
  }
})

function toggleAddBox() {
  addMenu.style.display = 'block';
  updateTagList();
}


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
              updateTagList();
              return;
          }

          const result = await chrome.storage.local.get(['tags']);
          let tags = result.tags;

          if (name in tags) {
              if (!confirm("Tag already exists. Replace it?")) {
                  updateTagList();
                  return;
              }
          }

          tags[name] = document.getElementById('color-picker').value;

          await chrome.storage.local.set({ tags: tags });

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

