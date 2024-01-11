chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.get(['todo'], function(result) {
        if (!result.todo) {
            let todo = [];
            chrome.storage.local.set({todo: {count: 0, tasks: {}}});
            console.log("create todo")
        }
    });
});