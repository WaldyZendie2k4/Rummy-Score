let tableCount = 1;
let participants = [];
let scores = {};
let round = 0;

document.getElementById("darkToggle").addEventListener("change", () => {
  document.body.classList.toggle("dark");
  document.getElementById("themeLabel").innerText = document.body.classList.contains("dark") ? "Dark Mode" : "Light Mode";
});

function startGame() {
  const input = document.getElementById("namesInput").value.trim();
  if (!input) {
    alert("Please enter names.");
    return;
  }

  participants = input.split(",").map(name => name.trim());
  round = 0;
  scores = {};

  const tableTemplate = document.querySelector("#scoreTableSection").cloneNode(true);
  tableTemplate.id = `scoreTableSection-${tableCount}`;
  tableTemplate.querySelector(".tableHead").innerHTML = `
    <tr id="header-row-${tableCount}">
      <th>Name</th>
      <th>Total</th>
    </tr>
  `;
  tableTemplate.querySelector(".tableBody").innerHTML = "";
  tableTemplate.querySelector("h2").innerText = `Score Table - ${tableCount}`;
  tableTemplate.querySelector(".nextRoundBtn").disabled = false;
  tableTemplate.style.display = "block";

  document.getElementById("tablesContainer").appendChild(tableTemplate);

  participants.forEach((name, i) => {
    scores[name] = { total: 0, rounds: [], eliminated: false };
    const row = document.createElement("tr");
    row.id = `row-${tableCount}-${i}`;
    row.innerHTML = `<td>${name}</td><td id="total-${tableCount}-${i}">0</td>`;
    tableTemplate.querySelector(".tableBody").appendChild(row);
  });

  addRound(tableTemplate.querySelector(".nextRoundBtn"));
  tableCount++;
}

function addRound(buttonElement) {
  const section = buttonElement.closest(".score-table-block");
  const tableId = section.id.split("-")[1];
  round++;

  const headerRow = section.querySelector(`#header-row-${tableId}`);
  const roundTh = document.createElement("th");
  roundTh.innerText = `Round ${round}`;
  headerRow.appendChild(roundTh);

  participants.forEach((name, i) => {
    const player = scores[name];
    const row = section.querySelector(`#row-${tableId}-${i}`);
    const td = document.createElement("td");
    td.id = `cell-${tableId}-${i}-${round}`;

    if (round > 1) {
      const prev = section.querySelector(`#cell-${tableId}-${i}-${round - 1}`);
      if (prev) {
        const btn = prev.querySelector("button");
        if (btn) prev.removeChild(btn);
      }
    }

    if (player.eliminated) {
      td.innerHTML = "-";
    } else {
      td.innerHTML = `
        <input type="number" id="score-${tableId}-${i}-${round}" value="0" min="0" style="width: 60px;" />
        <button onclick="submitScore(${tableId}, ${i}, ${round})">OK</button>
      `;
    }

    row.appendChild(td);
  });

  const active = participants.filter(p => !scores[p].eliminated);
  if (active.length === 1) {
    const winner = active[0];
    const winnerIndex = participants.indexOf(winner);
    const cell = section.querySelector(`#total-${tableId}-${winnerIndex}`);
    cell.innerText = "🎉 CONGRATULATIONS WINNER";
    cell.classList.add("winner");
    buttonElement.disabled = true;
  }
}

function submitScore(tableId, index, roundNum) {
  const name = participants[index];
  const player = scores[name];
  const input = document.getElementById(`score-${tableId}-${index}-${roundNum}`);
  let score = parseInt(input.value);

  if (isNaN(score) || score < 0) {
    alert("Enter a valid score.");
    return;
  }

  input.disabled = true;
  input.nextElementSibling.remove();

  player.rounds.push(score);
  player.total += score;

  const totalCell = document.getElementById(`total-${tableId}-${index}`);
  if (player.total >= 200) {
    totalCell.innerText = "BYE BYE";
    totalCell.classList.add("eliminated");
    player.eliminated = true;
  } else {
    totalCell.innerText = player.total;
  }

  const section = document.getElementById(`scoreTableSection-${tableId}`);
  const active = participants.filter(p => !scores[p].eliminated);
  if (active.length === 1) {
    const winner = active[0];
    const winnerIndex = participants.indexOf(winner);
    const cell = document.getElementById(`total-${tableId}-${winnerIndex}`);
    cell.innerText = "🎉 CONGRATULATIONS WINNER";
    cell.classList.add("winner");
    section.querySelector(".nextRoundBtn").disabled = true;
  }
}
