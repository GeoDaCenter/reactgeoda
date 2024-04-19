import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {editor} from 'monaco-editor';
import MonacoEditor, {Monaco, OnChange} from '@monaco-editor/react';

/**
 * Create Monaco suggestions from table column names
 * ref: https://codesandbox.io/p/sandbox/monaco-sql-sfot6x
 */
function createMonacoSuggestions(
  columnNames: string[]
): Array<{label: string; insertText: string}> {
  return columnNames.map(columnName => {
    return {
      label: columnName,
      insertText: columnName
    };
  });
}

export type SQLEditorProps = {
  suggestKeys: string[];
  onChange: OnChange;
  initContent?: string;
  theme?: string;
  language?: string;
  height?: number;
};

export type SQLEditorRefProps = {
  insertText: (text: string) => void;
};

export const SQLEditor = forwardRef<SQLEditorRefProps, SQLEditorProps>(
  ({initContent, onChange, theme, suggestKeys, language, height}, ref) => {
    const [content, setContent] = useState(initContent || '');
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    useImperativeHandle(ref, () => ({
      insertText(text: string) {
        editorRef.current?.trigger('keyboard', 'type', {text});
      }
    }));

    const onMonacoEditorChange = (
      value: string | undefined,
      ev: editor.IModelContentChangedEvent
    ) => {
      if (value) {
        setContent(value);
      }
      editorRef?.current?.getAction('editor.action.formatDocument')?.run();
      // editorRef.current?.trigger('', 'editor.action.triggerSuggest', {});
      onChange(value, ev);
    };

    // format the code in manaco editor after the component is mounted
    const onEditorMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
      editorRef.current = editor;
      const customSuggestions = createMonacoSuggestions(suggestKeys);
      // register custom language: geoda
      monaco.languages.register({id: 'geoda'});
      // define custom language
      monaco.languages.setMonarchTokensProvider('geoda', {
        keywords: suggestKeys,
        tokenizer: {
          root: [
            // keywords
            [/([a-zA-Z_$][\w$]*)((\s*))?/, {cases: {'$1@keywords': 'keyword'}}],
            // operators
            [/[-+*/]/, 'operator'],
            // brackets
            [/[()]/, 'delimiter']
          ]
        }
      });
      // define custom theme
      monaco.editor.defineTheme('geoda-theme', {
        base: 'vs',
        inherit: true,
        colors: {},
        rules: [
          {token: 'keyword', foreground: '#FF6600', fontStyle: 'bold'},
          {token: 'operator', foreground: '#ff0000'},
          {token: 'delimiter', foreground: '#009966'}
        ]
      });

      // monaco.editor.onDidChangeMarkers(([uri]) => {
      //   const markers = monaco.editor.getModelMarkers({resource: uri});
      //   coderErrors = markers
      //   const err = monaco.editor.getModelMarkers({ resource: editor.getModel()?.uri });
      //   console.log(err);
      //   let markers: editor.IMarkerData[] = [];
      //   if (err) {
      //     markers = [
      //       {
      //         startLineNumber: 1,
      //         startColumn: 1,
      //         endLineNumber: 2,
      //         endColumn: 10,
      //         message: 'error',
      //         severity: monaco.MarkerSeverity.Error
      //       }
      //     ];
      //   }
      //   monaco.editor.setModelMarkers(editor.getModel(), 'owner', markers);
      // });

      // add custom suggestions to monaco editor
      monaco.languages.registerCompletionItemProvider('*', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          };
          const suggestions = customSuggestions.map(suggestion => {
            return {
              label: suggestion.label,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: suggestion.insertText,
              range
            };
          });
          return {
            suggestions
          };
        }
      });
    };

    return (
      <MonacoEditor
        defaultLanguage={language || 'sql'}
        value={content}
        onChange={onMonacoEditorChange}
        onMount={onEditorMount}
        options={{
          minimap: {enabled: false},
          fixedOverflowWidgets: true
        }}
        theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
        height={height || 240}
        width={'100%'}
      />
    );
  }
);

SQLEditor.displayName = 'SQLEditor';
