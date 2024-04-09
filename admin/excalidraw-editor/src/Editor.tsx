import {
  Excalidraw,
  serializeAsJSON,
  exportToSvg,
  useHandleLibrary,
  getSceneVersion,
  exportToCanvas,
} from "@excalidraw/excalidraw";

import {
  ExcalidrawImperativeAPI,
  LibraryItems,
} from "@excalidraw/excalidraw/types/types";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import useStorageState from "./hooks/useStorageState";
import { useCallbackRefState } from "./hooks/useCallbackRefState";
import axios from "axios";

import { useTranslation } from "react-i18next";

export type EditorDataSet = {
  docTitle: string;
  docSource: string;
  docFiles: string;
  docId: string;
  apiUrl: string;
  nonce: string;
  docUrl: string;
  closeUrl: string;
  lang: string;
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

  const { t } = useTranslation();

  const saveDocument = (successCallback: Function | undefined = undefined) => {
    if (!excalidrawAPI) {
      return;
    }

    const _save = async () => {
      try {
        const elements = excalidrawAPI.getSceneElements();
        const appState = excalidrawAPI.getAppState();
        const files = excalidrawAPI.getFiles();

        const jsonData = serializeAsJSON(elements, appState, files, "database");

        const svgConfig = {
          elements: elements,
          appState: { ...appState, exportBackground: false },
          files: files,
        };

        const svg = await exportToSvg(svgConfig);

        svgConfig.appState.exportWithDarkMode = true;
        const svg_dark = await exportToSvg(svgConfig);

        const thumbnail = await exportToCanvas({
          elements: elements,
          appState: { ...appState, exportBackground: false },
          files: files,
          maxWidthOrHeight: 200,
        });

        var s = new XMLSerializer();

        const response = await axios.post<BackendResponse>(
          decodeURIComponent(dataSet.apiUrl),
          {
            docId: dataSet.docId,
            source: jsonData,
            files: JSON.stringify(excalidrawAPI.getFiles()),
            full: s.serializeToString(svg),
            full_dark: s.serializeToString(svg_dark),
            thumbnail: thumbnail.toDataURL(),
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

        if (successCallback) {
          successCallback();
        }
      } catch (error) {
        alert(t("Error occured during saving") + " :" + error);
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
    if (!excalidrawAPI) {
      return;
    }

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

      excalidrawAPI.scrollToContent();

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
          t(
            "Local unsaved version of this document was found. Load the local version?"
          )
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

          excalidrawAPI.scrollToContent();

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
      (
        document.getElementsByClassName("excalidraw")[0] as HTMLElement
      )?.focus();

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

  const onClose = () => {
    if (window.opener) {
      window.close();
    } else {
      window.location.href = dataSet.closeUrl;
    }
  };

  const onSaveAndCloseDocument = () => {
    saveDocument(() => {
      onClose();
    });
  };

  const onSaveDocument = () => {
    saveDocument();
  };

  return (
    <div>
      <div className="excalidraw-outer-toolbar">
        <div className="title">
          <input name="docTitle" value={docTitle} onChange={onInputUpdate} />
        </div>

        <div className={"toolbar" + (isDirty ? " dirty" : "")}>
          <div>{isSaving && <span className="spinner is-active"></span>}</div>
          <div>
            <button
              className="button button-primary save-button"
              onClick={onSaveDocument}
              disabled={isSaving}
            >
              {t("Save")}
            </button>
          </div>
          <div>
            <button
              className="button button-primary save-button"
              onClick={onSaveAndCloseDocument}
              disabled={isSaving}
            >
              {t("Save and Close")}
            </button>
          </div>
          <div>
            <button
              className="button button-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </div>

      <div className="excalidraw-outer-container">
        <Excalidraw
          name={dataSet.docId}
          excalidrawAPI={excalidrawRefCallback}
          initialData={{
            libraryItems: currentLibrary,
          }}
          onLibraryChange={onLibChange}
          libraryReturnUrl={dataSet.docUrl}
          autoFocus={true}
          langCode={dataSet.lang}
        />
      </div>
    </div>
  );
}

export default Editor;
