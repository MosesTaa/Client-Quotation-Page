"use strict";

/* =========================================================
   ONSITE QUOTATION
   SECTION 1 OF 7
   GLOBAL DATA + NAVIGATION + ROOMS + DIMENSIONS
   ========================================================= */

/* =========================================================
   PDF LIBRARY
   ========================================================= */

let jsPDFConstructor = null;

if (
    window.jspdf &&
    typeof window.jspdf.jsPDF === "function"
) {
    jsPDFConstructor = window.jspdf.jsPDF;
}

/* =========================================================
   GLOBAL QUOTATION DATA
   ========================================================= */

let quotation = {
    quotationType: "",

    rooms: [],

    copperRate: 3200,

    flexibleCableType: "1.5mm 3 core flexible cable",

    flexibleCableRate: 500,

    drainageRate: 1200,

    installationRegion: "",

    acType: "",

    installationUnitCost: 0,

    installationUnitCount: 0,

    installationTotal: 0,

    additionalItems: [],

    includeVoltSwitcher: false,

    voltSwitcherModel: "VXV13ABAS",

    voltSwitcherQuantity: 0,

    includeCassettePanel: false,

    cassettePanelModel: "PT-MCHWO",

    cassettePanelQuantity: 0,

    preliminariesCost: 15000,

    includeAsBuiltDrawing: false,

    asBuiltDrawingCost: 5000,

    acPrices: [],

    clientName: "",

    installationLocation: "",

    clientPhone: "",

    clientEmail: ""
};

/* =========================================================
   AC CAPACITIES
   ========================================================= */

const AC_CAPACITIES = [
    9000,
    12000,
    14000,
    18000,
    22000,
    24000,
    36000,
    48000
];

/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function showPage(pageNumber) {
    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });

    let page =
        document.getElementById(
            "page" + pageNumber
        );

    /*
       Page 0 is generated here so the existing HTML pages
       do not have to be renumbered.
    */

    if (!page && pageNumber === 0) {
        page = document.createElement("section");

        page.id = "page0";

        page.className = "page";

        page.innerHTML = `
            <div class="card quotation-welcome-card">

                <h2>
                    Welcome to Onsite Quotation
                </h2>

                <p>
                    Please choose the type of quotation you are looking for.
                </p>

                <div class="quotation-type-options">

                    <button
                        type="button"
                        class="primary-button full-width"
                        onclick="selectQuotationType('supply-only')"
                    >
                        Supply Only
                    </button>

                    <button
                        type="button"
                        class="secondary-button full-width"
                        onclick="selectQuotationType('supply-and-commissioning')"
                    >
                        Supply and Commissioning
                    </button>

                </div>

            </div>
        `;

        (
            document.querySelector("main") ||
            document.body
        ).prepend(page);
    }

    /*
       Page 15 is created dynamically because the original
       HTML contains pages 1–14.
    */

    if (!page && pageNumber === 15) {
        page =
            document.createElement(
                "section"
            );

        page.id = "page15";

        page.className = "page";

        page.innerHTML = `
            <div class="card">

                <h2>
                    Quotation Generated
                </h2>

                <p>
                    Your quotation has been generated successfully.
                </p>

                <button
                    type="button"
                    class="primary-button full-width"
                    onclick="startNewQuotation()"
                >
                    Start New Quotation
                </button>

            </div>
        `;

        document.body.appendChild(page);
    }

    if (!page) {
        console.warn(
            "Page not found:",
            pageNumber
        );

        return;
    }

    page.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* =========================================================
   QUOTATION TYPE
   ========================================================= */

function isSupplyOnly() {
    return (
        quotation.quotationType ===
        "supply-only"
    );
}

function selectQuotationType(type) {
    const allowedTypes = [
        "supply-only",
        "supply-and-commissioning"
    ];

    if (!allowedTypes.includes(type)) {
        return;
    }

    quotation.quotationType = type;

    if (isSupplyOnly()) {
        quotation.rooms.forEach(room => {
            room.copper = 0;
            room.drainage = 0;
        });

        quotation.copperRate = 0;

        quotation.flexibleCableRate = 0;

        quotation.drainageRate = 0;

        quotation.installationRegion = "";

        quotation.acType = "";

        quotation.installationUnitCost = 0;

        quotation.installationUnitCount = 0;

        quotation.installationTotal = 0;

        quotation.additionalItems = [];

        quotation.includeVoltSwitcher = false;

        quotation.includeCassettePanel = false;

        quotation.includeAsBuiltDrawing = false;
    } else {
        quotation.copperRate =
            quotation.copperRate ||
            3200;

        quotation.flexibleCableType =
            quotation.flexibleCableType ||
            "1.5mm 3 core flexible cable";

        quotation.flexibleCableRate =
            quotation.flexibleCableRate ||
            500;

        quotation.drainageRate =
            quotation.drainageRate ||
            1200;
    }

    showPage(1);
}

/* =========================================================
   FORMATTING
   ========================================================= */

function money(value) {
    const amount =
        Number(value) ||
        0;

    return (
        "KES " +
        amount.toLocaleString(
            "en-KE",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );
}

function number(value) {
    const amount =
        Number(value) ||
        0;

    return amount.toLocaleString(
        "en-KE",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}

function escapeHTML(value) {
    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

/* =========================================================
   STEP 1
   ADD ROOMS
   ========================================================= */

function addRoomInput() {
    const container =
        document.getElementById(
            "roomInputContainer"
        );

    if (!container) {
        return;
    }

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "input-row room-input-row";

    row.innerHTML = `
        <input
            type="text"
            class="room-name-input"
            placeholder="e.g. Bedroom 2"
        >

        <button
            type="button"
            class="remove-input"
            onclick="removeRoomInput(this)"
        >
            ×
        </button>
    `;

    container.appendChild(row);

    row
        .querySelector("input")
        ?.focus();
}

function removeRoomInput(button) {
    const rows =
        document.querySelectorAll(
            ".room-input-row"
        );

    if (rows.length <= 1) {
        const input =
            button
                .parentElement
                .querySelector("input");

        if (input) {
            input.value = "";
        }

        return;
    }

    button
        .parentElement
        .remove();
}

function saveRooms() {
    const inputs =
        document.querySelectorAll(
            ".room-name-input"
        );

    const names = [];

    inputs.forEach(input => {
        const name =
            input.value.trim();

        if (name) {
            names.push(name);
        }
    });

    if (names.length === 0) {
        alert(
            "Please enter at least one room."
        );

        return;
    }

    quotation.rooms =
        names.map(name => ({
            name,

            length: 0,

            width: 0,

            area: 0,

            copper: 15,

            drainage: 15,

            coolingFactor: 700,

            coolingLoad: 0,

            capacity: 0,

            /*
               Each room can contain one or more AC units.
               Individual capacities, types and brands are
               stored in the acUnits array.
            */

            acUnits: []
        }));

    renderRoomPreview();

    showPage(2);
}

/* =========================================================
   STEP 2
   ROOM PREVIEW
   ========================================================= */

function renderRoomPreview() {
    const container =
        document.getElementById(
            "roomPreview"
        );

    if (!container) {
        return;
    }

    if (
        quotation.rooms.length === 0
    ) {
        container.innerHTML = `
            <div class="empty-message">
                No rooms added.
            </div>
        `;

        return;
    }

    container.innerHTML =
        quotation.rooms
            .map(
                (room, index) => `
                    <div class="room-card">

                        <div>
                            <span class="room-name">

                                ${index + 1}.

                                ${escapeHTML(
                                    room.name
                                )}

                            </span>
                        </div>

                        <div class="button-group">

                            <button
                                type="button"
                                class="edit-button"
                                onclick="renameRoom(${index})"
                            >
                                Rename
                            </button>

                            <button
                                type="button"
                                class="danger-button"
                                onclick="deleteRoom(${index})"
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                `
            )
            .join("");
}

function renameRoom(index) {
    if (!quotation.rooms[index]) {
        return;
    }

    const currentName =
        quotation.rooms[index].name;

    const newName =
        prompt(
            "Enter the new room name:",
            currentName
        );

    if (
        newName &&
        newName.trim()
    ) {
        quotation.rooms[index].name =
            newName.trim();

        renderRoomPreview();
    }
}

function deleteRoom(index) {
    if (!quotation.rooms[index]) {
        return;
    }

    const roomName =
        quotation.rooms[index].name;

    if (
        !confirm(
            `Delete "${roomName}"?`
        )
    ) {
        return;
    }

    quotation.rooms.splice(
        index,
        1
    );

    if (
        quotation.rooms.length === 0
    ) {
        alert(
            "At least one room is required."
        );

        showPage(1);

        return;
    }

    renderRoomPreview();
}

function goToDimensions() {
    if (
        quotation.rooms.length === 0
    ) {
        alert(
            "Please add at least one room."
        );

        showPage(1);

        return;
    }

    renderDimensionInputs();

    showPage(3);
}

/* =========================================================
   STEP 3
   ROOM DIMENSIONS
   ========================================================= */

function renderDimensionInputs() {
    const container =
        document.getElementById(
            "dimensionInputs"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        quotation.rooms
            .map(
                (room, index) => `
                    <div class="card">

                        <h3>
                            ${index + 1}.
                            ${escapeHTML(
                                room.name
                            )}
                        </h3>

                        <label>
                            Length (m)

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                id="length-${index}"
                                value="${room.length || ""}"
                                placeholder="e.g. 5"
                            >
                        </label>

                        <label>
                            Width (m)

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                id="width-${index}"
                                value="${room.width || ""}"
                                placeholder="e.g. 4"
                            >
                        </label>

                        <div class="info-box">
                            Area:

                            <strong
                                id="area-${index}"
                            >
                                ${number(
                                    room.area
                                )}
                                m²
                            </strong>
                        </div>

                    </div>
                `
            )
            .join("");

    quotation.rooms.forEach(
        (room, index) => {
            document
                .getElementById(
                    `length-${index}`
                )
                ?.addEventListener(
                    "input",
                    () =>
                        updateAreaPreview(
                            index
                        )
                );

            document
                .getElementById(
                    `width-${index}`
                )
                ?.addEventListener(
                    "input",
                    () =>
                        updateAreaPreview(
                            index
                        )
                );
        }
    );
}

function updateAreaPreview(index) {
    const length =
        Number(
            document.getElementById(
                `length-${index}`
            )?.value
        );

    const width =
        Number(
            document.getElementById(
                `width-${index}`
            )?.value
        );

    const area =
        length *
        width;

    const output =
        document.getElementById(
            `area-${index}`
        );

    if (output) {
        output.textContent =
            `${number(area)} m²`;
    }
}

function previewDimensions() {
    let valid = true;

    quotation.rooms.forEach(
        (room, index) => {
            const length =
                Number(
                    document.getElementById(
                        `length-${index}`
                    )?.value
                );

            const width =
                Number(
                    document.getElementById(
                        `width-${index}`
                    )?.value
                );

            if (
                !length ||
                !width ||
                length <= 0 ||
                width <= 0
            ) {
                valid = false;

                return;
            }

            room.length = length;

            room.width = width;

            room.area =
                length *
                width;
        }
    );

    if (!valid) {
        alert(
            "Please enter valid length and width for every room."
        );

        return;
    }

    renderDimensionPreview();

    showPage(4);
}

function renderDimensionPreview() {
    const container =
        document.getElementById(
            "dimensionPreview"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div style="overflow-x:auto">

            <table>

                <thead>
                    <tr>
                        <th>
                            Room
                        </th>

                        <th class="number">
                            Length
                        </th>

                        <th class="number">
                            Width
                        </th>

                        <th class="number">
                            Area
                        </th>
                    </tr>
                </thead>

                <tbody>

                    ${
                        quotation.rooms
                            .map(room => `
                                <tr>

                                    <td>
                                        ${escapeHTML(
                                            room.name
                                        )}
                                    </td>

                                    <td class="number">
                                        ${number(
                                            room.length
                                        )}
                                        m
                                    </td>

                                    <td class="number">
                                        ${number(
                                            room.width
                                        )}
                                        m
                                    </td>

                                    <td class="number">
                                        <strong>
                                            ${number(
                                                room.area
                                            )}
                                            m²
                                        </strong>
                                    </td>

                                </tr>
                            `)
                            .join("")
                    }

                </tbody>

            </table>

        </div>
    `;
}
/* =========================================================
   ONSITE QUOTATION
   SECTION 2 OF 7
   COPPER, DRAINAGE AND COOLING LOAD
   ========================================================= */

/* =========================================================
   PROCEED TO COPPER AND DRAINAGE
   ========================================================= */

function goToCopper() {
    if (
        !quotation.rooms ||
        quotation.rooms.length === 0
    ) {
        alert(
            "Please add rooms before entering pipe lengths."
        );

        showPage(1);

        return;
    }

    /*
       Supply-only quotations do not require copper,
       drainage or flexible cable.
    */

    if (isSupplyOnly()) {
        quotation.rooms.forEach(room => {
            room.copper = 0;
            room.drainage = 0;
        });

        goToCoolingLoad();

        return;
    }

    /*
       Set 15 metres as the default length while retaining
       any value previously entered by the user.
    */

    quotation.rooms.forEach(room => {
        if (
            !Number.isFinite(
                Number(room.copper)
            ) ||
            Number(room.copper) <= 0
        ) {
            room.copper = 15;
        }

        if (
            !Number.isFinite(
                Number(room.drainage)
            ) ||
            Number(room.drainage) <= 0
        ) {
            room.drainage = 15;
        }
    });

    renderCopperInputs();

    showPage(5);
}

/* =========================================================
   RENDER COPPER AND DRAINAGE INPUTS
   ========================================================= */

function renderCopperInputs() {
    const container =
        document.getElementById(
            "copperInputs"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        quotation.rooms
            .map(
                (room, index) => `
                    <div class="card">

                        <h3>
                            ${index + 1}.
                            ${escapeHTML(
                                room.name
                            )}
                        </h3>

                        <label>
                            Copper Length (m)

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                id="copper-${index}"
                                value="${
                                    Number.isFinite(
                                        Number(room.copper)
                                    )
                                        ? Number(room.copper)
                                        : 15
                                }"
                                placeholder="15"
                            >
                        </label>

                        <small>
                            The default copper length is 15 metres.
                            You can change it to the measured site length.
                        </small>

                        <label>
                            Drainage Length (m)

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                id="drainage-${index}"
                                value="${
                                    Number.isFinite(
                                        Number(room.drainage)
                                    )
                                        ? Number(room.drainage)
                                        : 15
                                }"
                                placeholder="15"
                            >
                        </label>

                        <small>
                            The default drainage length is 15 metres.
                            You can change it to the measured site length.
                        </small>

                    </div>
                `
            )
            .join("");
}

/* =========================================================
   SAVE AND PREVIEW COPPER AND DRAINAGE
   ========================================================= */

function previewCopper() {
    let valid = true;

    quotation.rooms.forEach(
        (room, index) => {
            const copperInput =
                document.getElementById(
                    `copper-${index}`
                );

            const drainageInput =
                document.getElementById(
                    `drainage-${index}`
                );

            const copper =
                Number(
                    copperInput?.value
                );

            const drainage =
                Number(
                    drainageInput?.value
                );

            if (
                !Number.isFinite(copper) ||
                copper < 0 ||
                !Number.isFinite(drainage) ||
                drainage < 0
            ) {
                valid = false;

                return;
            }

            room.copper = copper;

            room.drainage = drainage;
        }
    );

    if (!valid) {
        alert(
            "Please enter valid copper and drainage lengths for every room."
        );

        return;
    }

    renderCopperPreview();

    showPage(6);
}

/* =========================================================
   RENDER COPPER AND DRAINAGE PREVIEW
   ========================================================= */

function renderCopperPreview() {
    const container =
        document.getElementById(
            "copperPreview"
        );

    if (!container) {
        return;
    }

    const totalCopper =
        quotation.rooms.reduce(
            (
                sum,
                room
            ) =>
                sum +
                Number(
                    room.copper ||
                    0
                ),
            0
        );

    const totalDrainage =
        quotation.rooms.reduce(
            (
                sum,
                room
            ) =>
                sum +
                Number(
                    room.drainage ||
                    0
                ),
            0
        );

    container.innerHTML = `
        <div style="overflow-x:auto">

            <table>

                <thead>
                    <tr>
                        <th>
                            Room
                        </th>

                        <th class="number">
                            Copper
                        </th>

                        <th class="number">
                            Drainage
                        </th>
                    </tr>
                </thead>

                <tbody>

                    ${
                        quotation.rooms
                            .map(room => `
                                <tr>

                                    <td>
                                        ${escapeHTML(
                                            room.name
                                        )}
                                    </td>

                                    <td class="number">
                                        ${number(
                                            room.copper
                                        )}
                                        m
                                    </td>

                                    <td class="number">
                                        ${number(
                                            room.drainage
                                        )}
                                        m
                                    </td>

                                </tr>
                            `)
                            .join("")
                    }

                </tbody>

                <tfoot>
                    <tr>

                        <th>
                            Total
                        </th>

                        <th class="number">
                            ${number(
                                totalCopper
                            )}
                            m
                        </th>

                        <th class="number">
                            ${number(
                                totalDrainage
                            )}
                            m
                        </th>

                    </tr>
                </tfoot>

            </table>

        </div>
    `;
}

/* =========================================================
   COMPATIBILITY NAVIGATION FUNCTIONS
   ========================================================= */

function goToDrainage() {
    previewCopper();
}

function previewDrainage() {
    previewCopper();
}

/* =========================================================
   PROCEED TO COOLING-LOAD SELECTION
   ========================================================= */

function goToCoolingLoad() {
    if (
        !quotation.rooms ||
        quotation.rooms.length === 0
    ) {
        alert(
            "Please add rooms before selecting cooling load levels."
        );

        showPage(1);

        return;
    }

    quotation.rooms.forEach(room => {
        const currentFactor =
            Number(
                room.coolingFactor
            );

        if (
            ![
                700,
                800,
                900
            ].includes(
                currentFactor
            )
        ) {
            room.coolingFactor = 700;
        }
    });

    renderCoolingLoadInputs();

    showPage(7);
}

/* =========================================================
   RENDER COOLING-LOAD DROPDOWNS
   ========================================================= */

function renderCoolingLoadInputs() {
    const container =
        document.getElementById(
            "coolingLoadInputs"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        quotation.rooms
            .map(
                (room, index) => `
                    <div class="card">

                        <h3>
                            ${index + 1}.
                            ${escapeHTML(
                                room.name
                            )}
                        </h3>

                        <p>
                            Room Area:

                            <strong>
                                ${number(
                                    room.area
                                )}
                                m²
                            </strong>
                        </p>

                        <label>
                            Cooling Load Level

                            <select
                                id="factor-${index}"
                                onchange="updateCoolingLoadPreview(${index})"
                            >

                                <option
                                    value="700"
                                    ${
                                        Number(
                                            room.coolingFactor ||
                                            700
                                        ) === 700
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Low Load — 700 BTU/hr per m²
                                </option>

                                <option
                                    value="800"
                                    ${
                                        Number(
                                            room.coolingFactor
                                        ) === 800
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Medium Load — 800 BTU/hr per m²
                                </option>

                                <option
                                    value="900"
                                    ${
                                        Number(
                                            room.coolingFactor
                                        ) === 900
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    High Load — 900 BTU/hr per m²
                                </option>

                            </select>
                        </label>

                        <div class="info-box">
                            Calculated Cooling Load:

                            <strong
                                id="load-${index}"
                            >
                                ${
                                    number(
                                        Number(
                                            room.area
                                        ) *
                                        Number(
                                            room.coolingFactor ||
                                            700
                                        )
                                    )
                                }
                                BTU/hr
                            </strong>
                        </div>

                    </div>
                `
            )
            .join("");
}

/* =========================================================
   LIVE COOLING-LOAD PREVIEW
   ========================================================= */

function updateCoolingLoadPreview(index) {
    const room =
        quotation.rooms[index];

    const factorInput =
        document.getElementById(
            `factor-${index}`
        );

    const loadOutput =
        document.getElementById(
            `load-${index}`
        );

    if (
        !room ||
        !factorInput ||
        !loadOutput
    ) {
        return;
    }

    const factor =
        Number(
            factorInput.value
        );

    if (
        ![
            700,
            800,
            900
        ].includes(
            factor
        )
    ) {
        loadOutput.textContent =
            "0 BTU/hr";

        return;
    }

    const load =
        Number(
            room.area
        ) *
        factor;

    room.coolingFactor =
        factor;

    room.coolingLoad =
        load;

    loadOutput.textContent =
        `${number(load)} BTU/hr`;
}

/* =========================================================
   SELECT A SINGLE AC CAPACITY
   ========================================================= */

function selectCapacity(load) {
    const requiredLoad =
        Number(load) ||
        0;

    if (requiredLoad <= 0) {
        return 0;
    }

    const pricedCapacities = [
        12000,
        14000,
        18000,
        22000,
        24000,
        36000
    ];

    return (
        pricedCapacities.find(
            capacity =>
                capacity >=
                requiredLoad
        ) ||
        36000
    );
}

/* =========================================================
   RECOMMEND MULTIPLE AC UNITS
   ========================================================= */

function recommendACUnits(load) {
    let remainingLoad =
        Number(load) ||
        0;

    if (remainingLoad <= 0) {
        return [];
    }

    const recommendedUnits = [];

    /*
       A 36,000 BTU LG cassette is the largest complete
       cooling-only system in the supplied automatic-price
       catalogue.
    */

    while (
        remainingLoad >
        36000
    ) {
        recommendedUnits.push({
            capacity: 36000,
            type: "CASSETTE",
            brand: "LG"
        });

        remainingLoad -=
            36000;
    }

    const selectedCapacity =
        selectCapacity(
            remainingLoad
        );

    let defaultType =
        "HIGHWALL";

    let defaultBrand =
        "VON";

    if (
        selectedCapacity ===
        36000
    ) {
        defaultType =
            "CASSETTE";

        defaultBrand =
            "LG";
    } else if (
        selectedCapacity ===
        24000
    ) {
        defaultType =
            "HIGHWALL";

        defaultBrand =
            "DAIKIN";
    } else if (
        selectedCapacity ===
        22000
    ) {
        defaultType =
            "HIGHWALL";

        defaultBrand =
            "HISENSE";
    } else if (
        selectedCapacity ===
        14000
    ) {
        defaultType =
            "PORTABLE AC";

        defaultBrand =
            "VON";
    }

    recommendedUnits.push({
        capacity: selectedCapacity,
        type: defaultType,
        brand: defaultBrand
    });

    return recommendedUnits;
}

/* =========================================================
   SAVE COOLING LOAD AND CREATE RECOMMENDATIONS
   ========================================================= */

function previewCoolingLoad() {
    let valid = true;

    quotation.rooms.forEach(
        (room, index) => {
            const factorInput =
                document.getElementById(
                    `factor-${index}`
                );

            const factor =
                Number(
                    factorInput?.value
                );

            if (
                ![
                    700,
                    800,
                    900
                ].includes(
                    factor
                )
            ) {
                valid = false;

                return;
            }

            room.coolingFactor =
                factor;

            room.coolingLoad =
                Number(
                    room.area
                ) *
                factor;

            room.acUnits =
                recommendACUnits(
                    room.coolingLoad
                );

            room.capacity =
                room.acUnits.reduce(
                    (
                        sum,
                        unit
                    ) =>
                        sum +
                        Number(
                            unit.capacity ||
                            0
                        ),
                    0
                );
        }
    );

    if (!valid) {
        alert(
            "Please select a cooling load level for every room."
        );

        return;
    }

    /*
       Prices are recreated automatically in the AC
       recommendation preview.
    */

    quotation.acPrices = [];

    renderCoolingLoadPreview();

    showPage(8);
}
/* =========================================================
   ONSITE QUOTATION
   SECTION 3 OF 7
   AUTOMATIC AC PRICES + INSTALLATION + MATERIAL RATES
   ========================================================= */

/* =========================================================
   COOLING-ONLY AC EQUIPMENT CATALOGUE
   ========================================================= */

const AC_EQUIPMENT_CATALOG = [
    {
        brand: "VON",
        type: "HIGHWALL",
        capacity: 12000,
        model: "VAC-124RSTW",
        description:
            "High-wall split AC, cooling-only",
        price: 50540
    },

    {
        brand: "VON",
        type: "HIGHWALL",
        capacity: 18000,
        model: "VAC-184RSTW",
        description:
            "High-wall split AC, cooling-only",
        price: 78100
    },

    {
        brand: "VON",
        type: "PORTABLE AC",
        capacity: 14000,
        model: "VON PORTABLE 14K",
        description:
            "Portable air-conditioning unit",
        price: 73510
    },

    {
        brand: "HISENSE",
        type: "HIGHWALL",
        capacity: 12000,
        model: "AS-12CR4SVETG07",
        description:
            "High-wall split, cooling-only, on/off",
        price: 64320
    },

    {
        brand: "HISENSE",
        type: "HIGHWALL",
        capacity: 18000,
        model: "AS-18CR4SXATG02",
        description:
            "High-wall split, cooling-only, on/off",
        price: 82700
    },

    {
        brand: "HISENSE",
        type: "HIGHWALL",
        capacity: 22000,
        model: "AS-22CR4SBBTG01",
        description:
            "High-wall split, cooling-only, on/off",
        price: 110270
    },

    {
        brand: "LG",
        type: "CASSETTE",
        capacity: 36000,
        model:
            "ATNQ40GNLA4 / AUUQ40GH4",
        description:
            "Cassette inverter system, R410A, cooling-only",
        price: 245600
    },

    {
        brand: "DAIKIN",
        type: "HIGHWALL",
        capacity: 12000,
        model:
            "GTQ35TV16X2Z / RQG35TV16X2Z",
        description:
            "Non-inverter high-wall system, R32, cooling-only, 2-star",
        price: 76260
    },

    {
        brand: "DAIKIN",
        type: "HIGHWALL",
        capacity: 18000,
        model:
            "GTQ50TV16U2Z / RQG50TV16U2Z",
        description:
            "Non-inverter high-wall system, R32, cooling-only, 1-star",
        price: 98320
    },

    {
        brand: "DAIKIN",
        type: "HIGHWALL",
        capacity: 24000,
        model:
            "GTQ60TV16U2Z / RQG60TV16U2Z",
        description:
            "Non-inverter high-wall system, R32, cooling-only, 2-star",
        price: 114860
    },

    {
        brand: "DAIKIN INVERTER",
        type: "HIGHWALL",
        capacity: 12000,
        model:
            "GTKJ35TV16UZ / RKJG35TV16UZ",
        description:
            "Inverter high-wall system, R32, cooling-only, 4-star",
        price: 119450
    },

    {
        brand: "DAIKIN INVERTER",
        type: "HIGHWALL",
        capacity: 18000,
        model:
            "GTKJ50TV16UZ / RKJG50TV16UZ",
        description:
            "Inverter high-wall system, R32, cooling-only, 3-star",
        price: 142430
    },

    {
        brand: "DAIKIN INVERTER",
        type: "HIGHWALL",
        capacity: 24000,
        model:
            "GTKJ60TV16UZ / RKJG60TV16UZ",
        description:
            "Inverter high-wall system, R32, cooling-only, 3-star",
        price: 165400
    },

    {
        brand: "DAIKIN",
        type: "CASSETTE",
        capacity: 18000,
        model: "FCQF18ARV1",
        description:
            "Cassette indoor unit, R32, cooling-only",
        price: 159230
    },

    {
        brand: "DAIKIN",
        type: "CASSETTE",
        capacity: 24000,
        model:
            "FCQF24ARV1 / RGVF24ASV1",
        description:
            "Cassette system, R32, cooling-only",
        price: 185875
    },

    {
        brand: "DAIKIN",
        type: "DUCTABLE AC",
        capacity: 18000,
        model:
            "FDBF18CRV1 / RGF18CRV1",
        description:
            "Ductable system, R32, cooling-only",
        price: 146230
    },

    {
        brand: "DAIKIN",
        type: "DUCTABLE AC",
        capacity: 24000,
        model:
            "FDBF24CRV1 / RGF24CRV1",
        description:
            "Ductable system, R32, cooling-only",
        price: 167680
    }
];

/* =========================================================
   FIND AN EXACT EQUIPMENT COMBINATION
   ========================================================= */

function findCatalogEquipment(unit) {
    return AC_EQUIPMENT_CATALOG.find(
        item =>
            item.brand ===
                unit.brand &&

            item.type ===
                unit.type &&

            Number(
                item.capacity
            ) ===
                Number(
                    unit.capacity
                )
    );
}

/* =========================================================
   FIND A VALID PRICED COMBINATION
   ========================================================= */

function chooseAvailableEquipment(
    unit,
    changedField = ""
) {
    let match =
        findCatalogEquipment(
            unit
        );

    if (match) {
        return match;
    }

    /*
       First try to retain the option the client changed.
    */

    if (
        changedField === "brand"
    ) {
        match =
            AC_EQUIPMENT_CATALOG.find(
                item =>
                    item.brand ===
                        unit.brand &&

                    Number(
                        item.capacity
                    ) ===
                        Number(
                            unit.capacity
                        )
            );
    }

    if (
        !match &&
        changedField === "type"
    ) {
        match =
            AC_EQUIPMENT_CATALOG.find(
                item =>
                    item.type ===
                        unit.type &&

                    Number(
                        item.capacity
                    ) ===
                        Number(
                            unit.capacity
                        )
            );
    }

    if (
        !match &&
        changedField === "capacity"
    ) {
        match =
            AC_EQUIPMENT_CATALOG.find(
                item =>
                    Number(
                        item.capacity
                    ) ===
                        Number(
                            unit.capacity
                        ) &&

                    item.type ===
                        unit.type
            );
    }

    /*
       If the exact combination is unavailable, retain the
       selected capacity and use the first priced product
       available for that capacity.
    */

    if (!match) {
        match =
            AC_EQUIPMENT_CATALOG.find(
                item =>
                    Number(
                        item.capacity
                    ) ===
                    Number(
                        unit.capacity
                    )
            );
    }

    if (!match) {
        match =
            AC_EQUIPMENT_CATALOG[0];
    }

    unit.brand =
        match.brand;

    unit.type =
        match.type;

    unit.capacity =
        match.capacity;

    unit.model =
        match.model;

    unit.description =
        match.description;

    unit.unitPrice =
        match.price;

    return match;
}

/* =========================================================
   GROUP IDENTICAL AC COMBINATIONS
   ========================================================= */

function getACCombinations() {
    const combinations =
        new Map();

    quotation.rooms.forEach(room => {
        (
            room.acUnits ||
            []
        ).forEach(unit => {
            const capacity =
                Number(
                    unit.capacity
                ) ||
                0;

            const type =
                unit.type ||
                "HIGHWALL";

            const brand =
                unit.brand ||
                "VON";

            const key =
                `${capacity}|${type}|${brand}`;

            if (
                !combinations.has(
                    key
                )
            ) {
                combinations.set(
                    key,
                    {
                        key,
                        capacity,
                        type,
                        brand,
                        rooms: [],
                        quantity: 0
                    }
                );
            }

            const combination =
                combinations.get(
                    key
                );

            combination.quantity +=
                1;

            if (
                !combination.rooms.includes(
                    room.name
                )
            ) {
                combination.rooms.push(
                    room.name
                );
            }
        });
    });

    return [
        ...combinations.values()
    ].sort(
        (
            first,
            second
        ) =>
            second.capacity -
                first.capacity ||

            first.type.localeCompare(
                second.type
            ) ||

            first.brand.localeCompare(
                second.brand
            )
    );
}

/* =========================================================
   AUTOMATICALLY ADD AC PRICES
   ========================================================= */

function syncAutomaticACPrices() {
    quotation.rooms.forEach(room => {
        (
            room.acUnits ||
            []
        ).forEach(unit => {
            const equipment =
                chooseAvailableEquipment(
                    unit
                );

            unit.model =
                equipment.model;

            unit.description =
                equipment.description;

            unit.unitPrice =
                equipment.price;
        });
    });

    quotation.acPrices =
        getACCombinations()
            .map(combination => {
                const equipment =
                    findCatalogEquipment(
                        combination
                    );

                const unitPrice =
                    Number(
                        equipment?.price
                    ) ||
                    0;

                return {
                    ...combination,

                    model:
                        equipment?.model ||
                        "",

                    description:
                        equipment?.description ||
                        "",

                    unitPrice,

                    total:
                        Number(
                            combination.quantity
                        ) *
                        unitPrice
                };
            });
}

/* =========================================================
   AC RECOMMENDATION PREVIEW
   ========================================================= */

function renderCoolingLoadPreview() {
    const container =
        document.getElementById(
            "coolingLoadPreview"
        );

    if (!container) {
        return;
    }

    syncAutomaticACPrices();

    const capacities = [
        ...new Set(
            AC_EQUIPMENT_CATALOG.map(
                item =>
                    item.capacity
            )
        )
    ].sort(
        (
            first,
            second
        ) =>
            first -
            second
    );

    const types = [
        ...new Set(
            AC_EQUIPMENT_CATALOG.map(
                item =>
                    item.type
            )
        )
    ];

    const brands = [
        ...new Set(
            AC_EQUIPMENT_CATALOG.map(
                item =>
                    item.brand
            )
        )
    ];

    container.innerHTML =
        quotation.rooms
            .map(
                (
                    room,
                    roomIndex
                ) => {
                    const totalCapacity =
                        (
                            room.acUnits ||
                            []
                        ).reduce(
                            (
                                sum,
                                unit
                            ) =>
                                sum +
                                Number(
                                    unit.capacity ||
                                    0
                                ),
                            0
                        );

                    return `
                        <div class="card">

                            <h3>
                                ${roomIndex + 1}.
                                ${escapeHTML(
                                    room.name
                                )}
                            </h3>

                            <p>
                                Room Area:

                                <strong>
                                    ${number(
                                        room.area
                                    )}
                                    m²
                                </strong>
                            </p>

                            <p>
                                Cooling Load Factor:

                                <strong>
                                    ${number(
                                        room.coolingFactor
                                    )}
                                </strong>
                            </p>

                            <p>
                                Calculated Cooling Load:

                                <strong>
                                    ${number(
                                        room.coolingLoad
                                    )}
                                    BTU/hr
                                </strong>
                            </p>

                            <p>
                                <strong>
                                    Recommended AC Unit(s)
                                </strong>
                            </p>

                            ${
                                (
                                    room.acUnits ||
                                    []
                                )
                                    .map(
                                        (
                                            unit,
                                            unitIndex
                                        ) => {
                                            const equipment =
                                                findCatalogEquipment(
                                                    unit
                                                );

                                            return `
                                                <div class="ac-recommendation-unit">

                                                    <h4>
                                                        Unit ${unitIndex + 1}
                                                    </h4>

                                                    <label>
                                                        Capacity

                                                        <select
                                                            onchange="
                                                                updateRecommendedAC(
                                                                    ${roomIndex},
                                                                    ${unitIndex},
                                                                    'capacity',
                                                                    this.value
                                                                )
                                                            "
                                                        >
                                                            ${
                                                                capacities
                                                                    .map(
                                                                        capacity => `
                                                                            <option
                                                                                value="${capacity}"
                                                                                ${
                                                                                    Number(
                                                                                        unit.capacity
                                                                                    ) === capacity
                                                                                        ? "selected"
                                                                                        : ""
                                                                                }
                                                                            >
                                                                                ${
                                                                                    capacity.toLocaleString(
                                                                                        "en-KE"
                                                                                    )
                                                                                }
                                                                                BTU/hr
                                                                            </option>
                                                                        `
                                                                    )
                                                                    .join("")
                                                            }
                                                        </select>
                                                    </label>

                                                    <label>
                                                        AC Type

                                                        <select
                                                            onchange="
                                                                updateRecommendedAC(
                                                                    ${roomIndex},
                                                                    ${unitIndex},
                                                                    'type',
                                                                    this.value
                                                                )
                                                            "
                                                        >
                                                            ${
                                                                types
                                                                    .map(
                                                                        type => `
                                                                            <option
                                                                                value="${escapeHTML(type)}"
                                                                                ${
                                                                                    unit.type === type
                                                                                        ? "selected"
                                                                                        : ""
                                                                                }
                                                                            >
                                                                                ${escapeHTML(type)}
                                                                            </option>
                                                                        `
                                                                    )
                                                                    .join("")
                                                            }
                                                        </select>
                                                    </label>

                                                    <label>
                                                        Brand

                                                        <select
                                                            onchange="
                                                                updateRecommendedAC(
                                                                    ${roomIndex},
                                                                    ${unitIndex},
                                                                    'brand',
                                                                    this.value
                                                                )
                                                            "
                                                        >
                                                            ${
                                                                brands
                                                                    .map(
                                                                        brand => `
                                                                            <option
                                                                                value="${escapeHTML(brand)}"
                                                                                ${
                                                                                    unit.brand === brand
                                                                                        ? "selected"
                                                                                        : ""
                                                                                }
                                                                            >
                                                                                ${escapeHTML(brand)}
                                                                            </option>
                                                                        `
                                                                    )
                                                                    .join("")
                                                            }
                                                        </select>
                                                    </label>

                                                    <div class="info-box">

                                                        <strong>
                                                            ${
                                                                escapeHTML(
                                                                    equipment?.model ||
                                                                    "Model unavailable"
                                                                )
                                                            }
                                                        </strong>

                                                        <br>

                                                        ${
                                                            escapeHTML(
                                                                equipment?.description ||
                                                                "Select another combination."
                                                            )
                                                        }

                                                        <br>

                                                        Automatic Unit Price:

                                                        <strong>
                                                            ${
                                                                money(
                                                                    equipment?.price ||
                                                                    0
                                                                )
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>
                                            `;
                                        }
                                    )
                                    .join("")
                            }

                            <div class="info-box">
                                Total Selected Capacity:

                                <strong>
                                    ${
                                        totalCapacity.toLocaleString(
                                            "en-KE"
                                        )
                                    }
                                    BTU/hr
                                </strong>
                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}

/* =========================================================
   UPDATE A RECOMMENDED AC UNIT
   ========================================================= */

function updateRecommendedAC(
    roomIndex,
    unitIndex,
    field,
    value
) {
    const room =
        quotation.rooms[
            roomIndex
        ];

    const unit =
        room &&
        room.acUnits &&
        room.acUnits[
            unitIndex
        ];

    if (
        !unit ||
        ![
            "capacity",
            "type",
            "brand"
        ].includes(
            field
        )
    ) {
        return;
    }

    unit[field] =
        field === "capacity"
            ? Number(value)
            : String(value);

    chooseAvailableEquipment(
        unit,
        field
    );

    room.capacity =
        room.acUnits.reduce(
            (
                sum,
                item
            ) =>
                sum +
                Number(
                    item.capacity ||
                    0
                ),
            0
        );

    syncAutomaticACPrices();

    renderCoolingLoadPreview();
}

/* =========================================================
   CONTINUE AFTER AC RECOMMENDATION
   ========================================================= */

function goToACPrices() {
    if (
        !quotation.rooms ||
        quotation.rooms.length === 0
    ) {
        alert(
            "No rooms or AC recommendations were found."
        );

        return;
    }

    const missingRecommendation =
        quotation.rooms.some(
            room =>
                !Array.isArray(
                    room.acUnits
                ) ||
                room.acUnits.length === 0
        );

    if (missingRecommendation) {
        alert(
            "AC recommendations have not been calculated."
        );

        showPage(7);

        return;
    }

    syncAutomaticACPrices();

    /*
       The manual AC-price page is skipped because prices
       are now entered automatically in the recommendation
       preview.
    */

    if (isSupplyOnly()) {
        showPage(13);

        configureClientFields();
    } else {
        goToMaterialRates();
    }
}

/* =========================================================
   COMPATIBILITY WITH THE OLD AC-PRICE PAGE
   ========================================================= */

function renderACPriceInputs() {
    const container =
        document.getElementById(
            "acPriceInputs"
        );

    if (!container) {
        return;
    }

    syncAutomaticACPrices();

    container.innerHTML =
        quotation.acPrices
            .map(item => `
                <div class="card">

                    <h3>
                        ${escapeHTML(
                            item.brand
                        )}

                        ${
                            Number(
                                item.capacity
                            ).toLocaleString(
                                "en-KE"
                            )
                        }
                        BTU/hr

                        ${escapeHTML(
                            item.type
                        )}
                    </h3>

                    <p>
                        Model:

                        <strong>
                            ${escapeHTML(
                                item.model
                            )}
                        </strong>
                    </p>

                    <p>
                        Room(s):

                        <strong>
                            ${
                                (
                                    item.rooms ||
                                    []
                                )
                                    .map(
                                        escapeHTML
                                    )
                                    .join(", ")
                            }
                        </strong>
                    </p>

                    <p>
                        Quantity:

                        <strong>
                            ${item.quantity}
                        </strong>
                    </p>

                    <p>
                        Automatic Unit Price:

                        <strong>
                            ${money(
                                item.unitPrice
                            )}
                        </strong>
                    </p>

                    <p>
                        Total:

                        <strong>
                            ${money(
                                item.total
                            )}
                        </strong>
                    </p>

                </div>
            `)
            .join("");
}

function saveACPrices() {
    syncAutomaticACPrices();

    if (isSupplyOnly()) {
        showPage(13);

        configureClientFields();
    } else {
        goToMaterialRates();
    }
}

/* =========================================================
   TOTAL NUMBER OF AC UNITS
   ========================================================= */

function getTotalACUnits() {
    return quotation.rooms.reduce(
        (
            total,
            room
        ) =>
            total +
            (
                room.acUnits ||
                []
            ).length,
        0
    );
}

/* =========================================================
   INSTALLATION AND COMMISSIONING RATES
   ========================================================= */

const INSTALLATION_RATES = {
    "Mombasa Region": {
        HIGHWALL: 6500,
        CASSETTE: 8500,
        DUCTABLE: 10500,
        "FLOOR STANDING": 10500
    },

    "Kilifi County Up to Kilifi Town": {
        HIGHWALL: 10500,
        CASSETTE: 10500,
        DUCTABLE: 13000,
        "FLOOR STANDING": 12500
    },

    "Kilifi County After Kilifi Town": {
        HIGHWALL: 12500,
        CASSETTE: 12500,
        DUCTABLE: 14000,
        "FLOOR STANDING": 13500
    },

    "Kwale County Up to Ukunda": {
        HIGHWALL: 10500,
        CASSETTE: 10500,
        DUCTABLE: 13000,
        "FLOOR STANDING": 12500
    },

    "Kwale County After Ukunda": {
        HIGHWALL: 12500,
        CASSETTE: 12500,
        DUCTABLE: 14000,
        "FLOOR STANDING": 13500
    },

    "Taita Taveta County": {
        HIGHWALL: 14500,
        CASSETTE: 14500,
        DUCTABLE: 18000,
        "FLOOR STANDING": 17500
    },

    "Tana River County": {
        HIGHWALL: 14500,
        CASSETTE: 14500,
        DUCTABLE: 19000,
        "FLOOR STANDING": 18500
    },

    "Lamu County": {
        HIGHWALL: 17000,
        CASSETTE: 17000,
        DUCTABLE: 21000,
        "FLOOR STANDING": 20500
    }
};

/* =========================================================
   NORMALIZE INSTALLATION AC TYPE
   ========================================================= */

function normalizeInstallationType(type) {
    const normalizedType =
        String(
            type ||
            ""
        )
            .trim()
            .toUpperCase();

    if (
        normalizedType ===
        "DUCTABLE AC"
    ) {
        return "DUCTABLE";
    }

    if (
        normalizedType ===
        "PORTABLE AC"
    ) {
        return "HIGHWALL";
    }

    return normalizedType;
}

/* =========================================================
   GET INSTALLATION UNIT COST
   ========================================================= */

function getInstallationUnitCost(
    region =
        quotation.installationRegion,
    type =
        quotation.acType
) {
    const normalizedType =
        normalizeInstallationType(
            type
        );

    return Number(
        INSTALLATION_RATES[
            region
        ]?.[
            normalizedType
        ] ||
        0
    );
}

/* =========================================================
   GET INSTALLATION TOTAL
   ========================================================= */

function getInstallationTotal() {
    return (
        Number(
            quotation.installationUnitCount ||
            0
        ) *
        Number(
            quotation.installationUnitCost ||
            0
        )
    );
}

/* =========================================================
   RENDER INSTALLATION COST PAGE
   ========================================================= */

function renderInstallationCostPage() {
    const container =
        document.getElementById(
            "installationCostContainer"
        ) ||
        document.getElementById(
            "installationCosts"
        ) ||
        document.getElementById(
            "additionalItems"
        );

    if (!container) {
        console.warn(
            "Installation cost container was not found."
        );

        return;
    }

    const regions =
        Object.keys(
            INSTALLATION_RATES
        );

    const installationTypes = [
        "HIGHWALL",
        "CASSETTE",
        "DUCTABLE",
        "FLOOR STANDING"
    ];

    const unitCount =
        getTotalACUnits();

    quotation.installationUnitCount =
        unitCount;

    container.innerHTML = `
        <div class="card">

            <h2>
                Installation and Commissioning
            </h2>

            <p>
                Number of AC units:

                <strong>
                    ${unitCount}
                </strong>
            </p>

            <label>
                Installation Region

                <select
                    id="installationRegion"
                    onchange="updateInstallationPreview()"
                >
                    <option value="">
                        Select installation region
                    </option>

                    ${
                        regions
                            .map(region => `
                                <option
                                    value="${escapeHTML(region)}"
                                    ${
                                        quotation.installationRegion === region
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    ${escapeHTML(region)}
                                </option>
                            `)
                            .join("")
                    }
                </select>
            </label>

            <label>
                Main AC Type

                <select
                    id="installationACType"
                    onchange="updateInstallationPreview()"
                >
                    <option value="">
                        Select AC type
                    </option>

                    ${
                        installationTypes
                            .map(type => `
                                <option
                                    value="${escapeHTML(type)}"
                                    ${
                                        normalizeInstallationType(
                                            quotation.acType
                                        ) === type
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    ${escapeHTML(type)}
                                </option>
                            `)
                            .join("")
                    }
                </select>
            </label>

            <div class="info-box">

                Installation Cost per Unit:

                <strong id="installationUnitCostPreview">
                    ${money(
                        getInstallationUnitCost()
                    )}
                </strong>

                <br>

                Installation Total:

                <strong id="installationTotalPreview">
                    ${money(
                        getInstallationTotal()
                    )}
                </strong>

            </div>

            <button
                type="button"
                class="primary-button full-width"
                onclick="saveInstallationCosts()"
            >
                Continue to Accessories
            </button>

        </div>
    `;
}

/* =========================================================
   UPDATE INSTALLATION COST PREVIEW
   ========================================================= */

function updateInstallationPreview() {
    const region =
        document.getElementById(
            "installationRegion"
        )?.value ||
        "";

    const type =
        document.getElementById(
            "installationACType"
        )?.value ||
        "";

    const unitCount =
        getTotalACUnits();

    const unitCost =
        getInstallationUnitCost(
            region,
            type
        );

    const total =
        unitCount *
        unitCost;

    const unitCostOutput =
        document.getElementById(
            "installationUnitCostPreview"
        );

    const totalOutput =
        document.getElementById(
            "installationTotalPreview"
        );

    if (unitCostOutput) {
        unitCostOutput.textContent =
            money(
                unitCost
            );
    }

    if (totalOutput) {
        totalOutput.textContent =
            money(
                total
            );
    }
}

/* =========================================================
   OPEN INSTALLATION COST PAGE
   ========================================================= */

function goToInstallationCosts() {
    if (isSupplyOnly()) {
        showPage(13);

        configureClientFields();

        return;
    }

    renderInstallationCostPage();

    showPage(11);
}

/* =========================================================
   SAVE INSTALLATION COST
   ========================================================= */

function saveInstallationCosts() {
    const region =
        document.getElementById(
            "installationRegion"
        )?.value ||
        "";

    const type =
        document.getElementById(
            "installationACType"
        )?.value ||
        "";

    const unitCount =
        getTotalACUnits();

    const unitCost =
        getInstallationUnitCost(
            region,
            type
        );

    if (!region) {
        alert(
            "Please select the installation region."
        );

        return;
    }

    if (!type) {
        alert(
            "Please select the main AC type."
        );

        return;
    }

    if (
        unitCount <= 0 ||
        unitCost <= 0
    ) {
        alert(
            "Unable to calculate the installation cost."
        );

        return;
    }

    quotation.installationRegion =
        region;

    quotation.acType =
        type;

    quotation.installationUnitCount =
        unitCount;

    quotation.installationUnitCost =
        unitCost;

    quotation.installationTotal =
        unitCount *
        unitCost;

    renderAdditionalItems();

    showPage(12);
}

/* =========================================================
   MATERIAL RATES PAGE
   ========================================================= */

function goToMaterialRates() {
    ensureFlexibleCableRateFields();

    const copperInput =
        document.getElementById(
            "copperRate"
        );

    const drainageInput =
        document.getElementById(
            "drainageRate"
        );

    const cableTypeInput =
        document.getElementById(
            "flexibleCableType"
        );

    const cableRateInput =
        document.getElementById(
            "flexibleCableRate"
        );

    if (copperInput) {
        copperInput.value =
            Number(
                quotation.copperRate
            ) ||
            3200;
    }

    if (drainageInput) {
        drainageInput.value =
            Number(
                quotation.drainageRate
            ) ||
            1200;
    }

    if (cableTypeInput) {
        cableTypeInput.value =
            quotation.flexibleCableType ||
            "1.5mm 3 core flexible cable";
    }

    if (cableRateInput) {
        cableRateInput.value =
            Number(
                quotation.flexibleCableRate
            ) ||
            500;
    }

    showPage(10);
}

/* =========================================================
   ADD FLEXIBLE-CABLE FIELDS TO MATERIAL-RATE PAGE
   ========================================================= */

function ensureFlexibleCableRateFields() {
    if (
        document.getElementById(
            "flexibleCableType"
        )
    ) {
        return;
    }

    const drainageInput =
        document.getElementById(
            "drainageRate"
        );

    if (!drainageInput) {
        return;
    }

    const drainageField =
        drainageInput.closest(
            ".form-group, .input-group, .field, label"
        ) ||
        drainageInput.parentElement;

    if (
        !drainageField ||
        !drainageField.parentNode
    ) {
        return;
    }

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        drainageField.className ||
        "form-group";

    wrapper.innerHTML = `
        <label for="flexibleCableType">
            Flexible Cable Type
        </label>

        <select id="flexibleCableType">

            <option value="1.5mm 3 core flexible cable">
                1.5mm 3 core flexible cable
            </option>

            <option value="2.5mm 3 core flexible cable">
                2.5mm 3 core flexible cable
            </option>

            <option value="1.5mm 4 core flexible cable">
                1.5mm 4 core flexible cable
            </option>

            <option value="2.5mm 4 core flexible cable">
                2.5mm 4 core flexible cable
            </option>

        </select>

        <label for="flexibleCableRate">
            Flexible Cable Rate per Metre (KES)
        </label>

        <input
            id="flexibleCableRate"
            type="number"
            min="0"
            step="0.01"
            inputmode="decimal"
            value="500"
            placeholder="500"
        >

        <small>
            The flexible-cable length is equal to the total
            copper length.
        </small>
    `;

    drainageField.parentNode.insertBefore(
        wrapper,
        drainageField
    );
}

/* =========================================================
   SAVE MATERIAL RATES
   ========================================================= */

function saveMaterialRates() {
    const copperRate =
        Number(
            document.getElementById(
                "copperRate"
            )?.value
        );

    const flexibleCableType =
        document.getElementById(
            "flexibleCableType"
        )?.value ||
        "1.5mm 3 core flexible cable";

    const flexibleCableRate =
        Number(
            document.getElementById(
                "flexibleCableRate"
            )?.value
        );

    const drainageRate =
        Number(
            document.getElementById(
                "drainageRate"
            )?.value
        );

    if (
        !Number.isFinite(
            copperRate
        ) ||
        copperRate < 0
    ) {
        alert(
            "Please enter a valid copper rate."
        );

        return;
    }

    if (
        !Number.isFinite(
            flexibleCableRate
        ) ||
        flexibleCableRate < 0
    ) {
        alert(
            "Please enter a valid flexible cable rate."
        );

        return;
    }

    if (
        !Number.isFinite(
            drainageRate
        ) ||
        drainageRate < 0
    ) {
        alert(
            "Please enter a valid drainage rate."
        );

        return;
    }

    quotation.copperRate =
        copperRate;

    quotation.flexibleCableType =
        flexibleCableType;

    quotation.flexibleCableRate =
        flexibleCableRate;

    quotation.drainageRate =
        drainageRate;

    goToInstallationCosts();
}
/* =========================================================
   ONSITE QUOTATION
   SECTION 4 OF 7
   ACCESSORIES + OPTIONAL ITEMS
   ========================================================= */

/* =========================================================
   OPTIONAL ACCESSORY CATALOGUE
   ========================================================= */

const OPTIONAL_ACCESSORY_CATALOG = {
    VXV13ABAS: {
        category:
            "VOLT SWITCHER",

        brand:
            "VON",

        model:
            "VXV13ABAS",

        name:
            "VON Volt Switcher AVS 13A",

        description:
            "13-amp voltage switcher recommended for 12K–18K BTU AC units",

        price:
            4320
    },

    VXV30ABAS: {
        category:
            "VOLT SWITCHER",

        brand:
            "VON",

        model:
            "VXV30ABAS",

        name:
            "VON Volt Switcher VS 30A",

        description:
            "30-amp voltage switcher recommended for 24K–36K BTU AC units",

        price:
            5185
    },

    "PT-MCHWO": {
        category:
            "CASSETTE PANEL",

        brand:
            "LG",

        model:
            "PT-MCHWO",

        name:
            "LG Cassette Decoration Panel",

        description:
            "Cassette decoration panel compatible with LG 18K, 24K and 36K cassette units",

        price:
            16100
    },

    BYCQ4BEAF: {
        category:
            "CASSETTE PANEL",

        brand:
            "DAIKIN",

        model:
            "BYCQ4BEAF",

        name:
            "Daikin Cassette Decoration Panel",

        description:
            "Decoration panel for Daikin cassette indoor units",

        price:
            24700
    }
};

/* =========================================================
   RECOMMEND VOLT-SWITCHER MODEL
   ========================================================= */

function getRecommendedVoltSwitcherModel() {
    const capacities = [];

    quotation.rooms.forEach(room => {
        (
            room.acUnits ||
            []
        ).forEach(unit => {
            capacities.push(
                Number(
                    unit.capacity ||
                    0
                )
            );
        });
    });

    const hasLargeUnit =
        capacities.some(
            capacity =>
                capacity >= 24000
        );

    return hasLargeUnit
        ? "VXV30ABAS"
        : "VXV13ABAS";
}

/* =========================================================
   COUNT CASSETTE UNITS
   ========================================================= */

function getCassetteUnitCount() {
    return quotation.rooms.reduce(
        (
            total,
            room
        ) =>
            total +
            (
                room.acUnits ||
                []
            ).filter(
                unit =>
                    unit.type ===
                    "CASSETTE"
            ).length,
        0
    );
}

/* =========================================================
   RENDER ADDITIONAL ITEMS PAGE
   ========================================================= */

function renderAdditionalItems() {
    const container =
        document.getElementById(
            "additionalItems"
        );

    if (!container) {
        return;
    }

    /*
       Use the recommended AVS as the initial selection.
       Retain the client's selection when returning to this
       page.
    */

    if (
        !quotation.voltSwitcherModel
    ) {
        quotation.voltSwitcherModel =
            getRecommendedVoltSwitcherModel();
    }

    const defaultVoltQuantity =
        quotation.voltSwitcherQuantity ||
        getTotalACUnits() ||
        1;

    const defaultPanelQuantity =
        quotation.cassettePanelQuantity ||
        getCassetteUnitCount() ||
        1;

    container.innerHTML = `
        <div class="card">

            <h2>
                Installation Commissioning & Accessories
            </h2>

            <p>
                Select the accessories required for this quotation.
                You may also add another item manually.
            </p>

        </div>

        <!-- ===============================================
             VOLT SWITCHER
        ================================================ -->

        <div class="card">

            <h3>
                VON Volt Switcher
            </h3>

            <label class="checkbox-label">

                <input
                    type="checkbox"
                    id="includeVoltSwitcher"
                    ${
                        quotation.includeVoltSwitcher
                            ? "checked"
                            : ""
                    }
                    onchange="toggleVoltSwitcherOptions()"
                >

                Include volt switchers

            </label>

            <div
                id="voltSwitcherOptions"
                style="
                    display:${
                        quotation.includeVoltSwitcher
                            ? "block"
                            : "none"
                    };
                "
            >

                <label>
                    Select AVS

                    <select
                        id="voltSwitcherModel"
                        onchange="updateVoltSwitcherPreview()"
                    >

                        <option
                            value="VXV13ABAS"
                            ${
                                quotation.voltSwitcherModel ===
                                "VXV13ABAS"
                                    ? "selected"
                                    : ""
                            }
                        >
                            VON VXV13ABAS — 13A — KES 4,320
                        </option>

                        <option
                            value="VXV30ABAS"
                            ${
                                quotation.voltSwitcherModel ===
                                "VXV30ABAS"
                                    ? "selected"
                                    : ""
                            }
                        >
                            VON VXV30ABAS — 30A — KES 5,185
                        </option>

                    </select>
                </label>

                <small>
                    Use the 13A model for 12K–18K BTU units
                    and the 30A model for 24K–36K BTU units.
                </small>

                <label>
                    Number Required

                    <input
                        type="number"
                        id="voltSwitcherQuantity"
                        min="1"
                        step="1"
                        value="${defaultVoltQuantity}"
                        oninput="updateVoltSwitcherPreview()"
                    >
                </label>

                <div class="info-box">

                    Volt Switcher Total:

                    <strong id="voltSwitcherTotal">
                        KES 0.00
                    </strong>

                </div>

            </div>

        </div>

        <!-- ===============================================
             CASSETTE PANEL
        ================================================ -->

        <div class="card">

            <h3>
                Cassette Decoration Panel
            </h3>

            <label class="checkbox-label">

                <input
                    type="checkbox"
                    id="includeCassettePanel"
                    ${
                        quotation.includeCassettePanel
                            ? "checked"
                            : ""
                    }
                    onchange="toggleCassettePanelOptions()"
                >

                Include cassette decoration panels

            </label>

            <div
                id="cassettePanelOptions"
                style="
                    display:${
                        quotation.includeCassettePanel
                            ? "block"
                            : "none"
                    };
                "
            >

                <label>
                    Panel Brand and Model

                    <select
                        id="cassettePanelModel"
                        onchange="updateCassettePanelPreview()"
                    >

                        <option
                            value="PT-MCHWO"
                            ${
                                quotation.cassettePanelModel ===
                                "PT-MCHWO"
                                    ? "selected"
                                    : ""
                            }
                        >
                            LG PT-MCHWO — KES 16,100
                        </option>

                        <option
                            value="BYCQ4BEAF"
                            ${
                                quotation.cassettePanelModel ===
                                "BYCQ4BEAF"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Daikin BYCQ4BEAF — KES 24,700
                        </option>

                    </select>
                </label>

                <label>
                    Number Required

                    <input
                        type="number"
                        id="cassettePanelQuantity"
                        min="1"
                        step="1"
                        value="${defaultPanelQuantity}"
                        oninput="updateCassettePanelPreview()"
                    >
                </label>

                <div class="info-box">

                    Cassette Panel Total:

                    <strong id="cassettePanelTotal">
                        KES 0.00
                    </strong>

                </div>

            </div>

        </div>

        <!-- ===============================================
             MANUAL ACCESSORY
        ================================================ -->

        <div class="card">

            <h3>
                Add Another Accessory or Item
            </h3>

            <label>
                Item Description

                <input
                    type="text"
                    id="extraItemDescription"
                    placeholder="e.g. Outdoor unit brackets"
                >
            </label>

            <label>
                Quantity

                <input
                    type="number"
                    id="extraItemQty"
                    min="1"
                    step="1"
                    value="1"
                    oninput="calculateExtraItem()"
                >
            </label>

            <label>
                Unit Price (KES)

                <input
                    type="number"
                    id="extraItemPrice"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 1500"
                    oninput="calculateExtraItem()"
                >
            </label>

            <div class="info-box">

                Item Total:

                <strong id="extraItemTotal">
                    KES 0.00
                </strong>

            </div>

            <button
                type="button"
                class="secondary-button full-width"
                onclick="saveExtraItem()"
            >
                Add Item
            </button>

        </div>

        <!-- ===============================================
             SAVED ITEMS
        ================================================ -->

        <div id="additionalItemsPreview"></div>

        <!-- ===============================================
             AS-BUILT DRAWING
        ================================================ -->

        <div class="card">

            <h3>
                As-Built Drawing
            </h3>

            <label class="checkbox-label">

                <input
                    type="checkbox"
                    id="includeAsBuiltDrawing"
                    ${
                        quotation.includeAsBuiltDrawing
                            ? "checked"
                            : ""
                    }
                    onchange="toggleAsBuiltDrawing()"
                >

                Include as-built drawing

            </label>

            <div
                id="asBuiltDrawingCostContainer"
                style="
                    display:${
                        quotation.includeAsBuiltDrawing
                            ? "block"
                            : "none"
                    };
                "
            >

                <label>
                    As-Built Drawing Cost (KES)

                    <input
                        type="number"
                        id="asBuiltDrawingCost"
                        min="0"
                        step="0.01"
                        value="${
                            Number(
                                quotation.asBuiltDrawingCost
                            ) ||
                            5000
                        }"
                    >
                </label>

            </div>

        </div>

        <button
            type="button"
            class="primary-button full-width"
            onclick="finishAdditionalItems()"
        >
            Continue to Client Details
        </button>
    `;

    renderAdditionalItemsPreview();

    updateVoltSwitcherPreview();

    updateCassettePanelPreview();

    calculateExtraItem();
}

/* =========================================================
   TOGGLE VOLT-SWITCHER OPTIONS
   ========================================================= */

function toggleVoltSwitcherOptions() {
    const checkbox =
        document.getElementById(
            "includeVoltSwitcher"
        );

    const options =
        document.getElementById(
            "voltSwitcherOptions"
        );

    if (options) {
        options.style.display =
            checkbox?.checked
                ? "block"
                : "none";
    }

    updateVoltSwitcherPreview();
}

/* =========================================================
   UPDATE VOLT-SWITCHER TOTAL
   ========================================================= */

function updateVoltSwitcherPreview() {
    const checkbox =
        document.getElementById(
            "includeVoltSwitcher"
        );

    const model =
        document.getElementById(
            "voltSwitcherModel"
        )?.value ||
        "VXV13ABAS";

    const quantity =
        Math.max(
            1,
            Number(
                document.getElementById(
                    "voltSwitcherQuantity"
                )?.value
            ) ||
            1
        );

    const item =
        OPTIONAL_ACCESSORY_CATALOG[
            model
        ];

    const total =
        checkbox?.checked
            ? quantity *
                Number(
                    item?.price ||
                    0
                )
            : 0;

    const output =
        document.getElementById(
            "voltSwitcherTotal"
        );

    if (output) {
        output.textContent =
            money(
                total
            );
    }
}

/* =========================================================
   TOGGLE CASSETTE-PANEL OPTIONS
   ========================================================= */

function toggleCassettePanelOptions() {
    const checkbox =
        document.getElementById(
            "includeCassettePanel"
        );

    const options =
        document.getElementById(
            "cassettePanelOptions"
        );

    if (options) {
        options.style.display =
            checkbox?.checked
                ? "block"
                : "none";
    }

    updateCassettePanelPreview();
}

/* =========================================================
   UPDATE CASSETTE-PANEL TOTAL
   ========================================================= */

function updateCassettePanelPreview() {
    const checkbox =
        document.getElementById(
            "includeCassettePanel"
        );

    const model =
        document.getElementById(
            "cassettePanelModel"
        )?.value ||
        "PT-MCHWO";

    const quantity =
        Math.max(
            1,
            Number(
                document.getElementById(
                    "cassettePanelQuantity"
                )?.value
            ) ||
            1
        );

    const item =
        OPTIONAL_ACCESSORY_CATALOG[
            model
        ];

    const total =
        checkbox?.checked
            ? quantity *
                Number(
                    item?.price ||
                    0
                )
            : 0;

    const output =
        document.getElementById(
            "cassettePanelTotal"
        );

    if (output) {
        output.textContent =
            money(
                total
            );
    }
}

/* =========================================================
   TOGGLE AS-BUILT DRAWING
   ========================================================= */

function toggleAsBuiltDrawing() {
    const checkbox =
        document.getElementById(
            "includeAsBuiltDrawing"
        );

    const container =
        document.getElementById(
            "asBuiltDrawingCostContainer"
        );

    if (container) {
        container.style.display =
            checkbox?.checked
                ? "block"
                : "none";
    }
}

/* =========================================================
   CALCULATE MANUAL ITEM TOTAL
   ========================================================= */

function calculateExtraItem() {
    const quantity =
        Number(
            document.getElementById(
                "extraItemQty"
            )?.value
        ) ||
        0;

    const unitPrice =
        Number(
            document.getElementById(
                "extraItemPrice"
            )?.value
        ) ||
        0;

    const total =
        quantity *
        unitPrice;

    const output =
        document.getElementById(
            "extraItemTotal"
        );

    if (output) {
        output.textContent =
            money(
                total
            );
    }

    return total;
}

/* =========================================================
   SAVE MANUAL ITEM
   ========================================================= */

function saveExtraItem() {
    const description =
        document.getElementById(
            "extraItemDescription"
        )?.value.trim() ||
        "";

    const quantity =
        Number(
            document.getElementById(
                "extraItemQty"
            )?.value
        );

    const unitPrice =
        Number(
            document.getElementById(
                "extraItemPrice"
            )?.value
        );

    if (!description) {
        alert(
            "Please enter the item description."
        );

        return;
    }

    if (
        !Number.isFinite(
            quantity
        ) ||
        quantity <= 0
    ) {
        alert(
            "Please enter a valid quantity."
        );

        return;
    }

    if (
        !Number.isFinite(
            unitPrice
        ) ||
        unitPrice < 0
    ) {
        alert(
            "Please enter a valid unit price."
        );

        return;
    }

    quotation.additionalItems.push({
        name:
            description,

        description:
            description,

        quantity,

        unitPrice,

        total:
            quantity *
            unitPrice,

        selfServiceAccessory:
            false
    });

    const descriptionInput =
        document.getElementById(
            "extraItemDescription"
        );

    const quantityInput =
        document.getElementById(
            "extraItemQty"
        );

    const priceInput =
        document.getElementById(
            "extraItemPrice"
        );

    if (descriptionInput) {
        descriptionInput.value =
            "";
    }

    if (quantityInput) {
        quantityInput.value =
            "1";
    }

    if (priceInput) {
        priceInput.value =
            "";
    }

    calculateExtraItem();

    renderAdditionalItemsPreview();
}

/* =========================================================
   RENDER SAVED ADDITIONAL ITEMS
   ========================================================= */

function renderAdditionalItemsPreview() {
    const container =
        document.getElementById(
            "additionalItemsPreview"
        );

    if (!container) {
        return;
    }

    const manualItems =
        quotation.additionalItems.filter(
            item =>
                !item.selfServiceAccessory
        );

    if (
        manualItems.length === 0
    ) {
        container.innerHTML = `
            <div class="empty-message">
                No other accessories or additional items added.
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <div class="card">

            <h3>
                Saved Additional Items
            </h3>

            ${
                manualItems
                    .map(
                        (
                            item,
                            displayIndex
                        ) => {
                            const actualIndex =
                                quotation.additionalItems.indexOf(
                                    item
                                );

                            return `
                                <div class="room-card">

                                    <div>
                                        <strong>
                                            ${escapeHTML(
                                                item.name ||
                                                item.description
                                            )}
                                        </strong>

                                        <br>

                                        <small>
                                            ${
                                                number(
                                                    item.quantity
                                                )
                                            }
                                            ×
                                            ${
                                                money(
                                                    item.unitPrice
                                                )
                                            }
                                            =
                                            ${
                                                money(
                                                    item.total
                                                )
                                            }
                                        </small>
                                    </div>

                                    <button
                                        type="button"
                                        class="danger-button"
                                        onclick="deleteAdditionalItem(${actualIndex})"
                                    >
                                        Delete
                                    </button>

                                </div>
                            `;
                        }
                    )
                    .join("")
            }

        </div>
    `;
}

/* =========================================================
   DELETE ADDITIONAL ITEM
   ========================================================= */

function deleteAdditionalItem(index) {
    const item =
        quotation.additionalItems[
            index
        ];

    if (!item) {
        return;
    }

    if (
        !confirm(
            `Delete "${
                item.name ||
                item.description ||
                "this item"
            }"?`
        )
    ) {
        return;
    }

    quotation.additionalItems.splice(
        index,
        1
    );

    renderAdditionalItemsPreview();
}

/* =========================================================
   REMOVE PREVIOUS AUTOMATIC ACCESSORIES
   ========================================================= */

function removeSavedAutomaticAccessories() {
    quotation.additionalItems =
        quotation.additionalItems.filter(
            item =>
                !item.selfServiceAccessory
        );
}

/* =========================================================
   SAVE VOLT SWITCHER
   ========================================================= */

function saveVoltSwitcherSelection() {
    quotation.includeVoltSwitcher =
        Boolean(
            document.getElementById(
                "includeVoltSwitcher"
            )?.checked
        );

    quotation.voltSwitcherModel =
        document.getElementById(
            "voltSwitcherModel"
        )?.value ||
        "VXV13ABAS";

    quotation.voltSwitcherQuantity =
        Math.max(
            1,
            Number(
                document.getElementById(
                    "voltSwitcherQuantity"
                )?.value
            ) ||
            getTotalACUnits() ||
            1
        );

    if (
        !quotation.includeVoltSwitcher
    ) {
        return;
    }

    const selectedItem =
        OPTIONAL_ACCESSORY_CATALOG[
            quotation.voltSwitcherModel
        ];

    if (!selectedItem) {
        return;
    }

    quotation.additionalItems.push({
        category:
            selectedItem.category,

        brand:
            selectedItem.brand,

        model:
            selectedItem.model,

        name:
            `${selectedItem.name} — ${selectedItem.model}`,

        description:
            selectedItem.description,

        quantity:
            quotation.voltSwitcherQuantity,

        unitPrice:
            selectedItem.price,

        total:
            quotation.voltSwitcherQuantity *
            selectedItem.price,

        selfServiceAccessory:
            true
    });
}

/* =========================================================
   SAVE CASSETTE PANEL
   ========================================================= */

function saveCassettePanelSelection() {
    quotation.includeCassettePanel =
        Boolean(
            document.getElementById(
                "includeCassettePanel"
            )?.checked
        );

    quotation.cassettePanelModel =
        document.getElementById(
            "cassettePanelModel"
        )?.value ||
        "PT-MCHWO";

    quotation.cassettePanelQuantity =
        Math.max(
            1,
            Number(
                document.getElementById(
                    "cassettePanelQuantity"
                )?.value
            ) ||
            getCassetteUnitCount() ||
            1
        );

    if (
        !quotation.includeCassettePanel
    ) {
        return;
    }

    const selectedItem =
        OPTIONAL_ACCESSORY_CATALOG[
            quotation.cassettePanelModel
        ];

    if (!selectedItem) {
        return;
    }

    quotation.additionalItems.push({
        category:
            selectedItem.category,

        brand:
            selectedItem.brand,

        model:
            selectedItem.model,

        name:
            `${selectedItem.name} — ${selectedItem.model}`,

        description:
            selectedItem.description,

        quantity:
            quotation.cassettePanelQuantity,

        unitPrice:
            selectedItem.price,

        total:
            quotation.cassettePanelQuantity *
            selectedItem.price,

        selfServiceAccessory:
            true
    });
}

/* =========================================================
   SAVE ACCESSORIES AND CONTINUE
   ========================================================= */

function finishAdditionalItems() {
    removeSavedAutomaticAccessories();

    saveVoltSwitcherSelection();

    saveCassettePanelSelection();

    quotation.includeAsBuiltDrawing =
        Boolean(
            document.getElementById(
                "includeAsBuiltDrawing"
            )?.checked
        );

    quotation.asBuiltDrawingCost =
        Number(
            document.getElementById(
                "asBuiltDrawingCost"
            )?.value
        ) ||
        0;

    if (
        quotation.includeAsBuiltDrawing &&
        (
            !Number.isFinite(
                quotation.asBuiltDrawingCost
            ) ||
            quotation.asBuiltDrawingCost < 0
        )
    ) {
        alert(
            "Please enter a valid as-built drawing cost."
        );

        return;
    }

    showPage(13);

    configureClientFields();
}
/* =========================================================
   ONSITE QUOTATION
   SECTION 5 OF 7
   TOTALS + CLIENT DETAILS + QUOTATION PREVIEW
   ========================================================= */

/* =========================================================
   TOTAL AC EQUIPMENT COST
   ========================================================= */

function getEquipmentTotal() {
    return quotation.acPrices.reduce(
        (
            total,
            item
        ) =>
            total +
            Number(
                item.total ||
                0
            ),
        0
    );
}

/* =========================================================
   TOTAL COPPER LENGTH
   ========================================================= */

function getTotalCopperLength() {
    return quotation.rooms.reduce(
        (
            total,
            room
        ) =>
            total +
            Number(
                room.copper ||
                0
            ),
        0
    );
}

/* =========================================================
   TOTAL DRAINAGE LENGTH
   ========================================================= */

function getTotalDrainageLength() {
    return quotation.rooms.reduce(
        (
            total,
            room
        ) =>
            total +
            Number(
                room.drainage ||
                0
            ),
        0
    );
}

/* =========================================================
   COPPER TOTAL
   ========================================================= */

function getCopperTotal() {
    if (isSupplyOnly()) {
        return 0;
    }

    return (
        getTotalCopperLength() *
        Number(
            quotation.copperRate ||
            0
        )
    );
}

/* =========================================================
   FLEXIBLE-CABLE TOTAL
   Cable length equals total copper length.
   ========================================================= */

function getFlexibleCableTotal() {
    if (isSupplyOnly()) {
        return 0;
    }

    return (
        getTotalCopperLength() *
        Number(
            quotation.flexibleCableRate ||
            0
        )
    );
}

/* =========================================================
   DRAINAGE TOTAL
   ========================================================= */

function getDrainageTotal() {
    if (isSupplyOnly()) {
        return 0;
    }

    return (
        getTotalDrainageLength() *
        Number(
            quotation.drainageRate ||
            0
        )
    );
}

/* =========================================================
   INSTALLATION AND COMMISSIONING TOTAL
   ========================================================= */

function getInstallationCommissioningTotal() {
    if (isSupplyOnly()) {
        return 0;
    }

    return Number(
        quotation.installationTotal ||
        0
    );
}

/* =========================================================
   ADDITIONAL ITEMS TOTAL
   ========================================================= */

function getAdditionalItemsTotal() {
    if (isSupplyOnly()) {
        return 0;
    }

    return quotation.additionalItems.reduce(
        (
            total,
            item
        ) =>
            total +
            Number(
                item.total ||
                0
            ),
        0
    );
}

/* =========================================================
   AS-BUILT DRAWING TOTAL
   ========================================================= */

function getAsBuiltDrawingTotal() {
    if (
        isSupplyOnly() ||
        !quotation.includeAsBuiltDrawing
    ) {
        return 0;
    }

    return Number(
        quotation.asBuiltDrawingCost ||
        0
    );
}

/* =========================================================
   HVAC WORKS TOTAL
   ========================================================= */

function getHVACTotal() {
    return (
        getEquipmentTotal() +
        getCopperTotal() +
        getFlexibleCableTotal() +
        getDrainageTotal() +
        getInstallationCommissioningTotal() +
        getAdditionalItemsTotal()
    );
}

/* =========================================================
   QUOTATION SUBTOTAL
   ========================================================= */

function getQuotationSubtotal() {
    return (
        getHVACTotal() +
        getAsBuiltDrawingTotal()
    );
}

/* =========================================================
   VAT
   ========================================================= */

function getQuotationVAT() {
    return (
        getQuotationSubtotal() *
        0.16
    );
}

/* =========================================================
   GRAND TOTAL
   ========================================================= */

function getQuotationGrandTotal() {
    return (
        getQuotationSubtotal() +
        getQuotationVAT()
    );
}

/* =========================================================
   CONFIGURE CLIENT DETAIL FIELDS
   Existing salesPhone and salesEmail HTML IDs are retained
   so the current HTML file does not need to be rewritten.
   They are displayed and stored as client details.
   ========================================================= */

function configureClientFields() {
    const salespersonInput =
        document.getElementById(
            "salesPerson"
        );

    if (salespersonInput) {
        const salespersonField =
            salespersonInput.closest(
                "label, .form-group, .input-group, .field"
            );

        if (salespersonField) {
            salespersonField.style.display =
                "none";
        }

        salespersonInput.value =
            "";
    }

    const phoneInput =
        document.getElementById(
            "salesPhone"
        );

    const emailInput =
        document.getElementById(
            "salesEmail"
        );

    if (phoneInput) {
        phoneInput.placeholder =
            "Enter client phone number";

        phoneInput.value =
            quotation.clientPhone ||
            phoneInput.value ||
            "";

        const phoneLabel =
            phoneInput.closest(
                "label"
            );

        if (phoneLabel) {
            const textNode = [
                ...phoneLabel.childNodes
            ].find(
                node =>
                    node.nodeType ===
                    Node.TEXT_NODE
            );

            if (textNode) {
                textNode.textContent =
                    "Client Phone Number ";
            }
        }
    }

    if (emailInput) {
        emailInput.type =
            "email";

        emailInput.placeholder =
            "Enter client email address";

        emailInput.value =
            quotation.clientEmail ||
            emailInput.value ||
            "";

        const emailLabel =
            emailInput.closest(
                "label"
            );

        if (emailLabel) {
            const textNode = [
                ...emailLabel.childNodes
            ].find(
                node =>
                    node.nodeType ===
                    Node.TEXT_NODE
            );

            if (textNode) {
                textNode.textContent =
                    "Client Email Address ";
            }
        }
    }
}

/* =========================================================
   GET CLIENT DETAILS
   ========================================================= */

function getClientDetails() {
    quotation.clientName =
        document.getElementById(
            "clientName"
        )?.value.trim() ||
        "";

    quotation.installationLocation =
        document.getElementById(
            "installationLocation"
        )?.value.trim() ||
        "";

    quotation.clientPhone =
        document.getElementById(
            "salesPhone"
        )?.value.trim() ||
        "";

    quotation.clientEmail =
        document.getElementById(
            "salesEmail"
        )?.value.trim() ||
        "";
}

/* =========================================================
   VALIDATE EMAIL ADDRESS
   ========================================================= */

function isValidEmailAddress(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        String(
            email ||
            ""
        ).trim()
    );
}

/* =========================================================
   CLIENT DETAILS TO QUOTATION PREVIEW
   ========================================================= */

function proceedToQuotationPreview() {
    getClientDetails();

    if (!quotation.clientName) {
        alert(
            "Please enter the client name."
        );

        return;
    }

    if (
        !quotation.installationLocation
    ) {
        alert(
            "Please enter the installation location."
        );

        return;
    }

    if (!quotation.clientPhone) {
        alert(
            "Please enter the client phone number."
        );

        return;
    }

    if (!quotation.clientEmail) {
        alert(
            "Please enter the client email address."
        );

        return;
    }

    if (
        !isValidEmailAddress(
            quotation.clientEmail
        )
    ) {
        alert(
            "Please enter a valid client email address."
        );

        return;
    }

    syncAutomaticACPrices();

    renderQuotationPreview();

    showPage(14);
}

/* =========================================================
   EQUIPMENT TABLE ROWS
   ========================================================= */

function getEquipmentPreviewRows() {
    if (
        quotation.acPrices.length === 0
    ) {
        return `
            <tr>
                <td colspan="5">
                    No AC equipment selected.
                </td>
            </tr>
        `;
    }

    return quotation.acPrices
        .map(
            item => `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(
                                item.brand
                            )}
                        </strong>

                        <br>

                        ${
                            Number(
                                item.capacity
                            ).toLocaleString(
                                "en-KE"
                            )
                        }
                        BTU/hr

                        <br>

                        ${escapeHTML(
                            item.type
                        )}

                        <br>

                        <small>
                            Model:
                            ${escapeHTML(
                                item.model ||
                                "Not specified"
                            )}
                        </small>

                        <br>

                        <small>
                            ${escapeHTML(
                                item.description ||
                                "Cooling-only air conditioner"
                            )}
                        </small>

                        <br>

                        <small>
                            Room(s):
                            ${
                                (
                                    item.rooms ||
                                    []
                                )
                                    .map(
                                        escapeHTML
                                    )
                                    .join(", ")
                            }
                        </small>
                    </td>

                    <td class="number">
                        ${number(
                            item.quantity
                        )}
                    </td>

                    <td>
                        No.
                    </td>

                    <td class="number">
                        ${money(
                            item.unitPrice
                        )}
                    </td>

                    <td class="number">
                        ${money(
                            item.total
                        )}
                    </td>

                </tr>
            `
        )
        .join("");
}

/* =========================================================
   MATERIAL TABLE ROWS
   ========================================================= */

function getMaterialPreviewRows() {
    if (isSupplyOnly()) {
        return "";
    }

    const rows = [];

    if (
        getTotalCopperLength() > 0
    ) {
        rows.push(`
            <tr>

                <td>
                    Copper Piping
                </td>

                <td class="number">
                    ${number(
                        getTotalCopperLength()
                    )}
                </td>

                <td>
                    m
                </td>

                <td class="number">
                    ${money(
                        quotation.copperRate
                    )}
                </td>

                <td class="number">
                    ${money(
                        getCopperTotal()
                    )}
                </td>

            </tr>
        `);
    }

    if (
        getTotalCopperLength() > 0 &&
        Number(
            quotation.flexibleCableRate
        ) > 0
    ) {
        rows.push(`
            <tr>

                <td>
                    ${escapeHTML(
                        quotation.flexibleCableType ||
                        "1.5mm 3 core flexible cable"
                    )}
                </td>

                <td class="number">
                    ${number(
                        getTotalCopperLength()
                    )}
                </td>

                <td>
                    m
                </td>

                <td class="number">
                    ${money(
                        quotation.flexibleCableRate
                    )}
                </td>

                <td class="number">
                    ${money(
                        getFlexibleCableTotal()
                    )}
                </td>

            </tr>
        `);
    }

    if (
        getTotalDrainageLength() > 0
    ) {
        rows.push(`
            <tr>

                <td>
                    Drainage Piping
                </td>

                <td class="number">
                    ${number(
                        getTotalDrainageLength()
                    )}
                </td>

                <td>
                    m
                </td>

                <td class="number">
                    ${money(
                        quotation.drainageRate
                    )}
                </td>

                <td class="number">
                    ${money(
                        getDrainageTotal()
                    )}
                </td>

            </tr>
        `);
    }

    return rows.join("");
}

/* =========================================================
   INSTALLATION TABLE ROW
   ========================================================= */

function getInstallationPreviewRow() {
    if (
        isSupplyOnly() ||
        getInstallationCommissioningTotal() <= 0
    ) {
        return "";
    }

    return `
        <tr>

            <td>
                Installation and Commissioning

                <br>

                <small>
                    Region:
                    ${escapeHTML(
                        quotation.installationRegion
                    )}

                    <br>

                    AC Type:
                    ${escapeHTML(
                        quotation.acType
                    )}
                </small>
            </td>

            <td class="number">
                ${number(
                    quotation.installationUnitCount
                )}
            </td>

            <td>
                No.
            </td>

            <td class="number">
                ${money(
                    quotation.installationUnitCost
                )}
            </td>

            <td class="number">
                ${money(
                    getInstallationCommissioningTotal()
                )}
            </td>

        </tr>
    `;
}

/* =========================================================
   ADDITIONAL ITEMS TABLE ROWS
   ========================================================= */

function getAdditionalItemsPreviewRows() {
    if (
        isSupplyOnly() ||
        quotation.additionalItems.length === 0
    ) {
        return "";
    }

    return quotation.additionalItems
        .map(
            item => `
                <tr>

                    <td>
                        ${escapeHTML(
                            item.name ||
                            item.description ||
                            "Additional Item"
                        )}

                        ${
                            item.description &&
                            item.description !==
                                item.name
                                ? `
                                    <br>
                                    <small>
                                        ${escapeHTML(
                                            item.description
                                        )}
                                    </small>
                                `
                                : ""
                        }
                    </td>

                    <td class="number">
                        ${number(
                            item.quantity
                        )}
                    </td>

                    <td>
                        No.
                    </td>

                    <td class="number">
                        ${money(
                            item.unitPrice
                        )}
                    </td>

                    <td class="number">
                        ${money(
                            item.total
                        )}
                    </td>

                </tr>
            `
        )
        .join("");
}

/* =========================================================
   AS-BUILT DRAWING TABLE ROW
   ========================================================= */

function getAsBuiltDrawingPreviewRow() {
    const total =
        getAsBuiltDrawingTotal();

    if (total <= 0) {
        return "";
    }

    return `
        <tr>

            <td>
                As-Built Drawing
            </td>

            <td class="number">
                1.00
            </td>

            <td>
                Lot
            </td>

            <td class="number">
                ${money(
                    total
                )}
            </td>

            <td class="number">
                ${money(
                    total
                )}
            </td>

        </tr>
    `;
}

/* =========================================================
   FINAL QUOTATION PREVIEW
   ========================================================= */

function renderQuotationPreview() {
    const container =
        document.getElementById(
            "quotationPreview"
        );

    if (!container) {
        return;
    }

    syncAutomaticACPrices();

    const subtotal =
        getQuotationSubtotal();

    const vat =
        getQuotationVAT();

    const grandTotal =
        getQuotationGrandTotal();

    const quotationTypeLabel =
        isSupplyOnly()
            ? "Supply Only"
            : "Supply and Commissioning";

    container.innerHTML = `
        <div
            class="quotation-document"
            id="finalQuotationDocument"
        >

            <div class="quotation-title">

                <h1>
                    QUOTATION
                </h1>

                <p>
                    ${escapeHTML(
                        quotationTypeLabel
                    )}
                </p>

            </div>

            <!-- ===========================================
                 CLIENT DETAILS
            ============================================ -->

            <div class="quotation-section">

                <h3>
                    CLIENT DETAILS
                </h3>

                <table class="client-table">

                    <tbody>

                        <tr>
                            <td>
                                CLIENT NAME
                            </td>

                            <td>
                                ${escapeHTML(
                                    quotation.clientName
                                )}
                            </td>
                        </tr>

                        <tr>
                            <td>
                                LOCATION
                            </td>

                            <td>
                                ${escapeHTML(
                                    quotation.installationLocation
                                )}
                            </td>
                        </tr>

                        <tr>
                            <td>
                                CLIENT PHONE
                            </td>

                            <td>
                                ${escapeHTML(
                                    quotation.clientPhone
                                )}
                            </td>
                        </tr>

                        <tr>
                            <td>
                                CLIENT EMAIL
                            </td>

                            <td>
                                ${escapeHTML(
                                    quotation.clientEmail
                                )}
                            </td>
                        </tr>

                    </tbody>

                </table>

            </div>

            <!-- ===========================================
                 AC EQUIPMENT
            ============================================ -->

            <div class="quotation-section">

                <h3>
                    1. AC EQUIPMENT
                </h3>

                <div style="overflow-x:auto">

                    <table class="quotation-table">

                        <thead>
                            <tr>
                                <th>
                                    Description
                                </th>

                                <th class="number">
                                    Quantity
                                </th>

                                <th>
                                    Unit
                                </th>

                                <th class="number">
                                    Unit Price
                                </th>

                                <th class="number">
                                    Total
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            ${getEquipmentPreviewRows()}
                        </tbody>

                    </table>

                </div>

            </div>

            ${
                !isSupplyOnly()
                    ? `
                        <!-- =================================
                             MATERIALS
                        ================================== -->

                        <div class="quotation-section">

                            <h3>
                                2. MATERIALS
                            </h3>

                            <div style="overflow-x:auto">

                                <table class="quotation-table">

                                    <thead>
                                        <tr>
                                            <th>
                                                Description
                                            </th>

                                            <th class="number">
                                                Quantity
                                            </th>

                                            <th>
                                                Unit
                                            </th>

                                            <th class="number">
                                                Unit Price
                                            </th>

                                            <th class="number">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        ${getMaterialPreviewRows()}
                                    </tbody>

                                </table>

                            </div>

                        </div>

                        <!-- =================================
                             INSTALLATION
                        ================================== -->

                        <div class="quotation-section">

                            <h3>
                                3. INSTALLATION AND COMMISSIONING
                            </h3>

                            <div style="overflow-x:auto">

                                <table class="quotation-table">

                                    <thead>
                                        <tr>
                                            <th>
                                                Description
                                            </th>

                                            <th class="number">
                                                Quantity
                                            </th>

                                            <th>
                                                Unit
                                            </th>

                                            <th class="number">
                                                Unit Price
                                            </th>

                                            <th class="number">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        ${getInstallationPreviewRow()}
                                    </tbody>

                                </table>

                            </div>

                        </div>

                        <!-- =================================
                             ACCESSORIES
                        ================================== -->

                        <div class="quotation-section">

                            <h3>
                                4. INSTALLATION COMMISSIONING & ACCESSORIES
                            </h3>

                            <div style="overflow-x:auto">

                                <table class="quotation-table">

                                    <thead>
                                        <tr>
                                            <th>
                                                Description
                                            </th>

                                            <th class="number">
                                                Quantity
                                            </th>

                                            <th>
                                                Unit
                                            </th>

                                            <th class="number">
                                                Unit Price
                                            </th>

                                            <th class="number">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        ${
                                            getAdditionalItemsPreviewRows() ||
                                            `
                                                <tr>
                                                    <td colspan="5">
                                                        No accessories selected.
                                                    </td>
                                                </tr>
                                            `
                                        }

                                        ${getAsBuiltDrawingPreviewRow()}

                                    </tbody>

                                </table>

                            </div>

                        </div>
                    `
                    : ""
            }

            <!-- ===========================================
                 TOTALS
            ============================================ -->

            <div class="quotation-section totals-section">

                <table class="totals-table">

                    <tbody>

                        <tr>
                            <td>
                                Subtotal
                            </td>

                            <td class="number">
                                ${money(
                                    subtotal
                                )}
                            </td>
                        </tr>

                        <tr>
                            <td>
                                VAT (16%)
                            </td>

                            <td class="number">
                                ${money(
                                    vat
                                )}
                            </td>
                        </tr>

                        <tr class="grand-total-row">
                            <td>
                                GRAND TOTAL
                            </td>

                            <td class="number">
                                ${money(
                                    grandTotal
                                )}
                            </td>
                        </tr>

                    </tbody>

                </table>

            </div>

            <!-- ===========================================
                 REVIEW NOTICE
            ============================================ -->

            <div
                class="info-box review-notice"
                id="reviewNotice"
            >
                <strong>
                    Please send this quotation to
                    acmsa@hotpoint.co.ke for review.
                </strong>
            </div>

        </div>
    `;
}

/* =========================================================
   BACK TO CLIENT DETAILS
   ========================================================= */

function backToClientDetails() {
    showPage(13);

    configureClientFields();
}

/* =========================================================
   RETURN TO ACCESSORIES FROM CLIENT DETAILS
   ========================================================= */

function backFromClientDetails() {
    if (isSupplyOnly()) {
        showPage(8);
    } else {
        renderAdditionalItems();

        showPage(12);
    }
}
/* =========================================================
   ONSITE QUOTATION
   SECTION 6 OF 7
   PDF HELPERS + PDF CONTENT
   ========================================================= */

/* =========================================================
   CONVERT AN IMAGE TO A DATA URL
   ========================================================= */

function imageToDataURL(url) {
    return new Promise(
        (
            resolve,
            reject
        ) => {
            const image =
                new Image();

            image.onload =
                function () {
                    try {
                        const canvas =
                            document.createElement(
                                "canvas"
                            );

                        canvas.width =
                            image.naturalWidth;

                        canvas.height =
                            image.naturalHeight;

                        const context =
                            canvas.getContext(
                                "2d"
                            );

                        if (!context) {
                            reject(
                                new Error(
                                    "Canvas is not supported."
                                )
                            );

                            return;
                        }

                        context.drawImage(
                            image,
                            0,
                            0
                        );

                        resolve(
                            canvas.toDataURL(
                                "image/jpeg",
                                0.95
                            )
                        );
                    } catch (error) {
                        reject(error);
                    }
                };

            image.onerror =
                function () {
                    reject(
                        new Error(
                            `Unable to load ${url}`
                        )
                    );
                };

            image.src =
                url;
        }
    );
}

/* =========================================================
   GET OFFLINE OR LOCAL IMAGE
   If embedded Base64 variables are available, they are used.
   Otherwise, header.jpeg and footer.jpeg are loaded.
   ========================================================= */

async function getPDFImageData(
    embeddedData,
    fallbackPath
) {
    if (
        typeof embeddedData ===
            "string" &&
        embeddedData.startsWith(
            "data:image/"
        )
    ) {
        return embeddedData;
    }

    try {
        return await imageToDataURL(
            fallbackPath
        );
    } catch (error) {
        console.warn(
            `${fallbackPath} could not be loaded.`,
            error
        );

        return null;
    }
}

/* =========================================================
   ADD PDF HEADER
   ========================================================= */

function addHeaderImage(
    doc,
    headerData
) {
    if (!headerData) {
        return;
    }

    const pageWidth =
        doc.internal.pageSize.getWidth();

    try {
        doc.addImage(
            headerData,
            "JPEG",
            0,
            0,
            pageWidth,
            42
        );
    } catch (error) {
        console.warn(
            "The header image could not be added.",
            error
        );
    }
}

/* =========================================================
   ADD PDF FOOTER
   ========================================================= */

function addFooterToPage(
    doc,
    footerData,
    pageNumber
) {
    const pageWidth =
        doc.internal.pageSize.getWidth();

    const pageHeight =
        doc.internal.pageSize.getHeight();

    try {
        if (footerData) {
            doc.addImage(
                footerData,
                "JPEG",
                0,
                pageHeight - 35,
                pageWidth,
                35
            );
        }
    } catch (error) {
        console.warn(
            "The footer image could not be added.",
            error
        );
    }

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(7);

    doc.setTextColor(
        100,
        100,
        100
    );

    doc.text(
        `Page ${pageNumber}`,
        pageWidth - 25,
        pageHeight - 5
    );
}

/* =========================================================
   ADD A NEW PDF PAGE
   ========================================================= */

function addQuotationPDFPage(
    doc,
    headerData
) {
    doc.addPage();

    addHeaderImage(
        doc,
        headerData
    );

    return 50;
}

/* =========================================================
   CHECK AVAILABLE PDF SPACE
   ========================================================= */

function ensurePDFSpace(
    doc,
    currentY,
    requiredSpace,
    headerData
) {
    const pageHeight =
        doc.internal.pageSize.getHeight();

    const footerSpace =
        40;

    if (
        currentY +
            requiredSpace >
        pageHeight -
            footerSpace
    ) {
        return addQuotationPDFPage(
            doc,
            headerData
        );
    }

    return currentY;
}

/* =========================================================
   PDF SECTION HEADING
   ========================================================= */

function addPDFSectionHeading(
    doc,
    heading,
    y,
    margin
) {
    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(11);

    doc.setTextColor(
        7,
        89,
        133
    );

    doc.text(
        heading,
        margin,
        y
    );

    return y + 5;
}

/* =========================================================
   GENERATE QUOTATION PDF
   ========================================================= */

async function generateQuotation() {
    getClientDetails();

    if (!quotation.clientName) {
        alert(
            "Please enter the client name."
        );

        showPage(13);

        configureClientFields();

        return;
    }

    if (
        !quotation.installationLocation
    ) {
        alert(
            "Please enter the installation location."
        );

        showPage(13);

        configureClientFields();

        return;
    }

    if (!quotation.clientPhone) {
        alert(
            "Please enter the client phone number."
        );

        showPage(13);

        configureClientFields();

        return;
    }

    if (
        !quotation.clientEmail ||
        !isValidEmailAddress(
            quotation.clientEmail
        )
    ) {
        alert(
            "Please enter a valid client email address."
        );

        showPage(13);

        configureClientFields();

        return;
    }

    syncAutomaticACPrices();

    if (
        !jsPDFConstructor &&
        window.jspdf &&
        typeof window.jspdf.jsPDF ===
            "function"
    ) {
        jsPDFConstructor =
            window.jspdf.jsPDF;
    }

    if (!jsPDFConstructor) {
        alert(
            "The PDF library is not available. Please refresh the page and try again."
        );

        return;
    }

    /*
       If your JavaScript contains embedded image variables,
       name them HEADER_IMAGE_BASE64 and FOOTER_IMAGE_BASE64.
       The local JPEG files are used as fallbacks.
    */

    const embeddedHeader =
        typeof window.HEADER_IMAGE_BASE64 ===
            "string"
            ? window.HEADER_IMAGE_BASE64
            : null;

    const embeddedFooter =
        typeof window.FOOTER_IMAGE_BASE64 ===
            "string"
            ? window.FOOTER_IMAGE_BASE64
            : null;

    const [
        headerData,
        footerData
    ] =
        await Promise.all([
            getPDFImageData(
                embeddedHeader,
                "header.jpeg"
            ),

            getPDFImageData(
                embeddedFooter,
                "footer.jpeg"
            )
        ]);

    createPDF(
        headerData,
        footerData
    );
}

/* =========================================================
   COMPATIBILITY FUNCTION
   Some HTML versions call generatePDF().
   ========================================================= */

function generatePDF() {
    return generateQuotation();
}

/* =========================================================
   CREATE PDF DOCUMENT
   ========================================================= */

function createPDF(
    headerData,
    footerData
) {
    const doc =
        new jsPDFConstructor({
            orientation:
                "portrait",

            unit:
                "mm",

            format:
                "a4"
        });

    if (
        typeof doc.autoTable !==
        "function"
    ) {
        alert(
            "The PDF table library is not available. Please refresh the page and try again."
        );

        return;
    }

    const pageWidth =
        doc.internal.pageSize.getWidth();

    const pageHeight =
        doc.internal.pageSize.getHeight();

    const margin =
        14;

    const headerHeight =
        headerData
            ? 47
            : 15;

    const footerHeight =
        footerData
            ? 38
            : 15;

    let y =
        headerHeight;

    addHeaderImage(
        doc,
        headerData
    );

    /* =====================================================
       QUOTATION TITLE
       ===================================================== */

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(18);

    doc.setTextColor(
        7,
        89,
        133
    );

    doc.text(
        "QUOTATION",
        pageWidth / 2,
        y,
        {
            align:
                "center"
        }
    );

    y += 7;

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(9);

    doc.setTextColor(
        60,
        60,
        60
    );

    doc.text(
        isSupplyOnly()
            ? "Supply Only"
            : "Supply and Commissioning",
        pageWidth / 2,
        y,
        {
            align:
                "center"
        }
    );

    y += 10;

    /* =====================================================
       CLIENT DETAILS
       ===================================================== */

    y =
        addPDFSectionHeading(
            doc,
            "CLIENT DETAILS",
            y,
            margin
        );

    const clientRows = [
        [
            "CLIENT NAME",
            quotation.clientName
        ],

        [
            "LOCATION",
            quotation.installationLocation
        ],

        [
            "CLIENT PHONE",
            quotation.clientPhone
        ],

        [
            "CLIENT EMAIL",
            quotation.clientEmail
        ]
    ];

    doc.autoTable({
        startY:
            y,

        body:
            clientRows,

        theme:
            "grid",

        styles: {
            fontSize:
                8,

            cellPadding:
                2.5,

            valign:
                "middle",

            lineColor: [
                210,
                215,
                220
            ],

            lineWidth:
                0.2
        },

        columnStyles: {
            0: {
                cellWidth:
                    38,

                fontStyle:
                    "bold",

                textColor: [
                    7,
                    89,
                    133
                ]
            },

            1: {
                cellWidth:
                    pageWidth -
                    margin * 2 -
                    38
            }
        },

        margin: {
            left:
                margin,

            right:
                margin,

            top:
                headerHeight,

            bottom:
                footerHeight
        }
    });

    y =
        doc.lastAutoTable.finalY +
        10;

    /* =====================================================
       AC EQUIPMENT
       ===================================================== */

    y =
        ensurePDFSpace(
            doc,
            y,
            35,
            headerData
        );

    y =
        addPDFSectionHeading(
            doc,
            "1. AC EQUIPMENT",
            y,
            margin
        );

    const equipmentRows =
        quotation.acPrices.map(
            item => [
                `${
                    item.brand ||
                    ""
                } — ${
                    Number(
                        item.capacity
                    ).toLocaleString(
                        "en-KE"
                    )
                } BTU/hr — ${
                    item.type ||
                    ""
                }\nModel: ${
                    item.model ||
                    "Not specified"
                }\n${
                    item.description ||
                    "Cooling-only air conditioner"
                }\nRoom(s): ${
                    (
                        item.rooms ||
                        []
                    ).join(", ")
                }`,

                Number(
                    item.quantity ||
                    0
                ),

                "No.",

                money(
                    item.unitPrice
                ),

                money(
                    item.total
                )
            ]
        );

    doc.autoTable({
        startY:
            y,

        head: [[
            "Description",
            "Qty",
            "Unit",
            "Unit Price",
            "Total"
        ]],

        body:
            equipmentRows,

        theme:
            "grid",

        styles: {
            fontSize:
                7.5,

            cellPadding:
                2,

            valign:
                "top",

            overflow:
                "linebreak",

            lineColor: [
                215,
                215,
                215
            ],

            lineWidth:
                0.2
        },

        headStyles: {
            fillColor: [
                7,
                89,
                133
            ],

            textColor: [
                255,
                255,
                255
            ],

            fontStyle:
                "bold"
        },

        columnStyles: {
            0: {
                cellWidth:
                    88
            },

            1: {
                cellWidth:
                    15,

                halign:
                    "right"
            },

            2: {
                cellWidth:
                    15
            },

            3: {
                cellWidth:
                    30,

                halign:
                    "right"
            },

            4: {
                cellWidth:
                    32,

                halign:
                    "right"
            }
        },

        margin: {
            left:
                margin,

            right:
                margin,

            top:
                headerHeight,

            bottom:
                footerHeight
        },

        didDrawPage:
            function (data) {
                if (
                    data.pageNumber >
                    1
                ) {
                    addHeaderImage(
                        doc,
                        headerData
                    );
                }
            }
    });

    y =
        doc.lastAutoTable.finalY +
        10;

    /* =====================================================
       MATERIALS
       ===================================================== */

    if (!isSupplyOnly()) {
        y =
            ensurePDFSpace(
                doc,
                y,
                40,
                headerData
            );

        y =
            addPDFSectionHeading(
                doc,
                "2. MATERIALS",
                y,
                margin
            );

        const materialRows = [];

        if (
            getTotalCopperLength() >
            0
        ) {
            materialRows.push([
                "Copper Piping",

                number(
                    getTotalCopperLength()
                ),

                "m",

                money(
                    quotation.copperRate
                ),

                money(
                    getCopperTotal()
                )
            ]);
        }

        if (
            getTotalCopperLength() >
                0 &&
            Number(
                quotation.flexibleCableRate
            ) >
                0
        ) {
            materialRows.push([
                quotation.flexibleCableType ||
                "1.5mm 3 core flexible cable",

                number(
                    getTotalCopperLength()
                ),

                "m",

                money(
                    quotation.flexibleCableRate
                ),

                money(
                    getFlexibleCableTotal()
                )
            ]);
        }

        if (
            getTotalDrainageLength() >
            0
        ) {
            materialRows.push([
                "Drainage Piping",

                number(
                    getTotalDrainageLength()
                ),

                "m",

                money(
                    quotation.drainageRate
                ),

                money(
                    getDrainageTotal()
                )
            ]);
        }

        doc.autoTable({
            startY:
                y,

            head: [[
                "Description",
                "Qty",
                "Unit",
                "Unit Price",
                "Total"
            ]],

            body:
                materialRows,

            theme:
                "grid",

            styles: {
                fontSize:
                    8,

                cellPadding:
                    2,

                lineColor: [
                    215,
                    215,
                    215
                ],

                lineWidth:
                    0.2
            },

            headStyles: {
                fillColor: [
                    7,
                    89,
                    133
                ],

                textColor: [
                    255,
                    255,
                    255
                ]
            },

            columnStyles: {
                0: {
                    cellWidth:
                        88
                },

                1: {
                    cellWidth:
                        15,

                    halign:
                        "right"
                },

                2: {
                    cellWidth:
                        15
                },

                3: {
                    cellWidth:
                        30,

                    halign:
                        "right"
                },

                4: {
                    cellWidth:
                        32,

                    halign:
                        "right"
                }
            },

            margin: {
                left:
                    margin,

                right:
                    margin,

                top:
                    headerHeight,

                bottom:
                    footerHeight
            },

            didDrawPage:
                function (data) {
                    if (
                        data.pageNumber >
                        1
                    ) {
                        addHeaderImage(
                            doc,
                            headerData
                        );
                    }
                }
        });

        y =
            doc.lastAutoTable.finalY +
            10;

        /* =================================================
           INSTALLATION AND COMMISSIONING
           ================================================= */

        if (
            getInstallationCommissioningTotal() >
            0
        ) {
            y =
                ensurePDFSpace(
                    doc,
                    y,
                    35,
                    headerData
                );

            y =
                addPDFSectionHeading(
                    doc,
                    "3. INSTALLATION AND COMMISSIONING",
                    y,
                    margin
                );

            const installationRows = [[
                `Installation and Commissioning\nRegion: ${
                    quotation.installationRegion
                }\nAC Type: ${
                    quotation.acType
                }`,

                Number(
                    quotation.installationUnitCount ||
                    0
                ),

                "No.",

                money(
                    quotation.installationUnitCost
                ),

                money(
                    getInstallationCommissioningTotal()
                )
            ]];

            doc.autoTable({
                startY:
                    y,

                head: [[
                    "Description",
                    "Qty",
                    "Unit",
                    "Unit Price",
                    "Total"
                ]],

                body:
                    installationRows,

                theme:
                    "grid",

                styles: {
                    fontSize:
                        8,

                    cellPadding:
                        2,

                    valign:
                        "top",

                    overflow:
                        "linebreak",

                    lineColor: [
                        215,
                        215,
                        215
                    ],

                    lineWidth:
                        0.2
                },

                headStyles: {
                    fillColor: [
                        7,
                        89,
                        133
                    ],

                    textColor: [
                        255,
                        255,
                        255
                    ]
                },

                columnStyles: {
                    0: {
                        cellWidth:
                            88
                    },

                    1: {
                        cellWidth:
                            15,

                        halign:
                            "right"
                    },

                    2: {
                        cellWidth:
                            15
                    },

                    3: {
                        cellWidth:
                            30,

                        halign:
                            "right"
                    },

                    4: {
                        cellWidth:
                            32,

                        halign:
                            "right"
                    }
                },

                margin: {
                    left:
                        margin,

                    right:
                        margin,

                    top:
                        headerHeight,

                    bottom:
                        footerHeight
                }
            });

            y =
                doc.lastAutoTable.finalY +
                10;
        }

        /* =================================================
           ACCESSORIES
           ================================================= */

        const accessoryRows =
            quotation.additionalItems.map(
                item => [
                    `${
                        item.name ||
                        item.description ||
                        "Additional Item"
                    }${
                        item.description &&
                        item.description !==
                            item.name
                            ? `\n${item.description}`
                            : ""
                    }`,

                    Number(
                        item.quantity ||
                        0
                    ),

                    "No.",

                    money(
                        item.unitPrice
                    ),

                    money(
                        item.total
                    )
                ]
            );

        if (
            getAsBuiltDrawingTotal() >
            0
        ) {
            accessoryRows.push([
                "As-Built Drawing",

                1,

                "Lot",

                money(
                    getAsBuiltDrawingTotal()
                ),

                money(
                    getAsBuiltDrawingTotal()
                )
            ]);
        }

        if (
            accessoryRows.length >
            0
        ) {
            y =
                ensurePDFSpace(
                    doc,
                    y,
                    40,
                    headerData
                );

            y =
                addPDFSectionHeading(
                    doc,
                    "4. INSTALLATION COMMISSIONING & ACCESSORIES",
                    y,
                    margin
                );

            doc.autoTable({
                startY:
                    y,

                head: [[
                    "Description",
                    "Qty",
                    "Unit",
                    "Unit Price",
                    "Total"
                ]],

                body:
                    accessoryRows,

                theme:
                    "grid",

                styles: {
                    fontSize:
                        7.5,

                    cellPadding:
                        2,

                    valign:
                        "top",

                    overflow:
                        "linebreak",

                    lineColor: [
                        215,
                        215,
                        215
                    ],

                    lineWidth:
                        0.2
                },

                headStyles: {
                    fillColor: [
                        7,
                        89,
                        133
                    ],

                    textColor: [
                        255,
                        255,
                        255
                    ]
                },

                columnStyles: {
                    0: {
                        cellWidth:
                            88
                    },

                    1: {
                        cellWidth:
                            15,

                        halign:
                            "right"
                    },

                    2: {
                        cellWidth:
                            15
                    },

                    3: {
                        cellWidth:
                            30,

                        halign:
                            "right"
                    },

                    4: {
                        cellWidth:
                            32,

                        halign:
                            "right"
                    }
                },

                margin: {
                    left:
                        margin,

                    right:
                        margin,

                    top:
                        headerHeight,

                    bottom:
                        footerHeight
                },

                didDrawPage:
                    function (data) {
                        if (
                            data.pageNumber >
                            1
                        ) {
                            addHeaderImage(
                                doc,
                                headerData
                            );
                        }
                    }
            });

            y =
                doc.lastAutoTable.finalY +
                10;
        }
    }

    /*
       Section 7 creates the quotation summary, terms,
       review instruction, page footers and PDF filename.
    */

    createPDFSummaryAndFinish(
        doc,
        headerData,
        footerData,
        pageWidth,
        pageHeight,
        margin,
        headerHeight,
        footerHeight,
        y
    );
}
/* =========================================================
   ONSITE QUOTATION
   SECTION 7 OF 7
   PDF SUMMARY + TERMS + RESET + INITIALIZATION
   ========================================================= */

/* =========================================================
   COMPLETE PDF
   ========================================================= */

function createPDFSummaryAndFinish(
    doc,
    headerData,
    footerData,
    pageWidth,
    pageHeight,
    margin,
    headerHeight,
    footerHeight,
    startY
) {
    let y =
        Number(
            startY
        ) ||
        headerHeight +
            8;

    const equipmentTotal =
        getEquipmentTotal();

    const copperTotal =
        getCopperTotal();

    const flexibleCableTotal =
        getFlexibleCableTotal();

    const drainageTotal =
        getDrainageTotal();

    const installationTotal =
        getInstallationCommissioningTotal();

    const additionalItemsTotal =
        getAdditionalItemsTotal();

    const asBuiltDrawingTotal =
        getAsBuiltDrawingTotal();

    const subtotal =
        getQuotationSubtotal();

    const vat =
        getQuotationVAT();

    const grandTotal =
        getQuotationGrandTotal();

    /* =====================================================
       NEW PAGE HELPER
       ===================================================== */

    function addNewSummaryPage() {
        doc.addPage();

        addHeaderImage(
            doc,
            headerData
        );

        y =
            headerHeight +
            8;
    }

    /* =====================================================
       MAKE SURE THE SUMMARY FITS
       ===================================================== */

    if (
        y >
        pageHeight -
            footerHeight -
            75
    ) {
        addNewSummaryPage();
    }

    /* =====================================================
       SUMMARY HEADING
       ===================================================== */

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(12);

    doc.setTextColor(
        7,
        89,
        133
    );

    doc.text(
        "QUOTATION SUMMARY",
        margin,
        y
    );

    y += 5;

    /* =====================================================
       SUMMARY ROWS
       ===================================================== */

    const summaryRows = [];

    if (
        equipmentTotal >
        0
    ) {
        summaryRows.push([
            "AC Equipment",

            `${
                quotation.acPrices.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        Number(
                            item.quantity ||
                            0
                        ),
                    0
                )
            } units`,

            money(
                equipmentTotal
            )
        ]);
    }

    if (
        copperTotal >
        0
    ) {
        summaryRows.push([
            "Copper Piping",

            `${
                number(
                    getTotalCopperLength()
                )
            } m`,

            money(
                copperTotal
            )
        ]);
    }

    if (
        flexibleCableTotal >
        0
    ) {
        summaryRows.push([
            quotation.flexibleCableType ||
            "1.5mm 3 core flexible cable",

            `${
                number(
                    getTotalCopperLength()
                )
            } m`,

            money(
                flexibleCableTotal
            )
        ]);
    }

    if (
        drainageTotal >
        0
    ) {
        summaryRows.push([
            "Drainage Piping",

            `${
                number(
                    getTotalDrainageLength()
                )
            } m`,

            money(
                drainageTotal
            )
        ]);
    }

    if (
        installationTotal >
        0
    ) {
        summaryRows.push([
            "Installation and Commissioning",

            `${
                Number(
                    quotation.installationUnitCount ||
                    0
                )
            } units`,

            money(
                installationTotal
            )
        ]);
    }

    if (
        additionalItemsTotal >
        0
    ) {
        summaryRows.push([
            "Accessories and Additional Items",

            `${
                quotation.additionalItems.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        Number(
                            item.quantity ||
                            0
                        ),
                    0
                )
            } items`,

            money(
                additionalItemsTotal
            )
        ]);
    }

    if (
        asBuiltDrawingTotal >
        0
    ) {
        summaryRows.push([
            "As-Built Drawing",

            "1 lot",

            money(
                asBuiltDrawingTotal
            )
        ]);
    }

    doc.autoTable({
        startY:
            y,

        head: [[
            "Description",
            "Quantity",
            "Amount"
        ]],

        body:
            summaryRows,

        theme:
            "grid",

        styles: {
            fontSize:
                8,

            cellPadding:
                2,

            valign:
                "middle",

            lineColor: [
                215,
                215,
                215
            ],

            lineWidth:
                0.2
        },

        headStyles: {
            fillColor: [
                7,
                89,
                133
            ],

            textColor: [
                255,
                255,
                255
            ],

            fontStyle:
                "bold"
        },

        columnStyles: {
            0: {
                cellWidth:
                    105
            },

            1: {
                cellWidth:
                    35
            },

            2: {
                cellWidth:
                    40,

                halign:
                    "right"
            }
        },

        margin: {
            left:
                margin,

            right:
                margin,

            top:
                headerHeight,

            bottom:
                footerHeight
        },

        didDrawPage:
            function (data) {
                if (
                    data.pageNumber >
                    1
                ) {
                    addHeaderImage(
                        doc,
                        headerData
                    );
                }
            }
    });

    y =
        doc.lastAutoTable.finalY +
        6;

    /* =====================================================
       TOTALS
       ===================================================== */

    y =
        ensurePDFSpace(
            doc,
            y,
            35,
            headerData
        );

    const totalRows = [
        [
            "Subtotal",
            money(
                subtotal
            )
        ],

        [
            "VAT (16%)",
            money(
                vat
            )
        ],

        [
            "GRAND TOTAL",
            money(
                grandTotal
            )
        ]
    ];

    doc.autoTable({
        startY:
            y,

        body:
            totalRows,

        theme:
            "grid",

        styles: {
            fontSize:
                9,

            cellPadding:
                2.5,

            lineColor: [
                200,
                205,
                210
            ],

            lineWidth:
                0.2
        },

        columnStyles: {
            0: {
                cellWidth:
                    65,

                fontStyle:
                    "bold"
            },

            1: {
                cellWidth:
                    50,

                halign:
                    "right",

                fontStyle:
                    "bold"
            }
        },

        margin: {
            left:
                pageWidth -
                margin -
                115,

            right:
                margin,

            top:
                headerHeight,

            bottom:
                footerHeight
        },

        didParseCell:
            function (data) {
                if (
                    data.row.index ===
                    totalRows.length -
                    1
                ) {
                    data.cell.styles.fillColor = [
                        220,
                        38,
                        38
                    ];

                    data.cell.styles.textColor = [
                        255,
                        255,
                        255
                    ];

                    data.cell.styles.fontStyle =
                        "bold";
                }
            }
    });

    y =
        doc.lastAutoTable.finalY +
        10;

    /* =====================================================
       TERMS AND CONDITIONS
       ===================================================== */

    y =
        ensurePDFSpace(
            doc,
            y,
            65,
            headerData
        );

    y =
        addPDFSectionHeading(
            doc,
            "TERMS AND CONDITIONS",
            y,
            margin
        );

    const terms = [
        [
            "Terms of payment:",

            "100% advance payment payable to HOTPOINT APPLIANCES LTD or as per approved payment terms."
        ],

        [
            "Warranty:",

            "Two years warranty on equipment. The warranty shall apply according to the applicable warranty conditions."
        ],

        [
            "Delivery timelines:",

            "Delivery is expected within 8–12 weeks after order confirmation and receipt of the required advance payment."
        ],

        [
            "Quotation validity:",

            "This quotation is valid for 14 days from the quotation date."
        ],

        [
            "Scope:",

            "The scope of work is limited to the items included in the priced bill of quantities."
        ],

        [
            "Exclusions:",

            "Scaffolding, glass cutting, electrical work, masonry work, wall chasing, drilling and work on false ceilings are excluded unless specifically included."
        ],

        [
            "Electrical works:",

            "Electrical power supplies for the air conditioners shall be provided by the client. Guidance on the required supplies can be provided."
        ],

        [
            "Site support:",

            "The client shall provide site access, water, electricity and safe storage for equipment, tools and installation materials."
        ],

        [
            "Operating temperature:",

            "The recommended operating temperature range for the air-conditioning system is 18–30 degrees Celsius."
        ]
    ];

    doc.autoTable({
        startY:
            y,

        body:
            terms,

        theme:
            "plain",

        styles: {
            fontSize:
                7.5,

            cellPadding:
                2,

            textColor: [
                40,
                40,
                40
            ],

            valign:
                "top",

            overflow:
                "linebreak"
        },

        columnStyles: {
            0: {
                fontStyle:
                    "bold",

                cellWidth:
                    38,

                textColor: [
                    7,
                    89,
                    133
                ]
            },

            1: {
                cellWidth:
                    pageWidth -
                    margin * 2 -
                    38
            }
        },

        margin: {
            left:
                margin,

            right:
                margin,

            top:
                headerHeight,

            bottom:
                footerHeight +
                12
        },

        didDrawPage:
            function (data) {
                if (
                    data.pageNumber >
                    1
                ) {
                    addHeaderImage(
                        doc,
                        headerData
                    );
                }
            }
    });

    y =
        doc.lastAutoTable.finalY +
        8;

    /* =====================================================
       REVIEW INSTRUCTION
       This appears at the bottom of the final quotation.
       ===================================================== */

    y =
        ensurePDFSpace(
            doc,
            y,
            22,
            headerData
        );

    doc.setFillColor(
        239,
        246,
        255
    );

    doc.setDrawColor(
        7,
        89,
        133
    );

    doc.roundedRect(
        margin,
        y,
        pageWidth -
            margin * 2,
        17,
        2,
        2,
        "FD"
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(9);

    doc.setTextColor(
        7,
        89,
        133
    );

    const reviewMessage =
        "Please send this quotation to acmsa@hotpoint.co.ke for review.";

    const reviewLines =
        doc.splitTextToSize(
            reviewMessage,
            pageWidth -
                margin * 2 -
                10
        );

    doc.text(
        reviewLines,
        pageWidth / 2,
        y + 7,
        {
            align:
                "center"
        }
    );

    /* =====================================================
       ADD FOOTERS TO EVERY PAGE
       ===================================================== */

    const totalPages =
        doc.internal.getNumberOfPages();

    for (
        let pageNumber = 1;
        pageNumber <= totalPages;
        pageNumber++
    ) {
        doc.setPage(
            pageNumber
        );

        addFooterToPage(
            doc,
            footerData,
            pageNumber
        );
    }

    /* =====================================================
       CREATE SAFE PDF FILENAME
       ===================================================== */

    const safeClientName =
        String(
            quotation.clientName ||
            "Client"
        )
            .trim()
            .replace(
                /[^a-z0-9]+/gi,
                "_"
            )
            .replace(
                /^_+|_+$/g,
                ""
            );

    const filename =
        `HVAC_Quotation_${
            safeClientName ||
            "Client"
        }.pdf`;

    /* =====================================================
       DOWNLOAD PDF
       ===================================================== */

    doc.save(
        filename
    );

    showPage(15);
}

/* =========================================================
   START A NEW QUOTATION
   ========================================================= */

function startNewQuotation() {
    quotation = {
        quotationType:
            "",

        rooms:
            [],

        copperRate:
            3200,

        flexibleCableType:
            "1.5mm 3 core flexible cable",

        flexibleCableRate:
            500,

        drainageRate:
            1200,

        installationRegion:
            "",

        acType:
            "",

        installationUnitCost:
            0,

        installationUnitCount:
            0,

        installationTotal:
            0,

        additionalItems:
            [],

        includeVoltSwitcher:
            false,

        voltSwitcherModel:
            "VXV13ABAS",

        voltSwitcherQuantity:
            0,

        includeCassettePanel:
            false,

        cassettePanelModel:
            "PT-MCHWO",

        cassettePanelQuantity:
            0,

        includeAsBuiltDrawing:
            false,

        asBuiltDrawingCost:
            5000,

        acPrices:
            [],

        clientName:
            "",

        installationLocation:
            "",

        clientPhone:
            "",

        clientEmail:
            ""
    };

    const roomContainer =
        document.getElementById(
            "roomInputContainer"
        );

    if (roomContainer) {
        roomContainer.innerHTML = `
            <div class="input-row room-input-row">

                <input
                    type="text"
                    class="room-name-input"
                    placeholder="e.g. Living Room"
                >

                <button
                    type="button"
                    class="remove-input"
                    onclick="removeRoomInput(this)"
                >
                    ×
                </button>

            </div>
        `;
    }

    [
        "clientName",
        "installationLocation",
        "salesPerson",
        "salesPhone",
        "salesEmail"
    ].forEach(id => {
        const element =
            document.getElementById(
                id
            );

        if (element) {
            element.value =
                "";
        }
    });

    const quotationPreview =
        document.getElementById(
            "quotationPreview"
        );

    if (quotationPreview) {
        quotationPreview.innerHTML =
            "";
    }

    const roomPreview =
        document.getElementById(
            "roomPreview"
        );

    if (roomPreview) {
        roomPreview.innerHTML =
            "";
    }

    const dimensionInputs =
        document.getElementById(
            "dimensionInputs"
        );

    if (dimensionInputs) {
        dimensionInputs.innerHTML =
            "";
    }

    const dimensionPreview =
        document.getElementById(
            "dimensionPreview"
        );

    if (dimensionPreview) {
        dimensionPreview.innerHTML =
            "";
    }

    const copperInputs =
        document.getElementById(
            "copperInputs"
        );

    if (copperInputs) {
        copperInputs.innerHTML =
            "";
    }

    const copperPreview =
        document.getElementById(
            "copperPreview"
        );

    if (copperPreview) {
        copperPreview.innerHTML =
            "";
    }

    const coolingLoadInputs =
        document.getElementById(
            "coolingLoadInputs"
        );

    if (coolingLoadInputs) {
        coolingLoadInputs.innerHTML =
            "";
    }

    const coolingLoadPreview =
        document.getElementById(
            "coolingLoadPreview"
        );

    if (coolingLoadPreview) {
        coolingLoadPreview.innerHTML =
            "";
    }

    showPage(0);
}

/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {
        /*
           Refresh the jsPDF constructor in case the library
           finishes loading after script.js starts.
        */

        if (
            window.jspdf &&
            typeof window.jspdf.jsPDF ===
                "function"
        ) {
            jsPDFConstructor =
                window.jspdf.jsPDF;
        }

        const year =
            document.getElementById(
                "currentYear"
            );

        if (year) {
            year.textContent =
                new Date()
                    .getFullYear();
        }

        configureClientFields();

        showPage(0);
    }
);

/* =========================================================
   RECONFIGURE CLIENT FIELDS WHEN NAVIGATING
   ========================================================= */

document.addEventListener(
    "click",
    function () {
        window.setTimeout(
            configureClientFields,
            0
        );
    }
);
