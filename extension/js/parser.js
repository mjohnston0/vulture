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

            if (element.TYPE === 'REGEX'){
                let reg = new RegExp(element.VALUE);
                if(reg.exec(url) != null){
                    return true;
                }
            }
        }
    }

    return false

}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'confirmTask') {
        chrome.storage.local.get(['todo'], function (result) {
        let todo = result.todo;
        let task_id = todo.count + 1;
        todo.count++;
        let today = new Date();
        today = today.setDate(today.getDate() + 1);
        let due = new Date(today);
        todo.tasks[task_id] = { ID: task_id, TITLE: message.title, DESCRIPTION: message.selectedText + "<br>" + message.taskUrl, DUE: due.toISOString().slice(0,-8), TAG: "DEFAULT", STATUS: false };
        chrome.storage.local.set({ todo: todo });
        
        alert(`Task added for: \n ${message.selectedText}?`);
    });
}
});
