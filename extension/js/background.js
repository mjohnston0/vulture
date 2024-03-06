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

    chrome.storage.local.get(['tags'], function(result) {
        if (!result.tags) {
            chrome.storage.local.set({tags: {'DEFAULT': '#00A6DB'}})
        }
    })

    chrome.storage.local.get(['allowlist'], function(result) {
        if (!result.allowlist) {
            let list = {};
            let count = 0;

            DEFAULT_ALLOWLIST_SITE.forEach(((element) => {
                list[count] = {ID: count, VALUE: element, TYPE: 'DOMAIN', IS_ACTIVE: true};
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

    chrome.contextMenus.create({
        id: "1",
        title: "Vulture - Add to todo list",
        contexts: ["selection"],
    });    

        
    chrome.contextMenus.onClicked.addListener((info, tab) => {
        let selectedText = info.selectionText;
        let words = selectedText.split(" ").splice(0,5);
        let title = words.join(" ");
        let tabTitle = tab.title;
        let taskUrl = `<a class="task-url" href="${info.pageUrl}" target="_blank">${tabTitle}</a>`;
        chrome.storage.local.get(['todo'], function (result) {
            let todo = result.todo;
            let task_id = todo.count + 1;
            todo.count++;
            let today = new Date();
            today = today.setDate(today.getDate() + 1);
            let due = new Date(today);
            todo.tasks[task_id] = { ID: task_id, TITLE: title, DESCRIPTION: selectedText + "<br>" + taskUrl, DUE: due.toISOString().slice(0,-8), TAG: "DEFAULT", STATUS: false };
            chrome.storage.local.set({ todo: todo });
            chrome.tabs.sendMessage(tab.id, { action: 'taskAdded', selectedText: selectedText});
        });

        
    });
    

});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.todo) {
        let todo = request.todo;
        let date = new Date(todo.DUE);

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

chrome.omnibox.onInputChanged.addListener(omnibarHandler);
chrome.omnibox.onInputEntered.addListener( function(url){
    chrome.tabs.update({url: url});
    
});

function checkCondition(key, text) {
    if (key.toString() === (text.toString().toLowerCase())) {
        return true;
    }

    return false;
}

function intersectLists(lists) {
    if (lists.length === 0) return [];
    let result = lists[0].filter(element => {
      return lists.every(list => list.includes(element));
    });
  
    return result;
  }
  

function omnibarHandler(text, suggest) {
    chrome.storage.local.get(["index"], function (data) {
        let results = [];
        let urlList = [];
        if (text.includes(" ")) {
            let textList = text.split(" ");
            if(text.endsWith(" ")){
                textList = textList.slice(0, -1);
            }
            let nestedList = []
            textList.forEach(function(keyword){
                let tempList = []
                for (let key of Object.keys(data.index)) {
                    if (key.toString() === (keyword.toString().toLowerCase())) {
                        for (let url of data.index[key].reverse()) {
                            tempList.push(url)
                        }
                        nestedList.push(tempList)
                    }
                }
            })
            if(textList.length <= nestedList.length) urlList = intersectLists(nestedList)

        } else {
            for (let key of Object.keys(data.index)) {
                if (checkCondition(key, text.replace(/\s/g, ''))) {
                    for (let url of data.index[key].reverse()) {
                        urlList.push(url)
                    }
                }
            }

        }



        urlList.forEach(function(url){
            let suggestUrl = url
            if(suggestUrl.includes("&")){
                suggestUrl = suggestUrl.replace("&","&amp;")
            }
            results.push({
                content: suggestUrl,
                description: suggestUrl + " - Found keyword \"" + text.toString() + "\""
            });
        })


        if (results.length > 0) {
            chrome.omnibox.setDefaultSuggestion({ description: "Select an option below" });
        } else {
            chrome.omnibox.setDefaultSuggestion({ description: "No results found" });
        }

        suggest(results);
    });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "downloadJSON") {
      var url = 'data:application/json;base64,' + btoa(message.data);
      var currentDate = new Date();
      var dateString = currentDate.toISOString().split('T')[0]; 
      var fileNameWithDate = 'chrome_local_storage_backup_' + dateString + '.json';
  
      chrome.downloads.download({
        url: url,
        filename: fileNameWithDate
      });
      console.log("Local storage saved to downloads folder.")
    } else if (message.action === "importJSON") {
      var importedData = message.data;
      chrome.storage.local.clear(function() {
        chrome.storage.local.set(importedData, function() {
          console.log("Local storage overwritten with imported data.");
        });
      });
    }
  });
  


  
  