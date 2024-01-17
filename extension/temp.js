document.addEventListener("DOMContentLoaded", function() {
    chrome.storage.local.get(["index"], function(result) {
        if (result.index && result.index.length > 0) {
            displayUrls(result.index);
        } else {
            displayNoUrlsMessage();
        }
    });
});

function displayUrls(urls) {
    var urlsContainer = document.getElementById("urlsContainer");
    var ul = document.createElement("ul");
    urls.forEach(function(url) {
        var li = document.createElement("li");
        li.textContent = url;
        ul.appendChild(li);
    });
    urlsContainer.appendChild(ul);
}

function displayNoUrlsMessage() {
    var urlsContainer = document.getElementById("urlsContainer");
    var message = document.createElement("p");
    message.textContent = "No URLs found.";
    urlsContainer.appendChild(message);
}
