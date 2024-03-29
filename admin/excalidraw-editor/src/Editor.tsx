import { Excalidraw } from "@excalidraw/excalidraw";

import axios from "axios";

export type EditorDataSet = {
  docTitle: string;
  docId: string;
  apiUrl: string;
  nonce: string;
};

interface BackendResponse {
  success: boolean | undefined;
  data: string | undefined;
}

function Editor(dataSet: EditorDataSet) {
  const saveDocument = () => {
    const _save = async () => {
      try {
        const response = await axios.post<BackendResponse>(
          dataSet.apiUrl,
          {
            docId: dataSet.docId,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            params: {
              action: "excalidraw_save",
              _wpnonce: dataSet.nonce,
            },
          }
        );

        if (response.data.success === undefined) {
          throw "Wrong data retured from server.";
        }

        if (response.data.success === false) {
          throw response.data.data;
        }
      } catch (error) {
        alert("Error occured during saving: " + error);
      }
    };

    _save();
  };

  return (
    <>
      <div className="excalidraw-outer-toolbar">
        <h1>{dataSet.docTitle}</h1>
        <div className="toolbar">
          <div>
            <span className="spinner is-active"></span>
          </div>
          <div>
            <button className="button button-primary" onClick={saveDocument}>
              Save
            </button>
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
