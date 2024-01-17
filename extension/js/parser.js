
// on load save entry
window.onload = function() {

    let url = window.location.href;
    let text = document.body.innerText.toLowerCase();

    let keywords = text.split(/\s+/);

    let keywordSet = new Set(keywords);

    chrome.storage.local.get(['index'], function (result) {
        console.log(result);
        let newIndex = result;
        for (let kw of keywordSet.keys()) {
            kw = kw.replace(/[^a-z']/g, '');
            kw = kw.replace(/^'|'$/g, '');
            if (kw != '') {
                if (kw in newIndex) {
                    if (!url in newIndex[kw]) {
                        newIndex[kw].push(url);
                    }
                } else {
                    newIndex[kw] = [url];
                }  
            }
        }

        chrome.storage.local.set({"index": newIndex});
    })


    chrome.storage.local.get(['index']), function (result) {
        console.log(result.index);
    }
}
