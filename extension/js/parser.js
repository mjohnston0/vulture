window.onload = async function () {

    let url = window.location.href;
    let text = document.body.innerText.toLowerCase();

    let keywords = text.split(/\s+/);

    let keywordSet = new Set(keywords);

    if (await allow()) {
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

            chrome.storage.local.set({ "index": index });
        })
    }
    else {
        console.log("FALSE");
    }
}

async function allow() {
    const result = await chrome.storage.local.get(['allowlist']);

    let allowlist = result.allowlist;

    let site = allowlist.site;
    let page = allowlist.page;
    let regex = allowlist.regex;

    let domain = window.location.hostname;
    let url = window.location.href;

    for (s of site) {
        if (domain.localeCompare(s) === 0) return true;
    }

    for (p of page) {
        if (url.localeCompare(p) === 0) return true;
    }

    for (r of regex) {
        if (regex.match(r)) return true;
    }

    return false;
}