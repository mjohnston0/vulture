async function parse_page() {

    let url = window.location.href;
    let text = document.body.innerText.toLowerCase();

    let keywords = text.split(/\s+/);

    let keywordSet = new Set(keywords);

    chrome.storage.local.get(['allowlist'], function(result) {
        let list = result.allowlist.list;

        let domain = window.location.hostname;
    
        for (element of Object.values(list)) {
    
            // console.log(element);
    
            if (element.IS_ACTIVE) {
    
                if (element.TYPE === 'DOMAIN' && element.VALUE.localeCompare(domain) === 0) parse(keywordSet, url);
    
                if (element.TYPE === 'PAGE' && element.VALUE.localeCompare(url) === 0) parse(keywordSet, url);
    
                if (element.TYPE === 'REGEX'){
                    let reg = new RegExp(element.VALUE);
                    if(reg.exec(url) != null){
                        
                        parse(keywordSet, url)
                    }
                }
            }
        }
    });

}

async function getIndex(){
    return chrome.storage.local.get(['index'])
}

async function parse(keywordSet, url) {
    let result = await getIndex();
    let index = result.index;
    for (let kw of keywordSet.keys()) {
        if (!kw){
            continue;
        }
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

    // console.log(index);
    chrome.storage.local.set({ "index": index });

}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'taskAdded') {
        alert(`Task added for: \n ${message.selectedText}`);
    }
});

navigation.addEventListener("navigate", parse_page());
document.addEventListener("DOMContentLoaded", parse_page())
