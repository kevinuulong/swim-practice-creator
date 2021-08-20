let practice = 'C:\\Users\\Kevin Long\\Documents\\GitHub\\swim-practice-formatter\\content\\2021-08-17.json';
// loadSwim(`/content/${practice}.json`);
loadSwim(practice);

document.addEventListener('keydown', (e) => {
    if (e.key === 'p' && e.ctrlKey) {
        window.print();
    }
})

function listeners() {
    document.querySelectorAll(".clickable").forEach((element) => {
        element.addEventListener('click', (e) => {
            if (document.querySelector(".selected") != element) {
                try {
                    document.querySelector(".selected").classList.toggle('selected');
                } catch { }
                element.classList.toggle('selected');
            } else {
                document.querySelector(".selected").classList.toggle('selected');
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
            console.log(elem.value);
        })
    })
}

function createSidebarField(title, type, value = "") {
    let titleElem = document.createElement('h3');
    titleElem.textContent = title;
    document.getElementById("sidebar").appendChild(titleElem);

    let inputElem = document.createElement('input');
    inputElem.type = type;
    inputElem.value = value;
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

async function loadSwim(swim) {
    const content = await fetch(swim)
        .then(res => res.json())
        .then(res => {

            // Store in the session storage before file save
            sessionStorage.setItem('file', JSON.stringify(res));

            // Set the title
            setTitle(res.title);

            // Set the date
            setDate(res.date);

            // Tags
            setTags(res.tags);

            // Set sections
            let total = 0;
            res.body.forEach(section => {
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
                distances[distances.length - 1].textContent = `${sectionTotal} ${res.measurement}.`;
                total += sectionTotal;
            })

            // Compute total distance
            let totalDistance = document.createElement('p');
            totalDistance.className = "distance";
            totalDistance.id = "total";
            totalDistance.textContent = `${total} ${res.measurement}.`;

            document.querySelector(".page").appendChild(totalDistance);
            listeners();
        })
}