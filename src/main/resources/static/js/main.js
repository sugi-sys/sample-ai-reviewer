"use strict";

// インポート
import { editorModuleReady, editorModule } from './editor.js';

//DOM要素関連の宣言
/**
 * 出力系要素を保持するオブジェクト
 */
const styleDOMElements = {
    loading: document.getElementById('loading'),
    generateMenu: document.getElementById('generateMenu'),
    output: document.getElementById('output'),
    review: document.getElementById('review'),
    reviewLoading: document.getElementById('reviewLoading'),
    reviewOutput: document.getElementById('reviewOutput'),
    bodyColor: document.getElementById('body-color'),
    navColor: document.getElementById('nav-color'),
};

/**
 * 入力系要素を保持するオブジェクト
 */
const inputDOMElements = {
    generate: document.getElementById('generate'),
    submit: document.getElementById('submit'),
    color: document.getElementById('color'),
    theme1: document.getElementById('theme-1'),
    theme2: document.getElementById('theme-2'),
};

/**
 * AIとの応答履歴を保存するオブジェクト
 * @property {number} theme1 - 出題テーマ1のindex値
 * @property {number} theme2 - 出題テーマ2のindex値
 * @property {string} content - 生成された問題文
 * @property {string} user - ユーザーが回答したコード
 */
const talkHistory = {
    theme1: null,
    theme2: null,
    content: null,
    user: null
};

// CSRF関連の宣言
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');

// 初期表示されるテキスト定数の宣言
const defaultText = 
`public class ExampleTest {
    @Test
    void testExample() {
        assertEquals(1, 1);
    }
}`;

// ページの色を管理するためのBoolean（false = ダーク） 
let colorBool = false;

/*
 * 初期ローディング
 * エディターモジュールのPromiseが解決するまでawait
 */
(async function () {
    await editorModuleReady;

    editorModule.createEditor('vs-dark', defaultText);
    styleDOMElements.generateMenu.setAttribute('style', 'display:show');
    styleDOMElements.loading.setAttribute('style', 'display:none');
    styleDOMElements.reviewLoading.setAttribute('style', 'display:none');
    styleDOMElements.review.setAttribute('style', 'display:none');
})(); 

/*
 * 「問題生成」ボタンのイベントリスナー
 */
inputDOMElements.generate.addEventListener('click', () => {
    styleDOMElements.generateMenu.setAttribute('style', 'display:none');
    styleDOMElements.loading.setAttribute('style', 'display:show');
    generate('/api/generate');
});

/*
 * 「回答」ボタンのイベントリスナー
 */
inputDOMElements.submit.addEventListener('click', () => {
    const submitData = editorModule.editor.getValue();
    console.log(submitData);
    talkHistory.user = submitData;
    
    styleDOMElements.review.setAttribute('style', 'display:show');
    styleDOMElements.reviewLoading.setAttribute('style', 'display:show');
    submit('/api/submit');
});

/*
 * 「色変更」ボタンのイベントリスナー
 */
inputDOMElements.color.addEventListener('click', () => {
    if (colorBool === false) {
        const data = editorModule.editor.getValue();
        editorModule.changeEditorColor(colorBool, data);
        styleDOMElements.bodyColor.setAttribute('data-bs-theme', '');
        styleDOMElements.navColor.setAttribute('class', 'navbar bg-body-tertiary')
        colorBool = true;
    } else {
        const data = editorModule.editor.getValue();
        editorModule.changeEditorColor(colorBool, data);
        styleDOMElements.bodyColor.setAttribute('data-bs-theme', 'dark');
        styleDOMElements.navColor.setAttribute('class', 'navbar navbar-dark bg-body-tertiary');
        colorBool = false;
    }
})

/**
 * 問題を生成するAPIコール関数
 * @param {string} url - 問題出題用のAPIエンドポイント
 */
const generate = async function (url) {
    try {
        const response = await fetch(url, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify({
                'theme1': inputDOMElements.theme1.value,
                'theme2': inputDOMElements.theme2.value
            })
        });

        const json = await response.json();

        styleDOMElements.loading.setAttribute('style', 'display:none');

        console.log(json);

        talkHistory.theme1 = (json.theme1);
        talkHistory.theme2 = (json.theme2);
        talkHistory.content = (json.assistant);
        
        const generation = marked.parse(json.content);
        styleDOMElements.output.innerHTML = generation;
        hljs.highlightAll();
    } catch (error) {
        console.error('Generate error', error);
        styleDOMElements.loading.setAttribute('style', 'display:none');
        styleDOMElements.output.innerHTML = '<p>エラーが発生しました。<br>更新して、再度「クイズを生成する」ボタンをクリックしてください。</p>'
        return;
    }
};

/**
 * 回答を提出するAPIコール関数
 * @param {string} url - 回答提出用のAPIエンドポイント
 */
const submit = async function (url) {
    try {
        const response = await fetch(url, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(talkHistory)
        });

        const json = await response.json();

        styleDOMElements.reviewLoading.setAttribute('style', 'display:none');

        console.log(json);
        const generation = marked.parse(json.content);
        styleDOMElements.reviewOutput.innerHTML = generation;
        hljs.highlightAll();
    } catch (error) {
        console.error('Generate error', error);
        return;
    }
};