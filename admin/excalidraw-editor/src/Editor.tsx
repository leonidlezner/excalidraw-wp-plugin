import {
  Excalidraw,
  serializeAsJSON,
  exportToSvg,
  useHandleLibrary,
  getSceneVersion,
} from "@excalidraw/excalidraw";

import {
  ExcalidrawImperativeAPI,
  LibraryItems,
} from "@excalidraw/excalidraw/types/types";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import useStorageState from "./hooks/useStorageState";
import { useCallbackRefState } from "./hooks/useCallbackRefState";
import axios from "axios";

export type EditorDataSet = {
  docTitle: string;
  docSource: string;
  docFiles: string;
  docId: string;
  apiUrl: string;
  nonce: string;
  docUrl: string;
};

interface BackendResponseData {
  redirect: string | undefined;
  timeUpdated: string;
}

interface BackendResponse {
  success: boolean | undefined;
  data: BackendResponseData | string | undefined;
}

function Editor(dataSet: EditorDataSet) {
  const [excalidrawAPI, excalidrawRefCallback] =
    useCallbackRefState<ExcalidrawImperativeAPI>();

  const [currentLibrary, setCurrentLibrary] =
    useStorageState<LibraryItems | null>(null, "currentLibrary", true);

  const lastSavedVersion = useRef<number>(0);

  const lastLocalScene = useRef<string | null>(null);

  const [docTitle, setDocTitle] = useState<string>(dataSet.docTitle);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);

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
            files: JSON.stringify(excalidrawAPI.getFiles()),
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

        if (response.data.success === undefined) {
          throw "Wrong data retured from server.";
        }

        if (response.data.success === false) {
          throw response.data.data;
        }

        saveToLocalStorage();

        lastSavedVersion.current = getVersion();

        setIsDirty(false);

        if (typeof response.data.data === "object") {
          if (response.data.data.timeUpdated) {
            window.localStorage.setItem(
              `lastSaved-${dataSet.docId}`,
              response.data.data.timeUpdated
            );
          }

          // After saving a new document the server will send an URL to redirect the client
          if (response.data.data.redirect) {
            window.location.href = response.data.data.redirect;
          }
        }
      } catch (error) {
        alert("Error occured during saving: " + error);
      }

      setIsSaving(false);
    };

    setIsSaving(true);
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

  const saveToLocalStorage = () => {
    if (!excalidrawAPI) {
      return;
    }

    if (getVersion() === lastSavedVersion.current) {
      return;
    }

    const jsonData = serializeAsJSON(
      excalidrawAPI.getSceneElements(),
      excalidrawAPI.getAppState(),
      excalidrawAPI.getFiles(),
      "local"
    );

    window.localStorage.setItem(`currentScene-${dataSet.docId}`, jsonData);

    window.localStorage.removeItem(`lastSaved-${dataSet.docId}`);
  };

  const isInLocalStorage = () => {
    const lastSaved = window.localStorage.getItem(`lastSaved-${dataSet.docId}`);

    return (
      window.localStorage.getItem(`currentScene-${dataSet.docId}`) !== null &&
      lastSaved === null
    );
  };

  const loadFromLocalStorage = () => {
    const jsonData = window.localStorage.getItem(
      `currentScene-${dataSet.docId}`
    );

    const lastSaved = window.localStorage.getItem(`lastSaved-${dataSet.docId}`);

    if (jsonData && excalidrawAPI && lastLocalScene.current !== jsonData) {
      const scene = JSON.parse(jsonData);

      excalidrawAPI.updateScene(scene);

      excalidrawAPI.addFiles(
        Object.keys(scene.files).map((key) => scene.files[key])
      );

      if (lastSaved) {
        lastSavedVersion.current = getVersion();
      }
    }

    lastLocalScene.current = jsonData;
  };

  const removeFromLocalStorage = () => {
    window.localStorage.removeItem(`currentScene-${dataSet.docId}`);
  };

  useEffect(() => {
    if (!excalidrawAPI) {
      return;
    }

    let loadFromServer = true;

    if (isInLocalStorage()) {
      if (
        window.confirm(
          "Local unsaved version of this document was found. Load the local version?"
        )
      ) {
        loadFromServer = false;
        loadFromLocalStorage();
      }
    }

    if (loadFromServer) {
      removeFromLocalStorage();

      if (dataSet.docSource) {
        try {
          const sceneFromServer = JSON.parse(dataSet.docSource);
          const docFiles = JSON.parse(dataSet.docFiles);

          excalidrawAPI.updateScene(sceneFromServer);

          excalidrawAPI.addFiles(
            Object.keys(docFiles).map((key) => docFiles[key])
          );

          lastSavedVersion.current = getVersion();
          setIsDirty(false);
        } catch (error) {
          console.error(error);
        }
      }
    }

    const unloadHandler = (event: BeforeUnloadEvent) => {
      if (getVersion() != lastSavedVersion.current) {
        saveToLocalStorage();
        event?.preventDefault();
      }
    };

    const onCheckVersion = () => {
      const version = getVersion();

      if (version != lastSavedVersion.current) {
        setIsDirty(true);
      } else {
        setIsDirty(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        saveDocument();
      }
    };

    const handleWindowFocus = () => {
      setTimeout(() => {
        loadFromLocalStorage();
      }, 500);
    };

    const handleWindowBlur = () => {
      saveToLocalStorage();
    };

    window.addEventListener("beforeunload", unloadHandler);

    window.addEventListener("keydown", handleKeyDown);

    window.addEventListener("focus", handleWindowFocus);

    window.addEventListener("blur", handleWindowBlur);

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
          <div>Doc ID: {dataSet.docId}</div>
        </div>

        <div className="toolbar">
          <div>{isSaving && <span className="spinner is-active"></span>}</div>
          <div>
            <button
              className="button button-primary save-button"
              onClick={saveDocument}
              disabled={isSaving}
            >
              Save{isDirty ? "*" : ""}
            </button>
          </div>
          <div>
            <button
              className="button button-secondary"
              /* ref={uiCloseButtonRef} */ disabled={isSaving}
            >
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