document.addEventListener('DOMContentLoaded', () => {
    // === Elementos del DOM ===
    const chElement = document.getElementById('chID');
    const imgElement = document.querySelector('.imgAuto');
    const titleElement = document.getElementById('characterTitle');
    const levelSlider = document.getElementById('levelSlider'); // Slider para el nivel
    const levelValue = document.getElementById('levelValue'); // Texto del valor del nivel
    const skillsTableBody = document.getElementById('Skills-Body');
    const skillsDupesBody = document.getElementById('SkillsDupes-Body'); // Tabla para skills con 1X
    const charactersTableBody = document.getElementById('characters-body'); // Tabla para personajes

    // === Ruta al archivo JSON de skillPowerMappings ===
    const skillPowerMappingsURL = '../data/skills/skill_power_mappings.json'; // Asegúrate de que esta ruta sea correcta

    // === Array para almacenar las habilidades que necesitan actualización ===
    let skillsToUpdate = [];

    // === Variable para almacenar el idioma actual ===
    let currentLanguage = 'en'; // Predeterminado: English

    // === Elementos de los botones de idioma ===
    const englishButton = document.getElementById('english-button');
    const japaneseButton = document.getElementById('japanese-button');

    // === Verificar que todos los elementos necesarios existan en el DOM ===
    if (chElement && imgElement && titleElement && skillsTableBody && skillsDupesBody && charactersTableBody) {
        // Obtener el characterCode del elemento chID
        const characterCode = chElement.textContent.trim() || chElement.innerText.trim();
        console.log('Character Code:', characterCode);

        // Función para cargar los datos según el idioma
        function loadData(language) {
            // Limpiar tablas y contenido previo
            charactersTableBody.innerHTML = '';
            skillsTableBody.innerHTML = '';
            skillsDupesBody.innerHTML = '';
            skillsToUpdate = [];

            // Actualizar el estado de los botones de idioma
            updateLanguageButtons(language);

            // Actualizar el nombre del idioma en la página si es necesario
            // (Opcional: puedes actualizar otros elementos de la UI aquí)

            // Construir las rutas para el archivo JSON del personaje y la imagen principal
            const characterURL = language === 'jp' ? `../data/characters/${characterCode}_jp.json` : `../data/characters/${characterCode}.json`;
            const imagenMain = `../img/CH/IL_${characterCode}.png`;
            console.log('Character JSON URL:', characterURL);
            console.log('Main Image URL:', imagenMain);

            // Asignar la imagen principal al elemento imgAuto
            imgElement.src = imagenMain;
            imgElement.alt = 'Character Image';

            // Manejar errores al cargar la imagen principal
            imgElement.onerror = () => {
                console.error(`Error al cargar la imagen principal: ${imagenMain}`);
                imgElement.src = `../img/CH/IL_default.png`; // Ruta a una imagen por defecto
            };

            // === Función para cargar ambos JSON en paralelo ===
            Promise.all([
                fetch(characterURL).then(response => {
                    if (!response.ok) {
                        throw new Error(`Error al cargar el archivo de personaje: ${response.status}`);
                    }
                    return response.json();
                }),
                fetch(skillPowerMappingsURL).then(response => {
                    if (!response.ok) {
                        throw new Error(`Error al cargar skill_power_mappings.json: ${response.status}`);
                    }
                    return response.json();
                })
            ])
                .then(([characterData, skillPowerMappings]) => {
                    console.log('Datos del Personaje:', characterData);
                    console.log('Skill Power Mappings:', skillPowerMappings);

                    // === Procesar personajes ===
                    const characters = characterData.Characters.filter(character => character.CharacterCode === parseInt(characterCode));

                    if (characters.length > 0) {
                        generateCharacterTable(characters, 'characters-body', [
                            "Health",
                            "PhysicalAttack",
                            "MagicAttack",
                            "PhysicalDefense",
                            "MagicDefense",
                            "SpecialPoint",
                            "CriticalChance.Percent",
                            "CriticalMultiplier.Percent",
                            "CriticalResistance.Percent",
                            "RecoveryHealth",
                            "RecoverySpecialPoint",
                            "DrainHealth.Percent",
                            "GainHeal.Percent",
                            "GainSpecialPoint.Percent",
                            "SpecialPointReduction.Percent",
                            "Dodge.Percent",
                            "Accuracy.Percent",
                            "AttackRange",
                            "HealthPerLevel",
                            "PhysicalAttackPerLevel",
                            "MagicAttackPerLevel",
                            "PhysicalDefensePerLevel",
                            "MagicDefensePerLevel",
                            "FragmentItemAmount",
                            "CurrencyAmount"
                        ]);
                    } else {
                        console.error('No se encontraron personajes con el CharacterCode especificado en los datos.');
                    }

                    // === Procesar habilidades ===
                    const skills = characterData.Skills || [];

                    if (skills.length > 0) {
                        // Agrupar habilidades por SkillCode, PassiveSkillCode o Code
                        const skillsByCode = skills.reduce((acc, skill) => {
                            const code = skill.Code || skill.SkillCode || skill.PassiveSkillCode;
                            if (code) {
                                if (!acc[code]) {
                                    acc[code] = [];
                                }
                                acc[code].push(skill);
                            }
                            return acc;
                        }, {});

                        // Iterar sobre cada SkillCode
                        for (const [skillCode, skillGroup] of Object.entries(skillsByCode)) {
                            // Encontrar la habilidad principal (tiene Name y Description)
                            const mainSkill = skillGroup.find(skill => skill.Name && skill.Description);
                            if (!mainSkill) {
                                console.warn(`No se encontró una habilidad principal para SkillCode/PassiveSkillCode: ${skillCode}`);
                                continue;
                            }

                            // Determinar a qué tabla agregar la habilidad
                            const skillCodeStr = skillCode.toString();
                            const lastTwoDigits = skillCodeStr.slice(-2); // Obtener los últimos dos dígitos del Code

                            let targetTableBody;

                            if (lastTwoDigits[0] === '0') {
                                targetTableBody = skillsTableBody;
                            } else if (lastTwoDigits[0] === '1') {
                                targetTableBody = skillsDupesBody;
                            } else {
                                console.warn(`SkillCode/PassiveSkillCode: ${skillCode} no coincide con los criterios de tabla.`);
                                continue;
                            }

                            // Crear fila de habilidad
                            const skillRow = document.createElement('tr');

                            // Celda de icono
                            const skillIconCell = document.createElement('td');
                            const skillIcon = document.createElement('img');
                            if (mainSkill.SkillIconCode) {
                                skillIcon.src = `../img/SkillIcon/BI_${mainSkill.SkillIconCode.toString().padStart(7, '0')}.png`;
                            } else {
                                skillIcon.src = `../img/SkillIcon/default_icon.png`;
                            }
                            skillIcon.alt = 'Skill Icon';
                            skillIcon.className = 'skill-icon';
                            // Manejar errores al cargar el SkillIcon
                            skillIcon.onerror = () => {
                                console.error(`Error al cargar el SkillIcon: ${skillIcon.src}`);
                                skillIcon.src = `../img/SkillIcon/default_icon.png`; // Ruta a una imagen por defecto
                            };
                            skillIconCell.appendChild(skillIcon);
                            skillRow.appendChild(skillIconCell);

                            // Celda de nombre
                            const skillNameCell = document.createElement('td');
                            skillNameCell.textContent = mainSkill.Name || 'Unknown Skill';
                            skillRow.appendChild(skillNameCell);

                            // Celda de descripción
                            const skillDescCell = document.createElement('td');
                            skillDescCell.innerHTML = mainSkill.Description || 'No Description'; // Usar innerHTML para conservar etiquetas
                            skillRow.appendChild(skillDescCell);

                            targetTableBody.appendChild(skillRow);

                            // Obtener el mapeo para este SkillCode
                            const mapping = skillPowerMappings[skillCode];
                            if (!mapping) {
                                console.warn(`No hay mapeo definido para SkillCode/PassiveSkillCode: ${skillCode}`);
                                continue;
                            }

                            // Preparar los SkillPowers según el mapeo
                            const powersForPlaceholders = {};

                            for (const [placeholder, skillPowerCode] of Object.entries(mapping)) {
                                const skillPowerEntry = skillGroup.find(skill => skill.SkillPowerCode === parseInt(skillPowerCode));
                                if (skillPowerEntry && skillPowerEntry.SkillPowers) {
                                    powersForPlaceholders[placeholder] = skillPowerEntry.SkillPowers;
                                } else {
                                    console.warn(`No se encontraron SkillPowers para SkillPowerCode: ${skillPowerCode} en SkillCode/PassiveSkillCode: ${skillCode}`);
                                    powersForPlaceholders[placeholder] = [];
                                }
                            }

                            // Almacenar la información necesaria para actualizar más tarde
                            skillsToUpdate.push({
                                skillDescCell: skillDescCell,
                                originalDescription: mainSkill.Description || 'No Description',
                                powers: powersForPlaceholders
                            });
                        }

                        // Inicializar el valor del deslizador
                        const initialLevel = parseInt(levelSlider.value) || 1;
                        levelValue.textContent = initialLevel;
                        updateAllSkillDescriptions(initialLevel);

                        // Agregar un solo escuchador de eventos para el deslizador
                        levelSlider.addEventListener('input', (event) => {
                            const level = parseInt(event.target.value);
                            levelValue.textContent = level;
                            updateAllSkillDescriptions(level);
                        });
                    } else {
                        console.error('No se encontraron habilidades en los datos.');
                    }

                    // === Inserción de Imágenes de Rareza y Color en el Título ===
                    // **MODIFICACIÓN: Eliminar imágenes existentes antes de agregar nuevas**
                    titleElement.querySelectorAll('.rarity-img, .attribute-role-img').forEach(img => img.remove());

                    const characterInfo = characterData.Characters[0];
                    if (characterInfo) {
                        // Definir las imágenes de rareza
                        const rarityImages = {
                            1: "Rare_A.png",
                            2: "Rare_S.png",
                            3: "Rare_SS_01.png"
                        };
                        const rarity = characterInfo.DefaultRarity;
                        console.log('Rareza:', rarity);

                        if (rarityImages[rarity]) {
                            const rarityImg = document.createElement('img');
                            rarityImg.src = `../img/CHroles/${rarityImages[rarity]}`;
                            rarityImg.alt = `Rarity ${rarity}`;
                            rarityImg.className = 'rarity-img'; // Clase para estilos CSS
                            rarityImg.width = 64;
                            rarityImg.height = 54;
                            // Manejar errores al cargar la imagen de rareza
                            rarityImg.onerror = () => {
                                console.error(`Error al cargar la imagen de rareza: ${rarityImg.src}`);
                                rarityImg.src = `../img/CHroles/Rare_default.png`; // Ruta a una imagen por defecto
                            };
                            titleElement.appendChild(rarityImg);
                            console.log('Imagen de Rareza añadida:', rarityImg.src);
                        } else {
                            console.warn(`No se encontró una imagen de rareza para la rareza: ${rarity}`);
                        }

                        // Obtener Attribute y Role para la imagen de color
                        const attribute = characterInfo.Attribute;
                        const role = characterInfo.Role;
                        console.log('Attribute:', attribute, 'Role:', role);

                        if (attribute && role) {
                            const attributeRoleImg = document.createElement('img');
                            attributeRoleImg.src = `../img/CHroles/Color_0${attribute}_${role}.png`;
                            attributeRoleImg.alt = `Attribute ${attribute} Role ${role}`;
                            attributeRoleImg.className = 'attribute-role-img'; // Clase para estilos CSS
                            attributeRoleImg.width = 64; // Ajusta el tamaño según tus necesidades
                            attributeRoleImg.height = 64;
                            // Manejar errores al cargar la imagen de color y rol
                            attributeRoleImg.onerror = () => {
                                console.error(`Error al cargar la imagen de Attribute y Role: ${attributeRoleImg.src}`);
                                attributeRoleImg.src = `../img/CHroles/Color_default.png`; // Ruta a una imagen por defecto
                            };
                            titleElement.appendChild(attributeRoleImg);
                            console.log('Imagen de Attribute y Role añadida:', attributeRoleImg.src);
                        } else {
                            console.warn('Attribute o Role no están definidos en los datos del personaje.');
                        }
                    } else {
                        console.error('Información del personaje no está disponible para insertar imágenes.');
                    }

                })
                .catch(error => console.error('Error al cargar los archivos JSON:', error));
        }

        // Función para actualizar el estado de los botones de idioma
        function updateLanguageButtons(language) {
            if (language === 'en') {
                englishButton.classList.add('active');
                japaneseButton.classList.remove('active');
            } else if (language === 'jp') {
                japaneseButton.classList.add('active');
                englishButton.classList.remove('active');
            }
        }

        // Cargar los datos inicialmente con el idioma predeterminado
        loadData(currentLanguage);

        // === Manejadores de eventos para los botones de idioma ===
        englishButton.addEventListener('click', (event) => {
            event.preventDefault();
            if (currentLanguage !== 'en') {
                currentLanguage = 'en';
                loadData(currentLanguage);
            }
        });

        japaneseButton.addEventListener('click', (event) => {
            event.preventDefault();
            if (currentLanguage !== 'jp') {
                currentLanguage = 'jp';
                loadData(currentLanguage);
            }
        });

    } else {
        console.error('Faltan elementos requeridos en el DOM.');
    }

    /**
     * Función para actualizar todas las descripciones de habilidades
     * @param {number} level - Nivel seleccionado del deslizador
     */
    function updateAllSkillDescriptions(level) {
        skillsToUpdate.forEach(skill => {
            let updatedDescription = skill.originalDescription;

            // Reemplazar cada placeholder con su correspondiente power
            for (const [placeholder, powerArray] of Object.entries(skill.powers)) {
                if (powerArray.length === 1 && powerArray[0].Level === 1) {
                    // Caso: Solo hay un SkillPower con Level 1
                    let powerValue = powerArray[0].Power;

                    if (powerArray[0].IsPercent) {
                        powerValue *= 100;
                    }

                    // Crear una expresión regular para reemplazar todas las instancias del placeholder
                    // Envuelve el valor en un span con estilo de color rojo
                    const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
                    const powerDisplay = powerArray[0].IsPercent ? `${powerValue.toFixed(2)}%` : `${powerValue.toFixed(2)}`;
                    updatedDescription = updatedDescription.replace(regex, `<span style="color: red;">${powerDisplay}</span>`);
                } else if (powerArray.length > 0) {
                    // Buscar el SkillPower correspondiente al nivel seleccionado
                    const powerObj = powerArray.find(sp => sp.Level === level);

                    if (powerObj) {
                        let powerValue = powerObj.Power;

                        if (powerObj.IsPercent) {
                            powerValue *= 100;
                        }

                        // Crear una expresión regular para reemplazar todas las instancias del placeholder
                        // Envuelve el valor en un span con estilo de color rojo
                        const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
                        const powerDisplay = powerObj.IsPercent ? `${powerValue.toFixed(2)}%` : `${powerValue.toFixed(2)}`;
                        updatedDescription = updatedDescription.replace(regex, `<span style="color: red;">${powerDisplay}</span>`);
                    } else {
                        console.warn(`No se encontró un Power para SkillPowerCode correspondiente al placeholder {${placeholder}} en el nivel ${level}.`);
                    }
                }
            }

            skill.skillDescCell.innerHTML = updatedDescription; // Usar innerHTML para conservar etiquetas HTML
        });
    }

    /**
     * Función para generar la tabla de personajes
     * @param {Array} characters - Array de personajes filtrados
     * @param {string} bodyId - ID del tbody de la tabla de personajes
     * @param {Array} keys - Array de claves para las columnas de personajes
     */
    function generateCharacterTable(characters, bodyId, keys) {
        const tableBody = document.getElementById(bodyId);
        const headerRow = document.createElement('tr');

        // Crear encabezados dinámicamente basados en los personajes
        const emptyHeaderCell = document.createElement('th');
        emptyHeaderCell.textContent = ''; // Primera columna vacía
        headerRow.appendChild(emptyHeaderCell);

        characters.forEach(character => {
            const th = document.createElement('th');
            th.textContent = `Rarity ${convertRarity(character.Rarity)}`; // Mostrar solo la rareza convertida
            headerRow.appendChild(th);
        });

        tableBody.appendChild(headerRow);

        // Llenar las filas con los nombres de las claves y los valores correspondientes
        keys.forEach(key => {
            const row = document.createElement('tr');

            // Celda con el nombre de la clave en negrita
            const keyCell = document.createElement('td');
            keyCell.textContent = key.replace('.Percent', ''); // Eliminar ".Percent" si existe
            keyCell.style.fontWeight = 'bold'; // Aplicar estilo de negrita
            row.appendChild(keyCell);

            // Columnas con los valores de los personajes
            characters.forEach(character => {
                const valueCell = document.createElement('td');
                let value = resolveNestedValue(character, key); // Obtener valores anidados
                if (key === 'Rarity') {
                    value = convertRarity(value); // Convertir la rareza a SS, SS+, SS++
                }
                valueCell.textContent = value !== undefined ? value : 'N/A';
                row.appendChild(valueCell);
            });

            tableBody.appendChild(row);
        });
    }

    /**
     * Función para convertir la rareza a formato de texto
     * @param {number} rarity - Nivel de rareza
     * @returns {string} - Texto representativo de la rareza
     */
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

    /**
     * Función auxiliar para resolver valores anidados en objetos
     * @param {Object} obj - Objeto donde buscar
     * @param {string} path - Ruta de propiedades separadas por puntos
     * @returns {*} - Valor encontrado o undefined
     */
    function resolveNestedValue(obj, path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    /**
     * Función para generar la tabla de skills
     * @param {Array} data - Array de habilidades filtradas
     * @param {string} bodyId - ID del tbody de la tabla de skills
     * @param {Array} keys - Array de claves para las columnas de skills
     */
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
                    // Manejar errores al cargar el SkillIcon
                    img.onerror = () => {
                        console.error(`Error al cargar el SkillIcon: ${img.src}`);
                        img.src = `../img/SkillIcon/default_icon.png`; // Ruta a una imagen por defecto
                    };
                    td.appendChild(img);
                } else if (key === 'Description') {
                    // Inicialmente, se establece la descripción original
                    td.innerHTML = item.Description || 'No Description';
                } else {
                    td.textContent = typeof item[key] === 'object' ? JSON.stringify(item[key]) : item[key];
                }
                row.appendChild(td);
            });
            tableBody.appendChild(row);
        });
    }
});
