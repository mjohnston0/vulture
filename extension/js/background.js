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
            chrome.storage.local.set({tags: {'DEFAULT': '#ffff'}})
        }
    })

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

chrome.omnibox.onInputChanged.addListener(omnibarHandler);
chrome.omnibox.onInputEntered.addListener( function(url){
    chrome.tabs.update({url: url});
    
});


function omnibarHandler(text, suggest) {
    chrome.storage.local.get(["index"], function(result) {
      let searchResult = [];
      for (let key of Object.keys(result.index)) {
        if(key.toString().startsWith(text.toString().toLowerCase()) || key.toString().includes(text.toString().toLowerCase())){
            for (let url of result.index[key]) {
                searchResult.push({
                    content:  url,
                    description: url + " - Found keyword \"" + text.toString() + "\""
                });
            }
        }
      }
    if (searchResult.length > 0) {
        chrome.omnibox.setDefaultSuggestion({description: "Select an option below"});
    } else {
        chrome.omnibox.setDefaultSuggestion({description: "No results found"})
    }
    suggest(searchResult);
    }
    );
  }
  


  
  