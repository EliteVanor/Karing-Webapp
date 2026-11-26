// patient-detail.html?id=<patientId>: one patient profile (signed-in users only).
import { PATHS } from "../firebase.js";
import { h, queryParam } from "../dom.js";
import { displayName, isDatabaseKey, safeImageUrl } from "../format.js";
import { bindView } from "../view.js";

const id = queryParam("id");

bindView(document.getElementById("detail"), {
  path: isDatabaseKey(id) ? PATHS.patient(id) : null,
  signInRequired: true,
  render: (patient) => {
    if (!patient) return "Không tìm thấy hồ sơ bệnh nhân.";
    const image = safeImageUrl(patient.image);
    return [
      h("h1", {}, displayName(patient)),
      image && h("img", { class: "detail-photo", src: image, alt: "" }),
      h("p", { class: "detail-meta" }, `${patient.place ?? ""} · ${patient.age ?? ""} tuổi`),
      h("a", { href: "patient.html" }, "← Tất cả bệnh nhân"),
    ];
  },
});
