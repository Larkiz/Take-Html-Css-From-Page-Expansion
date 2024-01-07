const takeActivate = document.getElementById("activate");

if (takeActivate) {
  takeActivate.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },

      function: tst,
    });
  });
}

function tst() {
  document.addEventListener("mouseover", handle);
}

function handle(e) {
  console.log(123);

  let styles = window.getComputedStyle(e.target);
  let outline = styles.getPropertyValue("outline");

  e.target.style = `outline: 1px solid blue`;

  e.target.addEventListener("mouseout", (e) => {
    e.target.style = `outline: ${outline}`;
  });

  document.addEventListener("click", handleClick);
}

function handleClick(e) {
  e.stopPropagation();
  e.preventDefault();
  console.log(123);
  const mainClasses = e.target.classList;
  let styles = { element: e.target.outerHTML };

  for (let index = 0; index < mainClasses.length; index++) {
    const elementClass = mainClasses[index];
    styles[elementClass] = getStylesForClass(elementClass);
  }

  const childElements = e.target.children;

  for (let index = 0; index < childElements.length; index++) {
    const elementClass = childElements[index].classList;

    for (let index = 0; index < elementClass.length; index++) {
      const classChild = elementClass[index];
      styles[classChild] = getStylesForClass(classChild);
    }
  }
  console.log(styles);
  addElement(JSON.stringify(styles));

  document.removeEventListener("mouseover", handle);
  document.removeEventListener("click", handleClick);
}
function getStylesForClass(className) {
  const styles = {};

  // Перебираем таблицы стилей
  for (let i = 0; i < document.styleSheets.length; i++) {
    const styleSheet = document.styleSheets[i];

    try {
      // Перебираем правила CSS в таблице стилей
      const cssRules = styleSheet.cssRules || styleSheet.rules;
      for (let j = 0; j < cssRules.length; j++) {
        const rule = cssRules[j];

        // Проверяем, соответствует ли класс переданному имени класса
        if (
          rule.selectorText &&
          rule.selectorText
            .split(",")
            .some((selector) => selector.trim() === `.${className}`)
        ) {
          for (let k = 0; k < rule.style.length; k++) {
            const property = rule.style[k];

            const value = rule.style.getPropertyValue(property);
            styles[property] = value; // Сохраняем стили класса в объект
          }
        }
      }
    } catch (e) {
      continue;
    }
  }

  return styles;
}
function addElement(styles) {
  let newDiv = document.createElement("div");

  newDiv.id = "getStyleExt";
  newDiv.className = "styles-list";
  styles = JSON.parse(styles);

  newDiv.insertAdjacentHTML("afterbegin", `<xmp>${styles.element}</xmp>`);
  newDiv.insertAdjacentHTML("afterbegin", `${styles.element}`);
  newDiv.insertAdjacentHTML("afterbegin", "<h2>HTML</h2>");

  let classesList = document.createElement("ul");

  classesList.className = "classes-list";

  for (const key in styles) {
    if (key !== "element") {
      let classList = document.createElement("ul");
      for (const property in styles[key]) {
        classList.insertAdjacentHTML(
          "afterbegin",
          `<li>&nbsp;&nbsp;&nbsp;${
            property + ":" + "" + styles[key][property]
          };</li>`
        );
      }

      classesList.insertAdjacentHTML(
        "afterbegin",
        `<div>.${key}{${classList.outerHTML}}</div>`
      );
    }
  }
  newDiv.insertAdjacentElement("afterbegin", classesList);
  newDiv.insertAdjacentHTML("afterbegin", "<h2>CSS</h2>");

  document.body.appendChild(newDiv);

  let closeBtn = document.createElement("button");
  closeBtn.innerHTML = "close";
  closeBtn.id = "close";
  closeBtn.className = "close-btn";

  newDiv.appendChild(closeBtn);
  document.getElementById("close").addEventListener("click", () => {
    newDiv.remove();
  });
}
