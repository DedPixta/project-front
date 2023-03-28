// Constants
const structure = {
  accountsPerPage: document.getElementById("accounts_per_page"),
  players: {
    id: document.getElementById("id"),
    name: document.getElementById("name"),
    title: document.getElementById("title"),
    race: document.getElementById("race"),
    profession: document.getElementById("profession"),
    level: document.getElementById("level"),
    birthday: document.getElementById("birthday"),
    banned: document.getElementById("banned"),
    edit: document.getElementById("edit"),
    delete: document.getElementById("delete"),
  },
  pages: document.getElementById("pages"),
  userForm: {
    form: document.getElementById("create_user_form"),
    name: document.getElementById("form_name"),
    title: document.getElementById("form_title"),
    birthday: document.getElementById("form_birthday"),
    level: document.getElementById("form_level"),
  },
};

const race = {
  human: "HUMAN",
  dwarf: "DWARF",
  elf: "ELF",
  giang: "GIANT",
  orc: "ORC",
  troll: "TROLL",
  hobbit: "HOBBIT",
};

const profession = {
  warrior: "WARRIOR",
  rogue: "ROGUE",
  sorcerer: "SORCERER",
  cleric: "CLERIC",
  paladin: "PALADIN",
  nazgul: "NAZGUL",
  warlock: "WARLOCK",
  druid: "DRUID",
};

const banned = {
  true: "true",
  false: "false",
};

const params = [
  "id",
  "name",
  "title",
  "race",
  "profession",
  "level",
  "birthday",
  "banned",
  "edit",
  "delete",
];

const request = {
  players: "/rest/players",
  numberOfAccounts: "/rest/players/count",
  delete: (playerId) => `/rest/players/${playerId}`,
  update: (playerId) => `/rest/players/${playerId}`,
};

const canBeUpdated = ["name", "title", "race", "profession", "banned"];

const firstPage = 0;

const constraints = {
  name: {
    regex: "^[\\p{Script=Cyrl}A-Za-z][\\p{Script=Cyrl}A-Za-z\\s]*$",
    info: "Name should be 1-12 chars of cyrillic or latin alphabet",
  },
  title: {
    regex: "^[\\p{Script=Cyrl}A-Za-z][\\p{Script=Cyrl}A-Za-z\\s]*$",
    info: "Title should be 1-30 chars of cyrillic or latin alphabet",
  },
  birthday: {
    info: "Birthday should not be from the future",
  },
  level: {
    regex: "^[1-9]([\\d][0]{0,1}|)$",
    info: "Level should be between 1-100",
  },
};

function init() {
  getThen(request.players, addToTable);

  getThen(request.numberOfAccounts, addToTablePages);

  spellCheckCreateForm();

  structure.userForm.form.addEventListener("submit", function (e) {
    e.preventDefault();
  });

  structure.accountsPerPage.onchange = changeView;

  $("#create_user_form").on("submit", submitClick);
}

// Buttons
// noinspection JSUnusedGlobalSymbols
function pageClick(clickedButton) {
  const selector = `label[for='${clickedButton.id}']`;
  const pageLabel = document.querySelector(selector);
  const pageNumber = pageLabel.innerText - 1;
  const pageSize = structure.accountsPerPage.value;
  const option = getOption(pageNumber, pageSize);

  clearTable();

  getWithOptionThen(request.players, option, addToTable);
}

// noinspection JSUnusedGlobalSymbols
function deleteClick(clickedButton) {
  const parentNode = clickedButton.parentNode;
  const playerId = parentNode.id.split("_")[1];

  deletePlayerThen(request.delete(playerId), refreshTable);
}

// noinspection JSUnusedGlobalSymbols
function saveClick(clickedButton) {
  const parentNode = clickedButton.parentNode;
  const playerId = parentNode.id.split("_")[1];
  const inputName = document.querySelector(`#input_name_${playerId}>input`);
  const inputTitle = document.querySelector(
    `#input_title_${playerId}>textarea`
  );

  const pattern = "^[\\p{Script=Cyrl}A-Za-z][\\p{Script=Cyrl}A-Za-z\\s]*$";
  const regex = new RegExp(pattern, "u");

  if (!regex.test(inputName.value)) {
    return;
  }

  if (!regex.test(inputTitle.value)) {
    return;
  }

  const inputContainers = document.querySelectorAll(".players>div>.input");
  const options = {};

  inputContainers.forEach((container) => {
    const param = container.id.split("_")[1];
    const input = container.firstChild;
    options[param] = input.value;
  });

  updatePlayerThen(request.update(playerId), options, refreshTable);
}

function submitClick() {
  const formData = {
    name: document.getElementById("form_name").value,
    title: document.getElementById("form_title").value,
    race: document.querySelector(".race_button:checked").value,
    profession: document.querySelector(".prof_button:checked").value,
    level: document.getElementById("form_level").valueAsNumber,
    birthday: document.getElementById("form_birthday").valueAsNumber,
    banned: document.querySelector(".banned_button:checked").value,
  };

  console.log(formData);
  console.log(JSON.stringify(formData));

  $.ajax({
    type: "POST",
    url: "/rest/players",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(formData),
    success: refreshTable,
  });

  structure.userForm.form.reset();
}

function spellCheckCreateForm() {
  structure.userForm.name.oninput = checkForm;
  structure.userForm.title.oninput = checkForm;
  structure.userForm.birthday.oninput = checkForm;
  structure.userForm.level.oninput = checkForm;
}

function checkForm() {
  const checkingFields = ["name", "title", "birthday", "level"];

  checkingFields.forEach((field) => checkField(field));
}

function checkField(fieldName) {
  const field = structure.userForm[fieldName];
  let currentValue;
  if ("birthday" === fieldName) {
    const todayDate = Date.now();
    currentValue = field.valueAsNumber;

    if (isNaN(currentValue)) {
      return;
    }

    if (currentValue <= todayDate) {
      field.setCustomValidity("");
    } else {
      field.setCustomValidity(constraints[fieldName].info);
    }
  } else {
    const constraint = new RegExp(constraints[fieldName].regex, "u");
    currentValue = field.value;
    if (constraint.test(currentValue)) {
      field.setCustomValidity("");
    } else {
      field.setCustomValidity(constraints[fieldName].info);
    }
  }
}

// noinspection JSUnusedGlobalSymbols
function editClick(clickedButton) {
  const parentNode = clickedButton.parentNode;
  const playerId = parentNode.id.split("_")[1];
  const deleteImg = document.querySelector(`#delete_${playerId}>.image`);
  deleteImg.style.display = "none";
  clickedButton.src = "/img/save.png";
  clickedButton.alt = "save";
  clickedButton.setAttribute("onclick", `saveClick(this)`);

  canBeUpdated.forEach((param) => createEditArea(param, playerId));
}

function createEditArea(param, playerId) {
  const changingElement = document.getElementById(`${param}_${playerId}`);
  const currentValue = changingElement.innerText;
  const container = document.createElement("div");
  container.id = `input_${param}_${playerId}`;
  container.setAttribute("class", "input column__item");

  let child;

  if ("name" === param) {
    child = document.createElement("input");
    child.setAttribute("type", "text");
    child.maxLength = 12;
    child.value = currentValue;
    child.setAttribute("class", "text input_text");
    child.setAttribute("oninput", "spellCheck(this)");
  }

  if ("title" === param) {
    child = document.createElement("textarea");
    child.maxLength = 30;
    child.value = currentValue;
    child.setAttribute("class", "text input_textarea");
    child.setAttribute("oninput", "spellCheck(this)");
  }

  if ("race" === param || "profession" === param || "banned" === param) {
    child = document.createElement("select");
    child.setAttribute("type", "select");
    const options =
      "race" === param ? race : "profession" === param ? profession : banned;

    createOptionsTo(options, child, currentValue);
    child.value = currentValue;
    child.setAttribute("class", "text input_selector");
  }

  container.appendChild(child);
  changingElement.after(container);
  changingElement.remove();
}

// noinspection JSUnusedGlobalSymbols
function spellCheck(element) {
  element.value = element.value.replace(/\n/g, "");

  const pattern = "^[\\p{Script=Cyrl}A-Za-z][\\p{Script=Cyrl}A-Za-z\\s]*$";
  const regex = new RegExp(pattern, "u");

  if (regex.test(element.value)) {
    element.style.backgroundColor = "rgba(255, 80, 0, 0.24)";
  } else {
    element.style.backgroundColor = "rgba(255, 0, 0, 0.48)";
  }
}

function createOptionsTo(options, parent, currentValue) {
  for (const option in options) {
    if (Object.hasOwnProperty.call(options, option)) {
      const element = options[option];
      const optionElement = document.createElement("option");
      optionElement.value = element;
      optionElement.innerText = element;
      optionElement.checked = currentValue === element;
      parent.appendChild(optionElement);
    }
  }
}

// Table
function changeView(accountsPerPage) {
  clearTable();

  clearPages();

  const pageSize = accountsPerPage.target.value;

  getWithOptionThen(
    request.players,
    getOption(firstPage, pageSize),
    addToTable
  );

  getThen(request.numberOfAccounts, (accounts) =>
    addToTablePages(accounts, pageSize)
  );
}

function addToTable(heroes) {
  for (let i = 0; i < heroes.length; i++) {
    createElement(heroes[i]);
  }
}

function createElement(hero) {
  params.forEach((param) => createHeroesParam.call(hero, param));
}

function createHeroesParam(param) {
  const parent = structure.players[param];
  if ("edit" === param || "delete" === param) {
    const child = document.createElement("div");
    child.id = `${param}_${this.id}`;
    child.setAttribute("class", "column__item");

    const img = document.createElement("img");
    img.setAttribute("src", `/img/${param}.png`);
    img.setAttribute("alt", param);
    img.setAttribute("class", "image");
    img.setAttribute("onclick", `${param}Click(this)`);
    child.appendChild(img);

    parent.appendChild(child);
  } else {
    const child = document.createElement("p");
    child.id = `${param}_${this.id}`;
    child.setAttribute("class", "text column__item");

    if ("birthday" === param) {
      child.textContent = new Date(this[param]).toLocaleDateString("en-US");
    } else {
      child.textContent = this[param];
    }
    parent.appendChild(child);
  }
}

function clearTable() {
  params.forEach((param) => {
    const parent = structure.players[param];
    const childs = document.querySelectorAll(`#${param} > .column__item`);
    for (const child of childs) {
      parent.removeChild(child);
    }
  });
}

function refreshTable() {
  const checkedButton = document.querySelector("input.page_button:checked");
  const buttonId = checkedButton.id;
  const currentPage = buttonId.split("_")[1];

  clearPages();

  clearTable();

  getThen(request.numberOfAccounts, (numberOfAccounts) =>
    refreshCurrentPage(numberOfAccounts, buttonId, currentPage)
  );
}

function refreshCurrentPage(numberOfAccounts, buttonId, currentPage) {
  const pageSize = structure.accountsPerPage.value;
  const pages = Math.ceil(numberOfAccounts / pageSize);

  if (pages === 0) {
    return;
  }

  const page = Math.min(parseInt(currentPage) + 1, pages);
  const option = getOption(page - 1, pageSize);

  getWithOptionThen(request.players, option, addToTable);

  addToTablePages(numberOfAccounts, pageSize);

  const checkedButton = document.getElementById(`page_${page - 1}`);
  checkedButton.checked = true;
}

// Pages
function addToTablePages(accounts, pageSize = 3) {
  const pages = Math.ceil(accounts / pageSize);

  for (let index = 0; index < pages; index++) {
    createPage(index);
  }
}

function clearPages() {
  const parent = structure.pages;
  const childs = parent.querySelectorAll("div");
  for (const child of childs) {
    parent.removeChild(child);
  }
}

function createPage(index) {
  const block = document.createElement("div");

  const button = document.createElement("input");
  button.id = `page_${index}`;
  button.setAttribute("type", "radio");
  button.setAttribute("class", "page_button");
  button.setAttribute("name", "pages_radio");
  button.setAttribute("onclick", "pageClick(this)");
  if (0 === index) {
    button.checked = true;
  }
  block.appendChild(button);

  const label = document.createElement("label");
  label.setAttribute("for", button.id);
  label.setAttribute("class", "page_label");
  label.innerText = index + 1;
  block.appendChild(label);

  const pages = structure.pages;
  pages.appendChild(block);
}

// Requests
function getThen(request, action) {
  $.get(request, (answer) => action(answer));
}

function getWithOptionThen(request, options, action) {
  $.get(request, options, action);
}

function getOption(pageNumber, pageSize = 3) {
  return {
    pageNumber: pageNumber,
    pageSize: pageSize,
  };
}

function deletePlayerThen(id, action) {
  $.ajax({
    url: id,
    type: "DELETE",
    success: action,
  });
}

function updatePlayerThen(url, options, action) {
  $.ajax({
    url: url,
    type: "POST",
    data: JSON.stringify(options),
    contentType: "application/json; charset=utf-8",
    success: (answer) => action(answer),
  });
}
