chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.get(['todo'], function (result) {
        if (!result.todo) {
            let todo = { count: 0, tasks: {} };
            chrome.storage.local.set({ todo: todo });
        }
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.todo) {
        let todo = request.todo;
        chrome.alarms.create(todo.ID.toString(), { when: new Date(todo.DUE).getTime() });
    }
})

chrome.alarms.onAlarm.addListener((alarm) => {
    chrome.storage.local.get((result) => {
        let todo = result.todo.tasks[alarm.name];

        if (todo) {

            chrome.notifications.create(todo.ID.toString(), {
                type: 'basic',
                title: todo.TITLE,
                message: 'DUE ON: ' + todo.DUE,
                iconUrl: chrome.runtime.getURL('./assets/placeholder.png')
            })
        }
    })
})