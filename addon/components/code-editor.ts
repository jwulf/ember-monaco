import Component from "@ember/component";
import Penpal, { IChildConnectionObject } from "penpal";
import * as mon from "monaco-editor";

export interface CodeEditorKeyCommand {
  cmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  keys: string[];
}

export default class CodeEditor extends Component {
  public code?: string;
  public _lastCode?: string = this.code;
  public language?: string;
  public fontSize?: number;
  public _conn!: IChildConnectionObject<any>;
  public theme: "vs-dark" | "vs-light" = "vs-dark"; // TODO: proper default value
  public onChange?: (v: string) => any;
  public onKeyCommand?: (evt: CodeEditorKeyCommand) => any;
  public onReady?: ({
    editor,
    monaco
  }: {
    editor: mon.editor.IStandaloneCodeEditor;
    monaco: any;
  }) => any;

  public buildEditorOptions(): object {
    const { code, language, theme, fontSize } = this;
    return { value: code, language, theme, fontSize };
  }

  public _onKeyCommand(evt: CodeEditorKeyCommand) {
    this.onKeyCommand && this.onKeyCommand(evt);
  }
  public onEditorTextChanged({ value }: { value: string; event: any }) {
    if (value === this.code) {
      // if our editor is already up to date
      return; // no change
    }
    this.code = this._lastCode = value;
    if (this.onChange) {
      this.onChange(value);
    }
  }

  public onEditorReady() {
    const iframe: any = this.element.querySelector<HTMLIFrameElement>(
      ".frame-container > iframe"
    );
    const editor = (<any>iframe.contentWindow).editor;
    const monaco = (<any>iframe.contentWindow).monaco;
    if (this.onReady) {
      this.onReady({ editor, monaco });
    }
  }

  public didInsertElement() {
    super.didInsertElement();
    const container = this.element.querySelector<HTMLDivElement>(
      ".frame-container"
    );
    if (!container) {
      throw new Error("No frame container found");
    }
    this._conn = Penpal.connectToChild({
      appendTo: container,
      methods: {
        onValueChanged: this.onEditorTextChanged.bind(this),
        keyCommand: this._onKeyCommand.bind(this),
        onReady: this.onEditorReady.bind(this)
      },
      url: "/ember-monaco-magikcraft/frame.html"
    });
    this._conn.promise.then(frameApi => {
      const { code, theme, language, fontSize } = this;
      frameApi.setupEditor({
        language,
        theme,
        value: code,
        fontSize
      });
    });
  }

  public didUpdateAttrs() {
    if (this.code !== this._lastCode) {
      this.updateFrame();
    }
    this._lastCode = this.code;
  }

  public updateFrame() {
    this._conn.promise.then(frameApi => {
      const { code, language } = this;
      frameApi.updateEditor({
        language,
        value: code
      });
    });
  }

  public willDestroyElement() {
    super.willDestroyElement();
    this._conn.destroy();
  }
}

CodeEditor.prototype.classNames = ["monaco-editor"];
