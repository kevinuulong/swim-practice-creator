// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const fs = require('fs');
const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') save();
        if (e.ctrlKey && e.key === 'o') open();
    })
})

ipcRenderer.on('file', (event, data) => {
    // This is not working right
    const openEvent = new CustomEvent('open', { filePath: data[0] });
    // console.log(data);
    data && sessionStorage.setItem('path', data[0]);
    data && document.dispatchEvent(openEvent);
})

function save() {
    let filePath = sessionStorage.getItem('path');
    let fileContents = sessionStorage.getItem('file');
    fs.writeFileSync(filePath, fileContents);
}

function open() {
    ipcRenderer.send('open');
}
