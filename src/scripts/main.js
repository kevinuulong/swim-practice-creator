sessionStorage.getItem('file') && loadSwim();

document.addEventListener('open', () => {
    let path = sessionStorage.getItem('path');
    try {
        preLoad();
    } catch { };
    loadFromFile(path);
})

document.addEventListener('new', () => {
    let path = sessionStorage.getItem('path');
    try {
        preLoad();
    } catch { };
    loadFromFile(path);
})

function select() {
    if (sessionStorage.getItem('selection') === 'true') {
        let x = sessionStorage.getItem('x');
        let y = sessionStorage.getItem('y');
        document.elementFromPoint(x, y).click();
        sessionStorage.setItem('x', x);
        sessionStorage.setItem('y', y);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'p') {
        window.print();
    }
    if (e.ctrlKey && e.key === 's') {
        save();
    }
    if (e.ctrlKey && e.key === 'n') {

    }
})

function preLoad() {
    document.getElementById("body").textContent = null;
    document.getElementById("total").remove();
    document.querySelectorAll('.tag').forEach((tag) => {
        tag.remove();
    })
}

function save() {
    document.activeElement.blur();
    if (document.querySelector('.selected')) sessionStorage.setItem('selection', true);
    else sessionStorage.setItem('selection', false);
    preLoad();
    loadSwim();
    select();
}

function listeners() {
    document.querySelectorAll(".clickable").forEach((element) => {
        element.addEventListener('click', (e) => {
            sessionStorage.setItem('x', e.pageX);
            sessionStorage.setItem('y', e.pageY);
            if (document.querySelector(".selected") != element) {
                try {
                    document.querySelector(".selected").classList.toggle('selected');
                } catch { }
                element.classList.toggle('selected');
            } else {
                document.querySelector(".selected").classList.toggle('selected');
                sessionStorage.setItem('selection', false);
            }
            loadOptions();
        })
    })
}

function loadOptions() {
    document.getElementById("sidebar").textContent = null;
    let selected = document.querySelector(".selected");
    if (selected) {

        if (selected.id === 'meta') {
            createSidebarField('Title', 'text', document.getElementById("title").textContent);
            createSidebarField('Date', 'text', document.getElementById("date").textContent);
            let tags = '';
            document.querySelectorAll('.tag').forEach((tag) => {
                tags += tags === '' ? tag.textContent : `, ${tag.textContent}`;
            })
            createSidebarField('Tags', 'text', tags)

        }
        if (selected.nodeName === 'H2') {
            createSidebarField('Section Title', 'text', selected.textContent);
        }

        if (selected.classList.contains('exercise')) {
            let numbers = selected.querySelector(".details").textContent.match(/\d+/g);
            let stroke = selected.querySelector(".details").textContent.match(/[a-zA-Z]+/g)[1];
            let repetitions = parseInt(numbers[0]);
            let distance = parseInt(numbers[1]);
            let description = selected.querySelector(".description").textContent;
            createSidebarField('Repetitions', 'number', repetitions)
            createSidebarField('Distance', 'number', distance);
            createSidebarField('Stroke', 'text', stroke);
            createSidebarField('Description', 'text', description);
        }
        unFocusListeners();
    }

}

function unFocusListeners() {
    document.querySelectorAll('input').forEach((elem) => {
        elem.addEventListener('focusout', () => {
            let data = JSON.parse(sessionStorage.getItem('file'));

            if (document.querySelector('.selected').nodeName === 'H2') {
                let i = 0;
                let selected;
                document.querySelectorAll('h2').forEach((h2) => {
                    if (h2.classList.contains('selected')) selected = i;
                    i++;
                })
                if (elem.dataset.prev != elem.value) {
                    data.body[selected][elem.value] = data.body[selected][elem.dataset.prev];
                    delete data.body[selected][elem.dataset.prev];
                }
            }

            if (document.querySelector('.selected').id === 'meta') {
                if (elem.title === 'Title') {
                    data.title = elem.value;
                }
                if (elem.title === 'Date') {
                    data.date = elem.value.replace(/\//g, '-');
                }
                if (elem.title === 'Tags') {
                    data.tags = elem.value.split(/, /);
                    if (elem.value.replace(/\s/g, '') === "") delete data.tags;
                }
            }

            if (document.querySelector('.selected').classList.contains('exercise')) {
                let h2 = document.querySelector('.selected').previousElementSibling;
                let depth = -1;
                while (h2.nodeName != 'H2') {
                    h2 = h2.previousElementSibling;
                    depth++;
                }
                let index = Array.prototype.indexOf.call(document.querySelectorAll('h2'), h2);
                let section = data.body[index][h2.textContent];
                let exercise = section[depth];

                if (elem.title === 'Repetitions') {
                    exercise.repetitions = elem.value;
                }
                if (elem.title === 'Distance') {
                    exercise.distance = elem.value;
                }
                if (elem.title === 'Stroke') {
                    exercise.stroke = elem.value;
                }
                if (elem.title === 'Description') {
                    exercise.description = elem.value;
                }
            }

            sessionStorage.setItem('file', JSON.stringify(data));
            save();
        })
    })
}

function addSection() {
    let fileContents = JSON.parse(sessionStorage.getItem('file'));
    let position = fileContents.body;
    if (!document.querySelector('.selected')) {
        position.push({ "Untitled Section": [] });
    } else {
        let i = 0;
        let selected;
        let moved;

        if (document.querySelector('.selected').classList.contains('exercise')) {
            let depth = -1;
            let h2 = document.querySelector('.selected').previousElementSibling;
            while (h2.nodeName != 'H2') {
                h2 = h2.previousElementSibling;
                depth++;
            }
            let index = Array.prototype.indexOf.call(document.querySelectorAll('h2'), h2);
            let section = fileContents.body[index][h2.textContent];
            moved = section.splice(depth + 1);
            console.log(depth);
            console.log(moved);
            selected = depth;
        }

        document.querySelectorAll('h2').forEach((h2) => {
            if (h2.classList.contains('selected')) selected = i;
            i++;
        })
        // if (!selected) {

        // }
        console.log(i, selected);
        if (moved) {
            position.splice(selected + 1, 0, { "Untitled Section": moved });
        } else {
            position.splice(selected + 1, 0, { "Untitled Section": [] });
        }
    }

    console.log(fileContents);
    sessionStorage.setItem('file', JSON.stringify(fileContents));
    saveFile();
}

// Does not like to work if adding to a section that already has an exercise
// Need to fix this issue
function addExercise() {
    let fileContents = JSON.parse(sessionStorage.getItem('file'));

    if (!document.querySelector('h2')) return;

    let h2;
    let depth;
    if (document.querySelector('.selected')) {
        if (document.querySelector('.selected').nodeName != 'H2') {
            depth = -1;
            h2 = document.querySelector('.selected').previousElementSibling;
            while (h2.nodeName != 'H2') {
                h2 = h2.previousElementSibling;
                depth++;
            }
        } else {
            h2 = document.querySelector('.selected');
        }
    } else {
        let h2s = document.querySelectorAll('h2');
        console.log(h2s);
        h2 = h2s[h2s.length - 1];
        depth = 0;
        let j = h2.nextElementSibling.nextElementSibling;
        while (j && j.classList.contains('exercise')) {
            j = j.nextElementSibling;
            depth++;
        }
        console.log(depth);

    }
    let index = Array.prototype.indexOf.call(document.querySelectorAll('h2'), h2);
    let section = fileContents.body[index][h2.textContent];
    section.splice(depth + 1, 0, {
        repetitions: 1,
        distance: 100,
        stroke: "",
        description: "",
        cycle: null
    });

    sessionStorage.setItem('file', JSON.stringify(fileContents));
    saveFile();
}

function saveFile() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }));
}

function createSidebarField(title, type, value = "") {
    let titleElem = document.createElement('h3');
    titleElem.textContent = title;
    document.getElementById("sidebar").appendChild(titleElem);

    let inputElem = document.createElement('input');
    inputElem.type = type;
    inputElem.value = value;
    inputElem.dataset.prev = value;
    inputElem.title = title;
    document.getElementById("sidebar").appendChild(inputElem);
}

// Set the title
function setTitle(title) {
    document.getElementById("title").innerText = title;
    document.title = title;
}

// Set the date
function setDate(date) {
    date = date.replace(/-/g, '/');
    document.getElementById("date").innerText = date;
}

// Tags
function setTags(tags) {
    tags.forEach(tag => {
        let elem = document.createElement('p');
        elem.className = "tag";
        elem.textContent = tag;
        document.getElementById("meta").appendChild(elem);
    });
}

// Create an exercise
function createExercise(data) {
    let repetitions = data.repetitions ? data.repetitions : 1;
    let distance = data.distance ? data.distance : 100;
    let stroke = data.stroke ? data.stroke : "";
    let description = data.description ? data.description : "";
    let cycle = data.cycle ? data.cycle : null;
    let i = data.i;

    let exercise = document.createElement('div');
    exercise.classList.add('exercise', 'clickable');

    let number = document.createElement('p');
    number.className = "number";
    number.innerText = `${i}.`;
    exercise.appendChild(number);

    let details = document.createElement('p');
    details.className = "details";
    details.innerText = `${repetitions} x ${distance} ${stroke}`;
    exercise.appendChild(details);

    let descriptionElem = document.createElement('p');
    descriptionElem.className = "description";
    descriptionElem.innerText = cycle ? `@${cycle} ${description}` : description;
    exercise.appendChild(descriptionElem);

    document.getElementById("body").appendChild(exercise);

    return repetitions * distance;
}

// Create a section
function createSection(sectionTitle) {
    let title = document.createElement('h2');
    title.textContent = sectionTitle;
    title.classList.add('clickable');
    document.getElementById("body").appendChild(title);

    let distance = document.createElement('p');
    distance.className = "distance";
    document.getElementById("body").appendChild(distance);
}

async function loadFromFile(file) {
    sessionStorage.setItem('path', file);
    const content = await fetch(file)
        .then(res => res.json())
        .then(res => {
            // Store in the session storage
            sessionStorage.setItem('file', JSON.stringify(res));
            loadSwim();
        });
}

function loadSwim() {
    let swim = JSON.parse(sessionStorage.getItem('file'));

    // Set the title
    try {
        setTitle(swim.title);
    } catch { }

    // Set the date
    try {
        setDate(swim.date);
    } catch { }

    // Tags
    try {
        setTags(swim.tags);
    } catch { }

    // Set sections
    let total = 0;
    swim.body.forEach(section => {
        let sectionTitle = Object.keys(section)[0];
        createSection(sectionTitle);

        let sectionTotal = 0;

        // Create exercises
        let i = 1;
        section[sectionTitle].forEach(data => {
            data.i = i;
            sectionTotal += createExercise(data);
            i++;
        })

        let distances = document.querySelectorAll(".distance:not(#total)")
        distances[distances.length - 1].textContent = `${sectionTotal} ${swim.measurement}.`;
        total += sectionTotal;
    })

    // Compute total distance
    let totalDistance = document.createElement('p');
    totalDistance.className = "distance";
    totalDistance.id = "total";
    totalDistance.textContent = `${total} ${swim.measurement}.`;

    document.querySelector(".page").appendChild(totalDistance);
    listeners();
}