const searchParams = new URLSearchParams(window.location.search);
let practice = searchParams.get('q');
// loadSwim(`/content/${practice}.json`);
loadSwim('C:\\Users\\Kevin Long\\Documents\\GitHub\\swim-practice-formatter\\content\\2021-08-17.json');

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
    exercise.classList.add('exercise','clickable');

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
            // Set the title
            // document.getElementById("title").innerText = res.title;
            // document.title = res.title;
            setTitle(res.title);

            // Set the date
            // let date = res.date;
            // date = date.replace(/-/g, '/');
            // document.getElementById("date").innerText = date;
            setDate(res.date);

            // Tags
            // res.tags.forEach(tag => {
            //     let elem = document.createElement('p');
            //     elem.className = "tag";
            //     elem.textContent = tag;
            //     document.getElementById("meta").appendChild(elem);
            // });
            setTags(res.tags);

            // Set sections
            let total = 0;
            res.body.forEach(section => {
                let sectionTitle = Object.keys(section)[0];
                createSection(sectionTitle);
                // let title = document.createElement('h2');
                // title.textContent = sectionTitle;
                // document.getElementById("body").appendChild(title);

                // let distance = document.createElement('p');
                // distance.className = "distance";
                // document.getElementById("body").appendChild(distance);

                let sectionTotal = 0;

                // Create exercises
                let i = 1;
                section[sectionTitle].forEach(data => {
                    data.i = i;
                    sectionTotal += createExercise(data);
                    i++;
                    // let exercise = document.createElement('div');
                    // exercise.className = "exercise";

                    // let number = document.createElement('p');
                    // number.className = "number";
                    // number.innerText = `${i}.`;
                    // exercise.appendChild(number);
                    // i++;

                    // let details = document.createElement('p');
                    // details.className = "details";
                    // details.innerText = `${data.repetitions} x ${data.distance} ${data.stroke}`;
                    // exercise.appendChild(details);

                    // sectionTotal += data.repetitions * data.distance;

                    // let description = document.createElement('p');
                    // description.className = "description";
                    // description.innerText = data.cycle ? `@${data.cycle} ${data.description}` : data.description;
                    // exercise.appendChild(description);

                    // document.getElementById("body").appendChild(exercise);
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
        })
}