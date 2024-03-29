import ReactDOM from "react-dom/client";
import Editor, { EditorDataSet } from "./Editor";

const element = document.getElementById("excalidraw-root")!;

ReactDOM.createRoot(element).render(
  <Editor {...(element.dataset as EditorDataSet)} />
);
