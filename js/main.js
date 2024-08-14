document.addEventListener('DOMContentLoaded', () => {
    const chElement = document.getElementById('chID');
    const imgElement = document.querySelector('.imgAuto');
    const titleElement = document.getElementById('characterTitle');

    if (chElement && imgElement && titleElement) {
        const skillCode = chElement.textContent || chElement.innerText;

        const url = `../data/characters/${skillCode}.json`;
        const imagenMain = `../img/CH/IL_${skillCode}.png`;

        imgElement.src = imagenMain;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const characterInfo = data.Characters[0];
                const name = characterInfo.Name || 'Unknown Name';
                const title = characterInfo.Title || 'Unknown Title';

                titleElement.textContent = `${title} ${name}`;

                const rarityImages = {
                    1: "Rare_A.png",
                    2: "Rare_S.png",
                    3: "Rare_SS_01.png"
                };
                const rarity = characterInfo.DefaultRarity;

                if (rarityImages[rarity]) {
                    const rarityImg = document.createElement('img');
                    rarityImg.src = `../img/CHroles/${rarityImages[rarity]}`;
                    rarityImg.alt = `Rarity ${rarity}`;
                    titleElement.appendChild(rarityImg);
                }

                const attribute = characterInfo.Attribute;
                const role = characterInfo.Role;
                const attributeRoleImg = document.createElement('img');
                attributeRoleImg.src = `../img/CHroles/Color_0${attribute}_${role}.png`;
                attributeRoleImg.alt = `Attribute ${attribute} Role ${role}`;
                titleElement.appendChild(attributeRoleImg);

                const characters = data.Characters.filter(character =>
                    character.Rarity !== undefined &&
                    character.Health !== undefined &&
                    character.PhysicalAttack !== undefined
                );
                const skills = data.Skills;

                const characterKeys = [
                    "Rarity", "Health", "PhysicalAttack", "MagicAttack", "PhysicalDefense", "MagicDefense",
                    "SpecialPoint", "CriticalChance", "CriticalMultiplier", "CriticalResistance", "RecoveryHealth",
                    "RecoverySpecialPoint", "DrainHealth", "GainHeal", "GainSpecialPoint", "SpecialPointReduction",
                    "Dodge", "Accuracy", "AttackRange", "HealthPerLevel", "PhysicalAttackPerLevel", "MagicAttackPerLevel",
                    "PhysicalDefensePerLevel", "MagicDefensePerLevel", "FragmentItemAmount", "CurrencyAmount"
                ];

                const skillKeys = [
                    "SkillIcon",
                    "Name",
                    "Description",
                    "ShortDescription"
                ];

                if (characters.length > 0) {
                    populateCharacterTable(characters, 'characters-body', characterKeys);
                }

                const skillsPlus = skills.filter(skill => skill.Name.endsWith('+'));
                const skillsMinus = skills.filter(skill => !skill.Name.endsWith('+'));

                if (skillsPlus.length > 0) {
                    generateTableHeader(skillKeys, 'SkillsDupes-Header');
                    populateSkillsTable(skillsPlus, 'SkillsDupes-Body', skillKeys);
                }

                if (skillsMinus.length > 0) {
                    generateTableHeader(skillKeys, 'Skills-Header');
                    populateSkillsTable(skillsMinus, 'Skills-Body', skillKeys);
                }
            })
            .catch(error => console.error('Error fetching the JSON:', error));
    } else {
        console.error('Required elements are missing in the DOM.');
    }
});

function generateTableHeader(keys, headerId) {
    const headerRow = document.getElementById(headerId);
    keys.forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });
}

function populateCharacterTable(data, bodyId, keys) {
    const tableBody = document.getElementById(bodyId);
    keys.forEach(key => {
        const row = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = key;
        row.appendChild(th);

        data.forEach(item => {
            const td = document.createElement('td');
            if (item[key] !== undefined) {
                if (key === 'Rarity') {
                    td.textContent = convertRarity(item[key]);
                } else {
                    td.textContent = typeof item[key] === 'object' ? JSON.stringify(item[key]) : item[key];
                }
            }
            row.appendChild(td);
        });

        if (row.children.length > 1) {
            tableBody.appendChild(row);
        }
    });
}

function convertRarity(rarity) {
    switch (rarity) {
        case 3:
            return "SS";
        case 4:
            return "SS+";
        case 5:
            return "SS++";
        default:
            return rarity;
    }
}

function populateSkillsTable(data, bodyId, keys) {
    const tableBody = document.getElementById(bodyId);
    data.forEach(item => {
        const row = document.createElement('tr');
        keys.forEach(key => {
            const td = document.createElement('td');
            if (key === 'SkillIcon') {
                const img = document.createElement('img');
                const skillIconCode = item.SkillIconCode.toString().padStart(7, '0');
                img.src = `../img/SkillIcon/BI_${skillIconCode}.png`;
                img.alt = 'Skill Icon';
                img.className = 'skill-icon';
                td.appendChild(img);
            } else {
                td.textContent = typeof item[key] === 'object' ? JSON.stringify(item[key]) : item[key];
            }
            row.appendChild(td);
        });
        tableBody.appendChild(row);
    });
}
