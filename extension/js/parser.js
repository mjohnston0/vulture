window.onload = function() {

    let url = window.location.href;
    let text = document.body.innerText.toLowerCase();

    let keywords = text.split(/\s+/);

    let keywordSet = new Set(keywords);

    chrome.storage.local.get(['index'], function (result) {
        let index = result.index;
        for (let kw of keywordSet.keys()) {
            kw = kw.replace(/[^a-z']/g, '');
            kw = kw.replace(/^'|'$/g, '');
            if (kw != '') {
                if (index[kw]) {
                    if (!index[kw].includes(url)) {
                        index[kw].push(url);
                    } else {
                        index[kw].push(index[kw].splice(index[kw].indexOf(url), 1)[0]);
                    } 
                } else {
                    index[kw] = [url];
                }  
            }
        }

        chrome.storage.local.set({"index": index});
    })
}
