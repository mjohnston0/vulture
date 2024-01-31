document.addEventListener("DOMContentLoaded", function() {
    chrome.storage.local.get(["index"], function(result) {
        if (Object.keys(result.index).length > 0) {
            displayUrls(result.index);
        } else {
            displayNoUrlsMessage();
        } 
    });
});

function displayUrls(dict) {
    var urlsContainer = document.getElementById("urlsContainer");
    var ul = document.createElement("ul");
    for (let key of Object.keys(dict)){
        var li = document.createElement("li");
        li.textContent = key;
        li.style.fontWeight = "bold";
        ul.appendChild(li);
        for (let url of dict[key]) {
            var li = document.createElement("li");
            li.textContent = url;
            ul.appendChild(li);
        }
    }
    urlsContainer.appendChild(ul);
}

function displayNoUrlsMessage() {
    var urlsContainer = document.getElementById("urlsContainer");
    var message = document.createElement("p");
    message.textContent = "No URLs found.";
    urlsContainer.appendChild(message);
}


document.getElementById('clear-urls').addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all indexed URLs?\nThis is permanent and cannot be undone.')) {
        chrome.storage.local.get(['index'], function(result) {
            let index = result.index;
            index = {};
            chrome.storage.local.set({index: index});
        })
    }
});