import ReactDOM from "react-dom/client";
import Editor, { EditorDataSet } from "./Editor";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const element = document.getElementById("excalidraw-root")!;

if (element?.dataset["docId"]) {
  window.name = element.dataset["docId"];
}

i18n.use(initReactI18next).init({
  lng: element.dataset["lang"],
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    de: {
      translation: {
        Save: "Speichern",
        "Save and Close": "Speichern und Schließen",
        Close: "Schließen",
        "Error occured during saving": "Fehler beim Speichern",
        "Local unsaved version of this document was found. Load the local version?":
          "Es wurde eine lokale, nicht gespeicherte Version dieses Dokuments gefunden. Die lokale Version laden?",
      },
    },
  },
});

ReactDOM.createRoot(element).render(
  <Editor {...(element.dataset as EditorDataSet)} />
);
