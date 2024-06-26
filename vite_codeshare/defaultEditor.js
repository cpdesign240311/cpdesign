/* yorkie, codemirror */
import yorkie from 'yorkie-js-sdk';
const editorParentElem = document.getElementById('editor'); //편집기
const editable = document.getElementById("writable").value=="True"?true:false

//default Editor
async function defaultEditor(docName){
  const client = new yorkie.Client('https://api.yorkie.dev', {
    apiKey: 'co9mlo86su491t49m92g', //your YorkieAPI key
  });
  await client.activate();

  const doc = new yorkie.Document(docName);
  await client.attach(doc);

  doc.update((root)=>{
    if(root.content){
      editor.innerHTML = root.content;
    }else{
      root.content = "";
    }
  });

  //편집속성
  editorParentElem.contentEditable=editable;

  //client -> yorkie
  editorParentElem.addEventListener('input',(event)=>{
    doc.update((root)=>{
      root.content = editor.innerHTML;
    })
  });

  //yorkie -> client
  doc.subscribe((event)=>{
    if(event.type === 'remote-change'){
      editorParentElem.innerHTML = doc.getRoot().content;
    }
  });
}

let doc_name = document.getElementById("doc_name").value;
defaultEditor(doc_name);