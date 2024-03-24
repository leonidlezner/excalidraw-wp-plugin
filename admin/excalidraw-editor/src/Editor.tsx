import { Excalidraw } from "@excalidraw/excalidraw";

function Editor() {
  return (
    <>
      <div className="excalidraw-outer-toolbar">
        <h1>Editor title</h1>
        <div className="toolbar">
          <div>
            <span className="spinner is-active"></span>
          </div>
          <div>
            <button className="button button-primary">Save</button>
          </div>
          <div>
            <button className="button button-secondary">Close</button>
          </div>
        </div>
      </div>
      <div className="excalidraw-container">
        <Excalidraw />
      </div>
    </>
  );
}

export default Editor;
