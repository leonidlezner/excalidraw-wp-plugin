import ReactDOM from "react-dom/client";
import Editor, { EditorDataSet } from "./Editor";

const element = document.getElementById("excalidraw-root")!;

if (element?.dataset["docId"]) {
  window.name = element.dataset["docId"];
}

ReactDOM.createRoot(element).render(
  <Editor {...(element.dataset as EditorDataSet)} />
);
