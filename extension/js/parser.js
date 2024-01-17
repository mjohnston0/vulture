
// on load save entry
window.onload = function() {

    let url = window.location.href;
    let text = document.body.innerText.toLowerCase();

    let keywords = text.split(/\s+/);

    let keywordSet = new Set(keywords);

    chrome.storage.local.get(['index'], function (result) {
        console.log(result);
        let index = result.index;
        for (let kw of keywordSet.keys()) {
            kw = kw.replace(/[^a-z']/g, '');
            kw = kw.replace(/^'|'$/g, '');
            if (kw != '') {
                if (index[kw]) {
                    if (!index[kw].includes(url)) {
                        index[kw].push(url);
                    } //else move url to back of array
                } else {
                    index[kw] = [url];
                }  
            }
        }

        chrome.storage.local.set({"index": index});
    })


    chrome.storage.local.get(['index']), function (result) {
        console.log(result.index);
    }
}
