document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["paragraphsPerChunk"], (result) => {
    if (result.paragraphsPerChunk) {
      document.getElementById("paragraphsPerChunk").value =
        result.paragraphsPerChunk;
    }
  });
});

document.getElementById("submitBtn").addEventListener("click", () => {
  const inputText = document.getElementById("inputText").value;
  const paragraphsPerChunk = parseInt(
    document.getElementById("paragraphsPerChunk").value,
    10
  );

  // Save the input values
  chrome.storage.local.set({ paragraphsPerChunk });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: (text, paragraphs) => {
        let _text = text;
        (() => {
          function chunk(array, size) {
            if (!Array.isArray(array)) {
              throw new TypeError("Input should be an array");
            }
            if (typeof size !== "number" || size <= 0) {
              throw new TypeError("Size should be a positive number");
            }

            const result = [];
            for (let i = 0; i < array.length; i += size) {
              result.push(array.slice(i, i + size));
            }
            return result;
          }

          function splitText(text) {
            const textArray = text.split("\n").map((text) => `<p>${text}</p>`);
            const textChunks = chunk(textArray, paragraphs);
            return textChunks;

            // let chunk = "";
            // let chunkCounter = 0;
            // textArray.forEach((text) => {
            //   if (chunkCounter < paragraphs) {
            //     chunk += `<p>${text}</p>`;
            //     chunkCounter++;
            //   } else {
            //     textChunks.push(chunk);
            //     chunk = "";
            //     chunkCounter = 0;
            //   }
            // });
            // textChunks.push(chunk);
            // return textChunks;
          }

          async function wait(time) {
            return new Promise((resolve) => {
              setTimeout(resolve, time);
            });
          }

          function removeFirstMatchText(text, match) {
            const index = text.indexOf(match);
            if (index === -1) return text;
            return text.slice(0, index) + text.slice(index + match.length);
          }

          async function submitText(text) {
            console.log(text);
            if (!text) return;

            const chunks = splitText(text);

            const editableDiv = document.querySelector(
              'div[contenteditable="true"].ProseMirror#prompt-textarea'
            );
            if (editableDiv) {
              for (const chunk of chunks) {
                editableDiv.innerHTML = `<p>just respond me "OK"</p>${chunk.join('')}`;
                editableDiv.focus();

                await wait(100);

                document
                  const sendButton = document.querySelector('button[data-testid="send-button"]');
                  while (sendButton.disabled) {
                    await wait(100);
                  }
                  sendButton.click();

                await wait(100);
                while(document.querySelector('button[data-testid="stop-button"]')) {
                  await wait(100);
                }
              }
            }
          }

          submitText(text);
        })();
      },
      args: [inputText, paragraphsPerChunk],
    });
  });
});
