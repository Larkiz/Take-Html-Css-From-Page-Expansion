document.getElementById("activate").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },

    function: tst,
  });
});

function tst() {
  function handleClick(e) {
    e.stopPropagation();
    e.preventDefault();
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

    return () => e.target.removeEventListener("click", handleClick);
  }

  function handle(e) {
    if (e.target.id !== "getStyleExt") {
      let styles = window.getComputedStyle(e.target);
      let outline = styles.getPropertyValue("outline");

      e.target.style = `outline: 1px solid blue`;

      e.target.addEventListener("mouseout", (e) => {
        e.target.style = `outline: ${outline}`;
      });

      e.target.addEventListener("click", handleClick);
    }
    return () => document.removeEventListener("mouseover", handle);
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
    let classesList = document.createElement("ul");

    for (const key in styles) {
      if (key !== "element") {
        let classList = document.createElement("ul");
        for (const property in styles[key]) {
          classList.insertAdjacentHTML(
            "afterbegin",
            `<li>${property + ":" + "" + styles[key][property]};</li>`
          );
        }

        classesList.insertAdjacentHTML(
          "afterbegin",
          `<div>.${key}{${classList.outerHTML}}</div>`
        );
      }
    }

    newDiv.insertAdjacentElement("afterbegin", classesList);
    // newDiv.style =
    //   "position:fixed;z-index:9999; top:0; left:0; background-color: white;width:600px;height:600px;overflow-y:scroll;color:black;";
    document.body.appendChild(newDiv);
  }
  document.addEventListener("mouseover", handle);
}
