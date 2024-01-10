chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.get(['todoList'], function(result) {
        if (!result.todoList) {
            let todoList = {};
            chrome.storage.sync.set({todoList: todoList});
        }
    });
});