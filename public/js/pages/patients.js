// patient.html: list every patient profile.
// Patient records are personal data, so the database only serves them to
// signed-in users (see database.rules.json).
import { PATHS } from "../firebase.js";
import { h } from "../dom.js";
import { toList, displayName, safeImageUrl } from "../format.js";
import { bindView } from "../view.js";

const field = (className, label, value) =>
  h("div", { class: className }, h("h5", { class: "dark" }, label), h("h5", {}, value ?? ""));

const patientCard = (patient) =>
  h("div", { class: "profile-card" },
    h("img", { src: safeImageUrl(patient.image), alt: "" }),
    h("div", { class: "info" },
      h("a", { href: `patient-detail.html?id=${encodeURIComponent(patient.id)}` }, h("h3", {}, displayName(patient))),
      h("div", { class: "ttll" },
        h("div", { class: "locate" }, h("img", { src: "images/locate.svg", alt: "" }), h("h5", {}, patient.place ?? "")),
        h("div", { class: "line3" }, field("age", "Tuổi:", patient.age), field("gender", "Giới tính:", patient.sex)))));

bindView(document.getElementById("patient-list"), {
  path: PATHS.patients,
  signInRequired: true,
  render: (value) => {
    const patients = toList(value);
    return patients.length ? patients.map(patientCard) : "Chưa có hồ sơ bệnh nhân nào.";
  },
});
