import Component from "@ember/component";
import { IChildConnectionObject } from "penpal";
import * as mon from "monaco-editor";
export interface CodeEditorKeyCommand {
    cmd?: boolean;
    shift?: boolean;
    alt?: boolean;
    keys: string[];
}
export default class CodeEditor extends Component {
    code?: string;
    _lastCode?: string;
    language?: string;
    fontSize?: number;
    _conn: IChildConnectionObject<any>;
    theme: "vs-dark" | "vs-light";
    onChange?: (v: string) => any;
    onKeyCommand?: (evt: CodeEditorKeyCommand) => any;
    onReady?: ({ editor, monaco }: {
        editor: mon.editor.IStandaloneCodeEditor;
        monaco: any;
    }) => any;
    buildEditorOptions(): object;
    _onKeyCommand(evt: CodeEditorKeyCommand): void;
    onEditorTextChanged({ value }: {
        value: string;
        event: any;
    }): void;
    onEditorReady(): void;
    didInsertElement(): void;
    didUpdateAttrs(): void;
    updateFrame(): void;
    willDestroyElement(): void;
}
