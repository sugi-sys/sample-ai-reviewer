"use strict";
let resolvePromise;

/**
 * 正しくモジュールをインポートさせるためのPromise
 */
export const editorModuleReady = new Promise(function (resolve) {
    resolvePromise = resolve;
});

/**
 * エディター関連の関数、変数をまとめたオブジェクト
 * @property {Object} editor - エディター内の情報を持つ変数
 * @property {function(string, string): void} createEditor - エディターを生成する関数
 * @property {function(boolean, string): void} changeEditorColor - エディターの色を変更する関数
 */
export const editorModule = {
    editor: null,
    createEditor: null,
    changeEditorColor: null
};

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.28.1/min/vs' } });
require(['vs/editor/editor.main'], function () {
    // Register the Java language
    monaco.languages.register({ id: 'java' });

    // Configure the Java language
    monaco.languages.setMonarchTokensProvider('java', {
        keywords: [
            'abstract', 'continue', 'for', 'new', 'switch', 'assert', 'default',
            'goto', 'package', 'synchronized', 'boolean', 'do', 'if', 'private',
            'this', 'break', 'double', 'implements', 'protected', 'throw', 'byte',
            'else', 'import', 'public', 'throws', 'case', 'enum', 'instanceof',
            'return', 'transient', 'catch', 'extends', 'int', 'short', 'try',
            'char', 'final', 'interface', 'static', 'void', 'class', 'finally',
            'long', 'strictfp', 'volatile', 'const', 'float', 'native', 'super', 'while'
        ],
        operators: [
            '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=', '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%', '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=', '%=', '<<=', '>>=', '>>>='
        ],
        symbols: /[=><!~?:&|+\-*\/^%]+/,
        escapes: /\\(?:[abfnrtv\\"'\$\dxuU][0-9A-Fa-f]{0,8}|[0-7]{1,3})/,
        tokenizer: {
            root: [
                [/[a-z_$][\w$]*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
                [/[A-Z][\w\$]*/, 'type.identifier'],
                { include: '@whitespace' },
                [/[{}()\[\]]/, '@brackets'],
                [/[<>](?!@symbols)/, '@brackets'],
                [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }],
                [/\d*\.\d+([eE][\-+]?\d+)?[fFdD]?/, 'number.float'],
                [/\d+[eE][\-+]?\d+[fFdD]?/, 'number.float'],
                [/0[xX][0-9a-fA-F]+[Ll]?/, 'number.hex'],
                [/0[0-7]+[Ll]?/, 'number.octal'],
                [/\d+[fFdD]/, 'number.float'],
                [/\d+[lL]?/, 'number'],
                [/[;,.]/, 'delimiter'],
                [/"([^"\\]|\\.)*$/, 'string.invalid'],
                [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
                [/'[^\\']'/, 'string'],
                [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
                [/'/, 'string.invalid']
            ],
            whitespace: [
                [/[ \t\r\n]+/, ''],
                [/\/\*\*(?!\/)/, 'comment.doc', '@javadoc'],
                [/\/\*/, 'comment', '@comment'],
                [/\/\/.*$/, 'comment']
            ],
            comment: [
                [/[^\/*]+/, 'comment'],
                [/\*\//, 'comment', '@pop'],
                [/[\/*]/, 'comment']
            ],
            javadoc: [
                [/[^\/*]+/, 'comment.doc'],
                [/\*\//, 'comment.doc', '@pop'],
                [/[\/*]/, 'comment.doc']
            ],
            string: [
                [/[^\\"]+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
            ]
        }
    });

    // Define completion item provider
    monaco.languages.registerCompletionItemProvider('java', {
        provideCompletionItems: function () {
            return {
                suggestions: [
                    {
                        label: 'public',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'public'
                    },
                    {
                        label: 'class',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'class'
                    },
                    {
                        label: 'System.out.println',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'System.out.println(${1:object});',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    // アノテーション
                    {
                        label: '@Test',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@Test',
                    },
                    {
                        label: '@BeforeEach',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@BeforeEach',
                    },
                    {
                        label: '@AfterEach',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@AfterEach',
                    },
                    {
                        label: '@BeforeAll',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@BeforeAll',
                    },
                    {
                        label: '@AfterAll',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@AfterAll',
                    },
                    {
                        label: '@DisplayName',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@DisplayName("${1:display name}")',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: '@Disabled',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@Disabled',
                    },
                    {
                        label: '@RepeatedTest',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@RepeatedTest(${1:count})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: '@ParameterizedTest',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@ParameterizedTest',
                    },
                    {
                        label: '@MethodSource',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@MethodSource("${1:methodName}")',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: '@CsvSource',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@CsvSource({"${1:data1, data2, data3}"})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: '@CsvFileSource',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@CsvFileSource(resources = "${1:file.csv}")',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: '@ValueSource',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@ValueSource(${1:type} = ${2:values})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: '@Tag',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@Tag("${1:tag}")',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: '@Nested',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@Nested',
                    },
                    {
                        label: '@TestInstance',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@TestInstance(${1:Lifecycle})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: '@TestMethodOrder',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@TestMethodOrder(${1:OrderAnnotation.class})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: '@Order',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '@Order(${1:order})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    // アサーションメソッド
                    {
                        label: 'assertEquals',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'assertEquals(${1:expected}, ${2:actual})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'assertNotEquals',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'assertNotEquals(${1:unexpected}, ${2:actual})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'assertTrue',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'assertTrue(${1:condition})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'assertFalse',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'assertFalse(${1:condition})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'assertNull',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'assertNull(${1:object})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'assertNotNull',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'assertNotNull(${1:object})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'assertThrows',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'assertThrows(${1:Exception.class}, () -> { ${2:/* code */} })',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'assertAll',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'assertAll(${1:heading}, ${2:() -> { ${3:/* code */} }})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'assertTimeout',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'assertTimeout(${1:Duration.ofMillis(${2:1000})}, () -> { ${3:/* code */} })',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'assertTimeoutPreemptively',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'assertTimeoutPreemptively(${1:Duration.ofMillis(${2:1000})}, () -> { ${3:/* code */} })',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    }
                ]
            };
        }
    });

    // ウィンドウサイズ変更時の挙動
    window.addEventListener('resize', function () {
        editorModule.editor.layout();
    });

    /**
     * モナコエディターを生成します。
     * @param {string} theme - 表示したいカラー
     * @param {string[]} text - 生成するエディターの初期テキスト
     */
    editorModule.createEditor = function (theme, text) {
        editorModule.editor = monaco.editor.create(document.getElementById('container'), {
            value: [
                text
            ].join('\n'),
            language: 'java',
            theme: theme
        });
    }

    /**
     * 現在入力されているテキスト情報を保持したまま、エディターの色を変更します。
     * @param {boolean} bool - 現在表示しているカラー（false = ダーク） 
     * @param {string} text  - 現在入力されているテキスト情報
     */
    editorModule.changeEditorColor = function (bool, text) {
        if (bool === false) {
            this.editor.dispose();
            this.createEditor('vs', text);
        } else {
            this.editor.dispose();
            this.createEditor('vs-dark', text);
        }
    }
    resolvePromise();
});