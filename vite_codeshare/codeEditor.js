/* yorkie, codemirror */
import yorkie from 'yorkie-js-sdk';
import { basicSetup, EditorView } from 'codemirror';
import { keymap } from '@codemirror/view';
import { EditorState, Transaction, Compartment } from '@codemirror/state';

//언어 팩
import {python} from "@codemirror/lang-python";
import {java} from "@codemirror/lang-java";
import {cpp} from "@codemirror/lang-cpp";
import { indentWithTab } from '@codemirror/commands';
import { markdown, markdownKeymap, markdownLanguage } from '@codemirror/lang-markdown';

//Editor 언어 설정 config
const languageConf = new Compartment;
const languageMapper = {"html" : markdown,"c/c++" : cpp, "java" : java, "python" : python };

//언어 목록 Load
const langtypeList = document.getElementById("langtypeList");

//문서 제목
const doc_name = document.getElementById("doc_name").value;
const uneditable = document.getElementById("writable").value == "True" ? false : true

//비활성화
langtypeList.disabled = uneditable;
window.onload = ()=>{
  for(let i=0;i<Object.keys(languageMapper).length;++i){
    let option = document.createElement("option");
    let key = Object.keys(languageMapper)[i];
    option.setAttribute("value",key);
    option.innerText = new String(key).toUpperCase();
    langtypeList.appendChild(option);
  }
};

//편집기
const editorParentElem = document.getElementById('editor'); 

async function codeEditor(docName,uneditable) {
    //yorkie API client
    const client = new yorkie.Client('https://api.yorkie.dev', {
      apiKey: 'co9mlo86su491t49m92g', //your YorkieAPI key
    });
    await client.activate();
  
    //document 생성 후 client -> attach
    const doc = new yorkie.Document(docName);
    await client.attach(doc);
  
    doc.update((root) => {
      if (!root.content) {
        root.content = new yorkie.Text();
      }
      if(!root.langtype){//초기 언어값
        root.langtype = Object.keys(languageMapper)[0]; 
      }
      else{//설정된 언어 정보 불러오기
        let langtype = root.langtype;
        let index=Object.keys(languageMapper).findIndex(function(key){return key==langtype;}); //key index
        langtypeList.selectedIndex=index;
      }
    }, 'create content if not exists');
    
    await client.sync();

    //yorkie에 존재하는 content를 codemirror에 dispatch하는 함수
    //content of yorkie yorkie -> dispatch -> CodeMirror Editor 
    const syncText = () => {
      const text = doc.getRoot().content;
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: text.toString() },
        annotations: [Transaction.remote.of(true)],
      });
    };
  
    //Text의 경우 DB snapshot이 찍힐 때 재동기화 해줘야 한다.
    doc.subscribe((event) => {
      if (event.type === 'snapshot') { 
        syncText();
      }
    });
  
    //yorkie의 content 구독 이벤트
    doc.subscribe('$.content', (event) => {
      if (event.type === 'remote-change') {
        const { operations } = event.value;
        handleOperations(operations);
      }
    });

    //원격지 언어 변경 이벤트
    doc.subscribe((event)=>{
      if (event.type === 'remote-change') {
        //다른 클라이언트의 언어 타입도 변경
        let langtype=doc.getRoot().langtype;
        let index=Object.keys(languageMapper).findIndex(function(key){return key==langtype;}); //key index
        langtypeList.selectedIndex=index;
        setLanguage(editor,langtype);
      }
    });
  
    //codeMirror에서 수정한 내용을 Yorkie로 옮길 때 사용하는 이벤트 처리 핸들러
    //codeMirror To Yorkie handle
    const updateListener = EditorView.updateListener.of((viewUpdate) => {
      if (viewUpdate.docChanged) {
        for (const tr of viewUpdate.transactions) {
          const events = ['select', 'input', 'delete', 'move', 'undo', 'redo'];
          if (!events.map((event) => tr.isUserEvent(event)).some(Boolean)) {
            continue;
          }
          if (tr.annotation(Transaction.remote)) {
            continue;
          }
          let adj = 0;
          tr.changes.iterChanges((fromA, toA, _, __, inserted) => {
            const insertText = inserted.toJSON().join('\n');
            doc.update((root) => {
              root.content.edit(fromA + adj, toA + adj, insertText);
            }, `update content byA ${client.getID()}`);
            adj += insertText.length - (toA - fromA);
          });
        }
      }
    });

    //CodeMirror 환경 설정
    let state = EditorState.create({
      extensions: [
        basicSetup,
        languageConf.of(markdown({ base: markdownLanguage })),
        keymap.of([indentWithTab, markdownKeymap]),
        updateListener,
        EditorState.readOnly.of(uneditable),
      ]
    });
  
    //CodeMirror 편집기 생성
    const editor = new EditorView({
      doc: '',
      state,
      parent: editorParentElem,
    });

    //에디터 언어 설정 변경
    function setLanguage(editor,type){
      let language = languageMapper[type];
      editor.dispatch({ //에디터 설정 변경
        effects : languageConf.reconfigure(language())
      });
    }

    //목록 눌렀을 때 언어 변경 이벤트 등록
    langtypeList.addEventListener('click',()=>{
      let langtype=langtypeList.options[langtypeList.selectedIndex].value;
      setLanguage(editor,langtype);
      doc.update((root) => { //원격지 반영
        root.langtype = langtype;
      }, `update langtype byA ${client.getID()}`);
    });
  
    //Yorkie에서 CodeMirror로 변경 값 보낼 때 사용하는 핸들러
    //Yorkie To CodeMirror Handle
    function handleOperations(operations) {
      operations.forEach((op) => {
        if (op.type === 'edit') {
          handleEditOp(op);
        }
      });
    }
    function handleEditOp(op) { //연산 종류에 따라 수행
      const changes = [
        {
          from: Math.max(0, op.from),
          to: Math.max(0, op.to),
          insert: op.value.content,
        },
      ];
      editor.dispatch({ //변경사항 적용
        changes,
        annotations: [Transaction.remote.of(true)],
      });
    }
    //초기 에디터 언어 설정
    setLanguage(editor,langtypeList.options[langtypeList.selectedIndex].value);
    syncText();
}  
codeEditor(doc_name,uneditable);