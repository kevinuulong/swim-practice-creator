// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const fs = require('fs');
const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') save();
        if (e.ctrlKey && e.key === 'o') open();
        if (e.ctrlKey && e.key === 'n') createNew();
    })
})

ipcRenderer.on('file', (event, data) => {
    const openEvent = new Event('open');
    data && sessionStorage.setItem('path', data[0]);
    data && document.dispatchEvent(openEvent);
})

ipcRenderer.on('new', (event, data) => {
    if (data) {
        let fileContents = JSON.stringify({
            version: 1,
            date: getDate(),
            title: "Untitled Practice",
            measurement: "yds",
            body: []
        });
        let filePath = data;
        sessionStorage.setItem('path', filePath);
        sessionStorage.setItem('file', fileContents);
        fs.writeFileSync(filePath, fileContents);
        const newEvent = new Event('new');
        document.dispatchEvent(newEvent);
    }


})

ipcRenderer.on('print', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'p',
        ctrlKey: true
    }))
})

ipcRenderer.on('newSection', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 's'
    }))
})

ipcRenderer.on('newExercise', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'x'
    }))
})

function getDate() {
	const d = new Date();
	let year = d.getFullYear();
	let month = (d.getMonth() + 1).toLocaleString('en-US', {
		minimumIntegerDigits: 2,
		useGrouping: false
	});
	let day = d.getDate().toLocaleString('en-US', {
		minimumIntegerDigits: 2,
		useGrouping: false
	});

	return `${year}-${month}-${day}`;
}

function save() {
    let filePath = sessionStorage.getItem('path');
    let fileContents = sessionStorage.getItem('file');
    fs.writeFileSync(filePath, fileContents);
}

function open() {
    ipcRenderer.send('open');
}

function createNew() {
    ipcRenderer.send('new');
}