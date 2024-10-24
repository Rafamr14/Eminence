const episodesContainer = document.getElementById('episodes-container');
const eventIDElement = document.getElementById('eID');

if (eventIDElement) {
    const eventID = eventIDElement.textContent || eventIDElement.innerText;

    const speakerMapping = {
        "Cid": [100101, 100102, 100103, 100104, 100105, 100106, 100107, 100108],
        "Alpha": [100201, 100203, 100203, 100204, 100205, 100206, 100207],
        "Beta": [100301, 100303, 100303, 100304, 100305, 100306, 100307],
        "Gamma": [100401, 100402, 100403, 100404, 100405, 100406, 100407],
        "Delta": [100501, 100502, 100503, 100504, 100505],
        "Epsilon": [100601, 100602, 100603, 100604, 100605, 100606, 100607],
        "Zeta": [100701, 100702, 100703, 100704, 100705, 100706],
        "Eta": [100801, 100802, 100803, 100804, 100805, 100806, 100807],
        "Nu": [100901, 100902, 100903],
        "Claire": [101201, 101202, 101203, 101204, 101205, 101206],
        "Alexia": [101301, 101302, 101303, 101304, 101305, 101306],
        "Iris": [101401, 101402, 101403],
        "No. 666": [101501, 101502, 101503],
        "Rose": [101501, 101502, 101503, 101504],
        "Sherry": [101601, 101602, 101603],
        "Aurora": [1017051, 101702, 101206],
        "Beatrix": [102001, 102002],
        "Annerose": [102101],
        "Lambda": [102201],
        "Victoria": [102302],
        "Elisabeth": [102401],
        "Yukime": [102501],
        "Subtitle": [1000001],
        "Maximilian": [404701],
        "Po": [4019011],
        "Skel": [4018011]
    };

    async function fetchDataAndPopulate(url, episodeNumber) {
        try {
            const response = await fetch(url);
            const skillsData = await response.json();

            // Crear elementos de la tabla
            const table = document.createElement('table');
            table.className = "table  table-striped";

            const thead = document.createElement('thead');
            thead.className = "bg-warning text-white";

            const headerRow = document.createElement('tr');
            const episodeHeader = document.createElement('th');
            episodeHeader.colSpan = 3;
            episodeHeader.className = "text-center toggler";
            episodeHeader.style.cursor = "pointer";
            episodeHeader.textContent = `Episode ${episodeNumber}`;
            episodeHeader.onclick = () => toggleEpisode(episodeNumber); // Asignar la función de toggle
            headerRow.appendChild(episodeHeader);
            thead.appendChild(headerRow);

            const subHeaderRow = document.createElement('tr');
            subHeaderRow.id = `episode${episodeNumber}-header`;
            subHeaderRow.style.display = "none"; // Esconder por defecto
            subHeaderRow.innerHTML = `
                <th class="text-center align-middle other-header">Icon</th>
                <th class="text-center align-middle other-header">Name</th>
                <th class="text-center align-middle other-header">Text</th>
            `;
            thead.appendChild(subHeaderRow);

            const tbody = document.createElement('tbody');
            tbody.id = `episode${episodeNumber}`;
            tbody.style.display = "none"; // Esconder por defecto

            // Añadir datos al cuerpo de la tabla
            skillsData.forEach(skill => {
                console.log("Procesando habilidad:", skill);

                const row = document.createElement('tr');
                const iconCell = document.createElement('td');
                const iconImg = document.createElement('img');

                let speakerResourceId = findSpeakerResourceId(skill);

                if (!skill.Text) {
                    console.warn("No hay texto para esta habilidad:", skill);
                    return;
                }

                if (speakerResourceId) {
                    console.log("Usando ResourceId:", speakerResourceId);
                    iconImg.src = `../img/CHIco/${speakerResourceId}.png`;
                } else {
                    console.log("No se encontró un ResourceId adecuado en el mapeo ni en los datos de habilidades");
                    return;
                }

                iconImg.alt = skill.ResourceId;
                iconImg.width = 64;
                iconImg.height = 64;
                iconCell.appendChild(iconImg);
                row.appendChild(iconCell);

                const nameCell = document.createElement('td');
                nameCell.textContent = skill.SpeakerName || "";
                row.appendChild(nameCell);

                const descCell = document.createElement('td');
                descCell.innerHTML = skill.Text;
                row.appendChild(descCell);

                tbody.appendChild(row);
            });

            table.appendChild(thead);
            table.appendChild(tbody);
            episodesContainer.appendChild(table);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    function findSpeakerResourceId(skill) {
        if (skill.SpeakerName && speakerMapping.hasOwnProperty(skill.SpeakerName)) {
            const possibleResourceIds = speakerMapping[skill.SpeakerName];
            for (let resourceId of possibleResourceIds) {
                if ((skill.LeftCharacter && skill.LeftCharacter.ResourceId === resourceId) ||
                    (skill.RightCharacter && skill.RightCharacter.ResourceId === resourceId) ||
                    (skill.CenterCharacter && skill.CenterCharacter.ResourceId === resourceId)) {
                    return resourceId;
                }
            }
            return possibleResourceIds[0]; // Return the first if no specific match found
        }

        if (skill.SpeakerName === "Subtitle") return 1000001;
        if (skill.SpeakerName === "Aurora") return 1017051;

        return 1000002; // Default fallback
    }

    async function fetchAllEpisodes() {
        let episodeNumber = 1;
        while (true) {
            const capUrl = `../data/events/${eventID}0${episodeNumber}.json`;
            const response = await fetch(capUrl);
            if (response.ok) {
                await fetchDataAndPopulate(capUrl, episodeNumber);
                episodeNumber++;
            } else {
                break; // Sale del bucle si no existe más archivos JSON para este episodio
            }
        }
    }

    function toggleEpisode(episodeNumber) {
        const headerRow = document.getElementById(`episode${episodeNumber}-header`);
        const body = document.getElementById(`episode${episodeNumber}`);
        const isHidden = body.style.display === "none";

        headerRow.style.display = isHidden ? "" : "none";
        body.style.display = isHidden ? "" : "none";
    }

    fetchAllEpisodes();
}
