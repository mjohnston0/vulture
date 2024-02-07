navigation.addEventListener("navigate", async function() {

    let url = window.location.href;
    let text = document.body.innerText.toLowerCase();

    console.log(url);

    let keywords = text.split(/\s+/);

    let keywordSet = new Set(keywords);

    if (await isValid()) {
        console.log("TRUE");

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

            console.log(index);
            chrome.storage.local.set({ "index": index });
        })
    }
    else {
        console.log("FALSE");
    }
})

async function isValid() {
    const result = await chrome.storage.local.get(['allowlist']);

    let list = result.allowlist.list;

    let domain = window.location.hostname;
    let url = window.location.href;

    for (element of Object.values(list)) {

        console.log(element);

        if (element.IS_ACTIVE) {

            if (element.TYPE === 'DOMAIN' && element.VALUE.localeCompare(domain) === 0) return true;

            if (element.TYPE === 'PAGE' && element.VALUE.localeCompare(url) === 0) return true;

            if (element.TYPE === 'REGEX' && element.VALUE.match(url)) return true;

        }
    }

    return false

}