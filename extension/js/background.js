chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.get(['todoList'], function(result) {
        if (!result.todoList) {
            let todoList = [];
            chrome.storage.local.set({todoList: todoList});
        }
    });
});