chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.get(['todo'], function(result) {
        if (!result.todo) {
            let todo = {count: 0, tasks: []};
            chrome.storage.local.set({todo: todo});
        }
    });
});