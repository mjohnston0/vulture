import { DEFAULT_ALLOWLIST_SITE, DEFAULT_ALLOWLIST_PAGE, DEFAULT_ALLOWLIST_REGEX } from "./allowlist.js";

chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.get(['todo'], function(result) {
        if (!result.todo) {
            chrome.storage.local.set({todo: {count: 0, tasks: {}}});
            console.log("create todo")
        }
    });

    chrome.storage.local.get(['index'], function(result) {
        if (!result.index) {
            chrome.storage.local.set({index: {}});
            console.log("Create index");
        }
    });

    chrome.storage.local.get(['allowlist'], function(result) {
        if (!result.allowlist) {
            let list = {};
            let count = 0;

            DEFAULT_ALLOWLIST_SITE.forEach(((element) => {
                list[count] = {ID: count, VALUE: element, TYPE: 'SITE', IS_ACTIVE: true};
                count++;
            }))

            DEFAULT_ALLOWLIST_PAGE.forEach(((element) => {
                list[count] = {ID: count, VALUE: element, TYPE: 'PAGE', IS_ACTIVE: true};
                count++;
            }))

            DEFAULT_ALLOWLIST_REGEX.forEach(((element) => {
                list[count] = {ID: count, VALUE: element, TYPE: 'REGEX', IS_ACTIVE: true};
                count++;
            }))

            chrome.storage.local.set({allowlist: {'count': count, 'list': list}})
            console.log("create allowlist");
        }
    })
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.todo) {
        let todo = request.todo;
        let date = new Date(todo.DUE);

        date.setDate(date.getDate() - 1)
        chrome.alarms.create(todo.ID.toString(), { when: new Date(date).getTime()});
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