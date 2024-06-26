import yorkie, { DocEventType} from 'yorkie-js-sdk';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import ColorHash from 'color-hash';

import 'quill/dist/quill.snow.css';
import './textEditorStyle.css';

//PDF 변환을 위한 코드
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { pdfExporter } from 'quill-to-pdf';


const colorHash = new ColorHash();

function toDeltaOperation(textValue) {
  const { embed, ...restAttributes } = textValue.attributes ?? {}
  if (embed) {
    return { insert: JSON.parse(embed), attributes: restAttributes }
  }

  return { insert: textValue.content || "", attributes: textValue.attributes }
}

async function textEditor(docName,uneditable) {
  var pdf = document.getElementById('quill2pdf');
  const client = new yorkie.Client('https://api.yorkie.dev', { 
    apiKey: 'API_KEY_INPUT', //공용으로 만든 api key 사용합니다.
  });
  await client.activate();

  const doc = new yorkie.Document(docName, {
    enableDevtools: true,
  });

  // 이부분부터 updateAllCursors() 함수까지는 커서 따라가는 부분인데 나중에 db에서 사용자 이름 받아서 할 수 있는지 테스트 해보고 하겠습니다.
  await client.attach(doc, {
    initialPresence: {
      username: client.getID().slice(-2),
      color: colorHash.hex(client.getID().slice(-2)),
      selection: undefined,
    },
  });

  doc.update((root) => {
    if (!root.content) {
      root.content = new yorkie.Text();
      root.content.edit(0, 0, '\n');
    }
  }, 'create content if not exists');

  doc.subscribe((event) => {
    if (event.type === 'snapshot') {
      syncText();
    }
  });

  doc.subscribe('$.content', (event) => {
    if (event.type === 'remote-change') {
      handleOperations(event.value.operations);
    }
    updateAllCursors();
  });
  doc.subscribe('others', (event) => {
    if (event.type === DocEventType.Unwatched) {
      cursors.removeCursor(event.value.clientID);
    } else if (event.type === DocEventType.PresenceChanged) {
      updateCursor(event.value);
    }
  });

  function updateCursor(user) {
    const { clientID, presence } = user;
    if (clientID === client.getID()) return;
    if (!presence) return;

    const { username, color, selection } = presence;
    if (!selection) return;
    const range = doc.getRoot().content.posRangeToIndexRange(selection);
    cursors.createCursor(clientID, username, color);
    cursors.moveCursor(clientID, {
      index: range[0],
      length: range[1] - range[0],
    });
  }

  function updateAllCursors() {
    for (const user of doc.getPresences()) {
      updateCursor(user);
    }
  }

  await client.sync();

  Quill.register('modules/cursors', QuillCursors);
  const quill = new Quill('#editor', {
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],
        ['image', 'video'],
        ['clean'],
      ],
      cursors: true,
    },
    readOnly : uneditable, 
    theme: 'snow',
  });
  const cursors = quill.getModule('cursors');

  quill
    .on('text-change', (delta, _, source) => {
      if (source === 'api' || !delta.ops) {
        return;
      }

      let from = 0,
        to = 0;
      console.log(`%c quill: ${JSON.stringify(delta.ops)}`, 'color: green');
      for (const op of delta.ops) {
        if (op.attributes !== undefined || op.insert !== undefined) {
          if (op.retain !== undefined) {
            to = from + op.retain;
          }
          console.log(
            `%c local: ${from}-${to}: ${op.insert} ${
              op.attributes ? JSON.stringify(op.attributes) : '{}'
            }`,
            'color: green',
          );

          doc.update((root, presence) => {
            let range;
            if (op.attributes !== undefined && op.insert === undefined) {
              root.content.setStyle(from, to, op.attributes);
            } else if (op.insert !== undefined) {
              if (to < from) {
                to = from;
              }

              if (typeof op.insert === 'object') {
                range = root.content.edit(from, to, ' ', {
                  embed: JSON.stringify(op.insert),
                  ...op.attributes,
                });
              } else {
                range = root.content.edit(from, to, op.insert, op.attributes);
              }
              from = to + op.insert.length;
            }

            range &&
              presence.set({
                selection: root.content.indexRangeToPosRange(range),
              });
          }, `update style by ${client.getID()}`);
        } else if (op.delete !== undefined) {
          to = from + op.delete;
          console.log(`%c local: ${from}-${to}: ''`, 'color: green');

          doc.update((root, presence) => {
            const range = root.content.edit(from, to, '');
            range &&
              presence.set({
                selection: root.content.indexRangeToPosRange(range),
              });
          }, `update content by ${client.getID()}`);
        } else if (op.retain !== undefined) {
          from = to + op.retain;
          to = from;
        }
      }
    })
    .on('selection-change', (range, _, source) => {
      if (!range) {
        return;
      }
      if (source === 'api') {
        const { selection } = doc.getMyPresence();
        if (selection) {
          const [from, to] = doc
            .getRoot()
            .content.posRangeToIndexRange(selection);
          const { index, length } = range;
          if (from === index && to === index + length) {
            return;
          }
        }
      }

      doc.update((root, presence) => {
        presence.set({
          selection: root.content.indexRangeToPosRange([
            range.index,
            range.index + range.length,
          ]),
        });
      }, `update selection by ${client.getID()}`);
    });

  function handleOperations(ops) {
    const deltaOperations = [];
    let prevTo = 0;
    for (const op of ops) {
      if (op.type === 'edit') {
        const from = op.from;
        const to = op.to;
        const retainFrom = from - prevTo;
        const retainTo = to - from;

        const { insert, attributes } = toDeltaOperation(op.value);
        console.log(`%c remote: ${from}-${to}: ${insert}`, 'color: skyblue');

        if (retainFrom) {
          deltaOperations.push({ retain: retainFrom });
        }
        if (retainTo) {
          deltaOperations.push({ delete: retainTo });
        }
        if (insert) {
          const op = { insert };
          if (attributes) {
            op.attributes = attributes;
          }
          deltaOperations.push(op);
        }
        prevTo = to;
      } else if (op.type === 'style') {
        const from = op.from;
        const to = op.to;
        const retainFrom = from - prevTo;
        const retainTo = to - from;
        const { attributes } = toDeltaOperation(op.value);
        console.log(
          `%c remote: ${from}-${to}: ${JSON.stringify(attributes)}`,
          'color: skyblue',
        );

        if (retainFrom) {
          deltaOperations.push({ retain: retainFrom });
        }
        if (attributes) {
          const op = { attributes };
          if (retainTo) {
            op.retain = retainTo;
          }

          deltaOperations.push(op);
        }
        prevTo = to;
      }
    }

    if (deltaOperations.length) {
      console.log(
        `%c to quill: ${JSON.stringify(deltaOperations)}`,
        'color: green',
      );
      const delta = {
        ops: deltaOperations,
      }
      quill.updateContents(delta, 'api');
    }
  }

  function syncText() {
    const text = doc.getRoot().content;

    const delta = {
      ops: text.values().map((val) => toDeltaOperation(val)),
    }
    quill.setContents(delta, 'api');
  }

  //document 문서 내용 반환 옵션 -> gpt window로 내용반환
  window.addEventListener("message",(e)=>{
    if(e.data=="get-content"&&parent.chat_gpt_window)
      initMessage();
      setMsgType("data");
      setMsgData(quill.getText());
      let msg = getMessage();
      parent.chat_gpt_window.postMessage(msg,"*");
  });

  //pdf파일 저장
  const pdfSaveDialog = document.getElementById("save_as_pdf");
  pdf.addEventListener('click', () => {
    pdfSaveDialog.showModal();
  });

  pdfSaveDialog.addEventListener('close', async()=>{
    if (pdfSaveDialog.returnValue === 'confirm') {
      try {
        const quilltext = quill.getContents();
        const pdfBlob = await pdfExporter.generatePdf(quilltext);
        let fileName = document.getElementById("fileName");
        let fileTitle = fileName.value;
        saveAs(pdfBlob, fileTitle + '.pdf');
        fileName.value=""
      } catch (error) {
        console.error('Error exporting to PDF:', error);
        fileName.value=""
      }  
    }
  });
    
  /*
  pdf.addEventListener('click', async () => {
    try {
      const quilltext = quill.getContents();
      const pdfBlob = await pdfExporter.generatePdf(quilltext);
      
      var fileTitle = prompt("파일 이름을 입력하세요") || "notitle";
      saveAs(pdfBlob, fileTitle + '.pdf');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  });
  */
  syncText();
  updateAllCursors();
}

let doc_name = document.getElementById("doc_name").value;
let uneditable = document.getElementById("writable").value == "True" ? false : true
textEditor(doc_name,uneditable);
