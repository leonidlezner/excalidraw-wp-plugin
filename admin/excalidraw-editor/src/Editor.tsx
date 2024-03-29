import {
  Excalidraw,
  serializeAsJSON,
  //restoreAppState,
  //restoreElements,
  exportToSvg,
  useHandleLibrary,
  getSceneVersion,
} from "@excalidraw/excalidraw";

import {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  LibraryItems,
  //UIAppState,
} from "@excalidraw/excalidraw/types/types";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import useStorageState from "./hooks/useStorageState";
import { useCallbackRefState } from "./hooks/useCallbackRefState";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import axios from "axios";

type SceneData = {
  elements: readonly ExcalidrawElement[];
  appState: Partial<AppState>;
  files: BinaryFiles;
};

export type EditorDataSet = {
  docTitle: string;
  docSource: string;
  docId: string;
  apiUrl: string;
  nonce: string;
  docUrl: string;
};

interface BackendRedirect {
  redirect: string;
}

interface BackendResponse {
  success: boolean | undefined;
  data: BackendRedirect | string | undefined;
}

function Editor(dataSet: EditorDataSet) {
  const [excalidrawAPI, excalidrawRefCallback] =
    useCallbackRefState<ExcalidrawImperativeAPI>();

  const [currentLibrary, setCurrentLibrary] =
    useStorageState<LibraryItems | null>(null, "currentLibrary", true);

  const lastSavedVersion = useRef<number>(0);

  const uiSaveButtonRef = useRef<HTMLButtonElement>(null);
  const uiCloseButtonRef = useRef<HTMLButtonElement>(null);
  const uiSpinnerRef = useRef<HTMLElement>(null);

  const [docTitle, setDocTitle] = useState<string>(dataSet.docTitle);

  const [isDirty, setIsDirty] = useState<boolean>(false);

  const [currentScene, setCurrentScene, deleteCurrentScene] =
    useStorageState<SceneData>(
      {
        elements: [],
        appState: {},
        files: {},
      } as SceneData,
      "currentScene-" + dataSet.docId,
      true,
      (value: SceneData) => {
        return serializeAsJSON(
          value.elements,
          value.appState,
          value.files,
          "local"
        );
      }
    );

  const activateDocUI = (activate: boolean) => {
    if (uiSaveButtonRef.current) {
      uiSaveButtonRef.current.disabled = !activate;
    }

    if (uiCloseButtonRef.current) {
      uiCloseButtonRef.current.disabled = !activate;
    }

    if (uiSpinnerRef.current) {
      uiSpinnerRef.current.className =
        "spinner" + (!activate ? " is-active" : "");
    }
  };

  const saveDocument = () => {
    if (!excalidrawAPI) {
      return;
    }

    const _save = async () => {
      try {
        const elements = excalidrawAPI.getSceneElements();
        const appState = excalidrawAPI.getAppState();
        const files = excalidrawAPI.getFiles();

        const jsonData = serializeAsJSON(elements, appState, files, "database");

        const svg = await exportToSvg({
          elements: elements,
          appState: appState,
          files: files,
        });

        var s = new XMLSerializer();

        const response = await axios.post<BackendResponse>(
          decodeURIComponent(dataSet.apiUrl),
          {
            docId: dataSet.docId,
            source: jsonData,
            full: s.serializeToString(svg),
            thumbnail: "abc",
            title: docTitle,
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

        // For debugging purposes
        // await new Promise((resolve) => setTimeout(resolve, 1000));

        // TODO: Store the attached files...
        console.log(excalidrawAPI.getFiles());

        if (response.data.success === undefined) {
          throw "Wrong data retured from server.";
        }

        if (response.data.success === false) {
          throw response.data.data;
        }

        lastSavedVersion.current = getVersion();
        setIsDirty(false);
        deleteCurrentScene();

        // After saving a new document the server will send an URL to redirect the client
        if (typeof response.data.data === "object") {
          window.location.href = response.data.data.redirect;
        }
      } catch (error) {
        alert("Error occured during saving: " + error);
      }

      activateDocUI(true);
    };

    activateDocUI(false);
    _save();
  };

  const onLibChange = (items: LibraryItems) => {
    setCurrentLibrary(items);
  };

  const getVersion = () => {
    if (!excalidrawAPI) {
      return 0;
    }

    const elements = excalidrawAPI.getSceneElements();

    if (elements.length < 1) {
      return 0;
    }

    return getSceneVersion(elements);
  };

  useEffect(() => {
    if (!excalidrawAPI) {
      return;
    }

    activateDocUI(true);

    let loadFromServer = true;

    if (currentScene?.elements?.length > 0) {
      if (
        window.confirm(
          "Local unsaved version of this document was found. Load the local version?"
        )
      ) {
        loadFromServer = false;
        excalidrawAPI.updateScene(currentScene);
      }
    }

    if (loadFromServer) {
      if (dataSet.docSource) {
        try {
          const sceneFromServer = JSON.parse(dataSet.docSource);
          excalidrawAPI.updateScene(sceneFromServer);
          lastSavedVersion.current = getVersion();
          setIsDirty(false);
        } catch (error) {}
      }
    }

    const unloadHandler = (event: BeforeUnloadEvent) => {
      if (getVersion() != lastSavedVersion.current) {
        setCurrentScene({
          elements: excalidrawAPI.getSceneElements(),
          appState: excalidrawAPI.getAppState(),
          files: excalidrawAPI.getFiles(),
        });

        event?.preventDefault();
      }
    };

    const onCheckVersion = () => {
      const version = getVersion();

      if (version != lastSavedVersion.current) {
        setIsDirty(true);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      /* if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        saveDocument();
      } */
    };

    window.addEventListener("beforeunload", unloadHandler);

    window.addEventListener("keydown", handleKeyDown);

    const onCheckVersionTimer = setInterval(onCheckVersion, 1000);

    return () => {
      clearInterval(onCheckVersionTimer);
      window.removeEventListener("beforeunload", unloadHandler);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [excalidrawAPI]);

  useHandleLibrary({ excalidrawAPI });

  const onInputUpdate = (input: ChangeEvent<HTMLInputElement>) => {
    if (input.target.name == "docTitle") {
      setDocTitle(input.target.value);
    }
  };

  return (
    <div>
      <div className="excalidraw-outer-toolbar">
        <div className="">
          <input
            name="docTitle"
            value={docTitle}
            className=""
            onChange={onInputUpdate}
          />
        </div>

        <div className="toolbar">
          <div>
            <span className="spinner" ref={uiSpinnerRef}></span>
          </div>
          <div>
            <button
              className="button button-primary"
              onClick={saveDocument}
              ref={uiSaveButtonRef}
            >
              Save{isDirty ? "*" : ""}
            </button>
          </div>
          <div>
            <button className="button button-secondary" ref={uiCloseButtonRef}>
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="excalidraw-container">
        <Excalidraw
          name={dataSet.docId}
          excalidrawAPI={excalidrawRefCallback}
          initialData={{
            libraryItems: currentLibrary,
          }}
          onLibraryChange={onLibChange}
          libraryReturnUrl={dataSet.docUrl}
        />
      </div>
    </div>
  );
}

export default Editor;
