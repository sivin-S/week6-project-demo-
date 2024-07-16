// DOM Elements
const tableBody = document.querySelector("tbody");
const searchInput = document.getElementById("searchBox");

// Searching user in table
searchInput.addEventListener("keyup", function() {
    const searchValue = searchInput.value.toString().toLowerCase();
    const tableRows = tableBody.getElementsByTagName("tr");

    for (let index = 0; index < tableRows.length; index++) {
        const tableRow = tableRows[index];
        const nameCell = tableRow.children[1]; // Assuming the name is in the second column

        if (nameCell) {
            const cellText = nameCell.textContent.toString().toLowerCase();
            if (cellText.includes(searchValue)) {
                tableRow.classList.remove("d-none");
            } else {
                tableRow.classList.add("d-none");
            }
        }
    }
});
