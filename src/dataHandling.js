import { notes, archived } from "./data.js";
import ValidationError from "./ValidationError.js";
import { ErrorField } from "./ErrorField.js";
import {
  showOverlay,
  hideOverlay,
  getCreateOverlay,
  getEditOverlay,
  getDeleteOverlay,
  getAllOverlays,
  clearAllErrorBlocks,
  getCreateForm,
  getEditForm,
} from "./overlayHandling.js";
import { setRowHTML } from "./rowRendering.js";

getAllOverlays().forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target == e.currentTarget) {
      hideOverlay(e.target);
      clearAllErrorBlocks();
    }
  });
});

const event = new Event("tableChanged");
const getSummaryTable = () => document.getElementById("summary-table");

getSummaryTable().addEventListener("tableChanged", (e) => {
  const taskActiveCell = e.target.querySelector(
    "tr:nth-child(2) td:nth-child(2)"
  );
  const taskArchivedCell = e.target.querySelector(
    "tr:nth-child(2) td:nth-child(3)"
  );
  const randomThoughtActiveCell = e.target.querySelector(
    "tr:nth-child(3) td:nth-child(2)"
  );
  const randomThoughtArchivedCell = e.target.querySelector(
    "tr:nth-child(3) td:nth-child(3)"
  );
  const ideaActiveCell = e.target.querySelector(
    "tr:nth-child(4) td:nth-child(2)"
  );
  const ideaArchivedCell = e.target.querySelector(
    "tr:nth-child(4) td:nth-child(3)"
  );
  taskActiveCell.innerText = notes.filter(
    (note) => note.category === "Task"
  ).length;
  randomThoughtActiveCell.innerText = notes.filter(
    (note) => note.category === "Random Thought"
  ).length;
  ideaActiveCell.innerText = notes.filter(
    (note) => note.category === "Idea"
  ).length;
  taskArchivedCell.innerText = archived.filter(
    (note) => note.category === "Task"
  ).length;
  randomThoughtArchivedCell.innerText = archived.filter(
    (note) => note.category === "Random Thought"
  ).length;
  ideaArchivedCell.innerText = archived.filter(
    (note) => note.category === "Idea"
  ).length;
});

const getNoteIndex = () =>
  notes.findIndex(
    (note) => note.id === parseInt(sessionStorage.currentRowId.split("-")[1])
  );
const getArchivedNoteIndex = () =>
  archived.findIndex(
    (archivedNote) =>
      archivedNote.id === parseInt(sessionStorage.currentRowId.split("-")[1])
  );

const removeNoteFromCurrentTable = () => {
  const noteIndexToDelete = getNoteIndex();
  notes.splice(noteIndexToDelete, 1);
  document
    .getElementById("current-notes-table")
    .deleteRow(noteIndexToDelete + 1);
};
const removeNoteFromArchivedTable = () => {
  const noteIndexToDelete = getArchivedNoteIndex();
  archived.splice(noteIndexToDelete, 1);
  document
    .getElementById("archived-notes-table")
    .deleteRow(noteIndexToDelete + 1);
};

const addBehaviourToButtonsInRow = (id, isArchived = false) => {
  const rowArchiveButton = document.querySelector(
    `#note-${id} .archive-button`
  );
  const rowUnarchiveButton = document.querySelector(
    `#note-${id} .unarchive-button`
  );
  const rowEditButton = document.querySelector(`#note-${id} .edit-button`);
  const rowDeleteButton = document.querySelector(`#note-${id} .delete-button`);
  const getRowId = (e) => {
    const target = e.target.parentElement.parentElement;
    if (e.target.tagName === "path") {
      return target.parentElement.parentElement.id;
    } else if (e.target.tagName === "svg") {
      return target.parentElement.id;
    } else {
      return target.id;
    }
  };

  rowEditButton?.addEventListener("click", (e) => {
    showOverlay(getEditOverlay());
    sessionStorage.currentRowId = getRowId(e);
    const noteIndex = getNoteIndex();
    const editNameInput = document.querySelector('input[name="edit-name"]');
    const editCategoryInput = document.querySelector(
      'select[name="edit-category"]'
    );
    const editContentInput = document.querySelector(
      'textarea[name="edit-content"]'
    );
    editNameInput.value = notes[noteIndex].name;
    editCategoryInput.value = notes[noteIndex].category;
    editContentInput.value = notes[noteIndex].content;
  });
  rowDeleteButton?.addEventListener("click", (e) => {
    sessionStorage.currentRowId = getRowId(e);
    showOverlay(getDeleteOverlay());
  });
  if (isArchived) {
    rowUnarchiveButton?.addEventListener("click", (e) => {
      sessionStorage.currentRowId = getRowId(e);
      const archivedNote = archived[getArchivedNoteIndex()];
      const foundIndex = notes.findIndex((note) => note.id > archivedNote.id);
      let indexToInsert = foundIndex === -1 ? notes.length - 1 : foundIndex;
      const rowToInsert = document.getElementById(
        `note-${notes[indexToInsert].id}`
      );
      const positionToInsert = foundIndex === -1 ? "afterend" : "beforebegin";
      rowToInsert.insertAdjacentHTML(
        positionToInsert,
        setRowHTML(prepareNoteData(archivedNote))
      );
      indexToInsert = foundIndex === -1 ? indexToInsert + 1 : indexToInsert;
      notes.splice(indexToInsert, 0, archivedNote);
      addBehaviourToButtonsInRow(notes[indexToInsert].id);
      removeNoteFromArchivedTable();
      getSummaryTable().dispatchEvent(event);
    });
  } else {
    rowArchiveButton?.addEventListener("click", (e) => {
      sessionStorage.currentRowId = getRowId(e);
      const note = notes[getNoteIndex()];
      getArchivedDataTableBody().insertAdjacentHTML(
        "beforeend",
        setRowHTML(prepareNoteData(note), true)
      );
      archived.push(note);
      addBehaviourToButtonsInRow(archived[archived.length - 1].id, true);
      removeNoteFromCurrentTable();
      getSummaryTable().dispatchEvent(event);
    });
  }
};

const prepareNoteData = (note) => {
  if (!note.created) {
    const today = new Date(Date.now());
    const todayDay =
      today.getDate() > 9 ? today.getDate() : `0${today.getDate()}`;
    const todayMonth =
      today.getMonth() + 1 > 9
        ? today.getMonth() + 1
        : `0${today.getMonth() + 1}`;
    const todayYear = today.getFullYear();
    note.created = `${todayDay}\\${todayMonth}\\${todayYear}`;
  }
  const foundDates = note.content.match(
    /(0?[1-9]|[12][0-9]|3[01])\/((0?[1-9]|1[012])\/(19|20)?[0-9]{2})/gm
  );
  note.dates = foundDates?.join(", ") || "";
  return note;
};

const getCurrentDataTableBody = () =>
  document.querySelector("#current-notes-table tbody");
const getArchivedDataTableBody = () =>
  document.querySelector("#archived-notes-table tbody");

notes.forEach((note) => {
  getCurrentDataTableBody().insertAdjacentHTML(
    "beforeend",
    setRowHTML(prepareNoteData(note))
  );
  addBehaviourToButtonsInRow(note.id);
});
archived.forEach((archivedNote) => {
  getArchivedDataTableBody().insertAdjacentHTML(
    "beforeend",
    setRowHTML(prepareNoteData(archivedNote), true)
  );
  addBehaviourToButtonsInRow(archivedNote.id, true);
});
getSummaryTable().dispatchEvent(event);

const createButton = document.querySelector(".create-button");

createButton.addEventListener("click", () => {
  getCreateForm().reset();
  showOverlay(getCreateOverlay());
});

const createConfirmButton = document.querySelector(".create-confirm-button");
const saveButton = document.querySelector(".save-button");
const deleteConfirmButton = document.querySelector(".delete-confirm-button");

createConfirmButton.addEventListener("click", () => {
  clearAllErrorBlocks();
  const form = new FormData(getCreateForm());
  try {
    if (!form.get("create-name")) {
      throw new ValidationError(
        "The name field can't be empty",
        ErrorField.Create.Name
      );
    }
    if (!form.get("create-category")) {
      throw new ValidationError(
        "The category field can't be empty",
        ErrorField.Create.Category
      );
    }
    if (!form.get("create-content")) {
      throw new ValidationError(
        "The content field can't be empty",
        ErrorField.Create.Content
      );
    }
    const newNote = {
      id: +localStorage.getItem("currentId"),
      name: form.get("create-name"),
      category: form.get("create-category"),
      content: form.get("create-content"),
    };
    notes.push(newNote);
    getCurrentDataTableBody().insertAdjacentHTML(
      "beforeend",
      setRowHTML(prepareNoteData(newNote))
    );
    addBehaviourToButtonsInRow(newNote.id);
    localStorage.currentId = +localStorage.currentId + 1;
    hideOverlay(getCreateOverlay());
    clearAllErrorBlocks();
    getSummaryTable().dispatchEvent(event);
  } catch (error) {
    if (error instanceof ValidationError) {
      const errorBlock = document.getElementById(error.field);
      errorBlock.innerText = error.message;
      errorBlock.style.visibility = "visible";
    }
  }
});
saveButton.addEventListener("click", () => {
  clearAllErrorBlocks();
  const noteNameCell = document.querySelector(
    `#${sessionStorage.currentRowId} td:nth-child(1)`
  );
  const noteCreatedCell = document.querySelector(
    `#${sessionStorage.currentRowId} td:nth-child(2)`
  );
  const noteCategoryCell = document.querySelector(
    `#${sessionStorage.currentRowId} td:nth-child(3)`
  );
  const noteContentCell = document.querySelector(
    `#${sessionStorage.currentRowId} td:nth-child(4)`
  );
  const noteDatesCell = document.querySelector(
    `#${sessionStorage.currentRowId} td:nth-child(5)`
  );
  const form = new FormData(getEditForm());
  try {
    if (!form.get("edit-name")) {
      throw new ValidationError(
        "The name field can't be empty",
        ErrorField.Edit.Name
      );
    }
    if (!form.get("edit-category")) {
      throw new ValidationError(
        "The category field can't be empty",
        ErrorField.Edit.Category
      );
    }
    if (!form.get("edit-content")) {
      throw new ValidationError(
        "The content field can't be empty",
        ErrorField.Edit.Content
      );
    }
    const noteIndex = getNoteIndex();
    const editedNote = {
      id: notes[noteIndex],
      name: form.get("edit-name"),
      category: form.get("edit-category"),
      content: form.get("edit-content"),
    };
    notes[noteIndex].name = editedNote.name;
    notes[noteIndex].category = editedNote.category;
    notes[noteIndex].content = editedNote.content;
    const preparedNoteData = prepareNoteData(notes[noteIndex]);
    noteNameCell.innerText = preparedNoteData.name;
    noteCreatedCell.innerText = preparedNoteData.created;
    noteCategoryCell.innerText = preparedNoteData.category;
    noteContentCell.innerText = preparedNoteData.content;
    noteDatesCell.innerText = preparedNoteData.dates;
    hideOverlay(getEditOverlay());
  } catch (error) {
    if (error instanceof ValidationError) {
      const errorBlock = document.getElementById(error.field);
      errorBlock.innerText = error.message;
      errorBlock.style.visibility = "visible";
    }
  }
});
deleteConfirmButton.addEventListener("click", () => {
  removeNoteFromCurrentTable();
  getSummaryTable().dispatchEvent(event);
  hideOverlay(getDeleteOverlay());
});
