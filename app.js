const STORAGE_KEY = "chu-dot-cooking-lab-v1";

const PARTS = [
  { id: "spicy-dare", name: "ピリ辛だれ", yieldAmount: "84", yieldUnit: "g" },
  { id: "sesame-dressing", name: "ごまドレッシング", yieldAmount: "120", yieldUnit: "g" },
  { id: "garlic-sauce", name: "にんにくだれ", yieldAmount: "70", yieldUnit: "g" }
];

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

let recipes = loadRecipes();
let editingId = null;
let filter = "all";
let autosaveTimer = null;
let draggedIngredient = null;

function uid() {
  return "lab-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function blankRecipe() {
  return {
    labId: uid(),
    id: "",
    title: "",
    image: "",
    tags: [""],
    servings: "",
    ingredients: [
      {
        type:"ingredient",
        name:"",
        amount:"",
        unit:""
      }
    ],
    steps: [
      {
        text:"",
        links:[]
      }
    ],
    status: "research",
    updatedAt: Date.now()
  };
}

function loadRecipes() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (Array.isArray(data)) {
      return data;
    }

  } catch(e) {}

  return [
    {
      labId: uid(),
      id: "ebi-shio-yakisoba",
      title: "海老塩焼きそば",
      image: "",
      tags: ["麺類","海鮮","ガッツリ"],
      servings: "2",

      ingredients: [
        {
          type:"ingredient",
          name:"中華麺",
          amount:"2",
          unit:"玉"
        },
        {
          type:"ingredient",
          name:"むき海老",
          amount:"120",
          unit:"g"
        },
        {
          type:"ingredient",
          name:"キャベツ",
          amount:"120",
          unit:"g"
        },
        {
          type:"ingredient",
          name:"もやし",
          amount:"100",
          unit:"g"
        },
        {
          type:"ingredient",
          name:"ごま油",
          amount:"10",
          unit:"g"
        },
        {
          type:"ingredient",
          name:"鶏ガラスープの素",
          amount:"5",
          unit:"g"
        },
        {
          type:"ingredient",
          name:"塩",
          amount:"3",
          unit:"g"
        },
        {
          type:"ingredient",
          name:"黒こしょう",
          amount:"少々",
          unit:""
        },
        {
          type:"ingredient",
          name:"にんにく",
          amount:"5",
          unit:"g"
        }
      ],

      steps: [
        {
          text:"フライパンにごま油とにんにくを入れて中火で熱する。",
          links:["ごま油","にんにく"]
        },
        {
          text:"海老を加えて炒め、色が変わったらキャベツともやしを加える。",
          links:["むき海老","キャベツ","もやし"]
        },
        {
          text:"中華麺を加えてほぐしながら炒める。",
          links:["中華麺"]
        },
        {
          text:"鶏ガラスープの素、塩、黒こしょうで味を整える。",
          links:["鶏ガラスープの素","塩","黒こしょう"]
        }
      ],

      status:"research",
      updatedAt:Date.now()
    },

    {
      labId: uid(),
      id: "butakoma-shoga",
      title: "豚こま生姜焼き",
      image:"",
      tags:["肉料理","ごはん"],
      servings:"2",

      ingredients:[
        {
          type:"ingredient",
          name:"豚こま肉",
          amount:"250",
          unit:"g"
        },
        {
          type:"ingredient",
          name:"醤油",
          amount:"20",
          unit:"g"
        },
        {
          type:"ingredient",
          name:"みりん",
          amount:"20",
          unit:"g"
        },
        {
          type:"ingredient",
          name:"しょうが",
          amount:"10",
          unit:"g"
        }
      ],

      steps:[
        {
          text:"豚こま肉を炒め、調味料を加えて煮絡める。",
          links:["豚こま肉","醤油","みりん","しょうが"]
        }
      ],

      status:"complete",
      updatedAt:Date.now()
    }
  ];
}

function saveRecipes() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(recipes)
  );

  $("#saveState").textContent = "保存済み";
}

function getEditing() {
  return recipes.find(
    r => r.labId === editingId
  );
}

function showPage(page) {
  $("#homePage").classList.toggle(
    "is-hidden",
    page !== "home"
  );

  $("#editorPage").classList.toggle(
    "is-hidden",
    page !== "editor"
  );

  window.scrollTo(0,0);
}

function renderHome() {
  const list = $("#recipeList");

  const visible = recipes
    .filter(
      r =>
        filter === "all" ||
        r.status === filter
    )
    .sort(
      (a,b) =>
        (b.updatedAt || 0) -
        (a.updatedAt || 0)
    );

  $("#recipeCount").textContent =
    `${visible.length} RECIPES`;

  list.innerHTML = "";

  if (!visible.length) {

    list.innerHTML = `
      <div class="empty-state">
        <strong>まだレシピがありません。</strong>
        新しいレシピを作ってみよう。
      </div>
    `;

    return;
  }

  visible.forEach((r) => {

    const index =
      recipes.indexOf(r) + 1;

    const card =
      document.createElement("article");

    card.className =
      "recipe-card";

    card.innerHTML = `
      <div class="recipe-number">
        ${String(index).padStart(2,"0")}
      </div>

      <h2>
        ${escapeHtml(
          r.title || "無題のレシピ"
        )}
      </h2>

      <div class="recipe-card-foot">

        <span class="status-badge ${r.status}">
          ${
            r.status === "research"
              ? `<i class="status-dot"></i>研究中`
              : `<span class="status-check">✓</span>完成済`
          }
        </span>

        <span class="card-meta">
          ${
            r.servings
              ? r.servings + "人前"
              : "人数未設定"
          }
        </span>

      </div>
    `;

    card.addEventListener(
      "click",
      () => openEditor(r.labId)
    );

    list.appendChild(card);
  });
}

function openEditor(id) {
  editingId = id;

  const r = getEditing();

  if (!r) return;

  $("#editorHeading").textContent =
    r.title || "NEW RECIPE";

  $("#idInput").value =
    r.id || "";

  $("#titleInput").value =
    r.title || "";

  $("#statusSelect").value =
    r.status || "research";

  renderImage();
  renderTags();
  renderServings();
  renderIngredients();
  renderSteps();
  renderSearchPreview();

  $("#codePanel").classList.add(
    "is-hidden"
  );

  showPage("editor");
}

function newRecipe() {

  const r = blankRecipe();

  recipes.unshift(r);

  saveRecipes();

  openEditor(r.labId);

  $("#idInput").focus();
}

function closeEditor() {

  saveCurrent();

  editingId = null;

  showPage("home");

  renderHome();
}

function saveCurrent() {

  const r = getEditing();

  if (!r) return;

  r.id =
    $("#idInput").value.trim();

  r.title =
    $("#titleInput").value.trim();

  r.status =
    $("#statusSelect").value;

  r.updatedAt =
    Date.now();

  saveRecipes();
}

function scheduleSave() {

  $("#saveState").textContent =
    "保存中…";

  clearTimeout(
    autosaveTimer
  );

  autosaveTimer =
    setTimeout(() => {

      syncCurrentFromDOM();

      saveCurrent();

    }, 500);
}

function syncCurrentFromDOM() {

  const r = getEditing();

  if (!r) return;

  r.id =
    $("#idInput").value.trim();

  r.title =
    $("#titleInput").value.trim();

  r.status =
    $("#statusSelect").value;

  r.tags =
    $$("#tagList input")
      .map(i => i.value.trim());

  r.servings =
    $(".servings-picker button.is-selected")
      ?.dataset.value || "";

  r.ingredients =
    $$("#ingredientList .ingredient-row")
      .map(row => {

        if (
          row.dataset.type === "part"
        ) {

          return {
            type:"part",

            partId:
              row.dataset.partId,

            amount:
              row.querySelector(
                ".part-amount"
              )?.value.trim() || "",

            unit:
              row.querySelector(
                ".part-unit"
              )?.value.trim() || ""
          };
        }

        const inputs =
          row.querySelectorAll("input");

        return {
          type:"ingredient",

          name:
            inputs[0].value.trim(),

          amount:
            inputs[1].value.trim(),

          unit:
            inputs[2].value.trim()
        };
      });

  r.steps =
    $$("#stepList .step-row")
      .map(row => ({
        text:
          row.querySelector(
            "textarea"
          ).value,

        links:
          [
            ...row.querySelectorAll(
              ".linked-chip"
            )
          ]
            .map(
              c => c.dataset.name
            )
      }));

  renderSearchPreview();
}

function renderTags() {

  const r = getEditing();

  const box =
    $("#tagList");

  box.innerHTML = "";

  (
    r.tags?.length
      ? r.tags
      : [""]
  ).forEach((tag, i) => {

    const row =
      document.createElement("div");

    row.className =
      "tag-row";

    row.innerHTML = `
      <input
        value="${escapeAttr(tag)}"
        placeholder="タグを入力"
        aria-label="タグ ${i+1}"
      >

      <button
        class="remove-small"
        type="button"
        aria-label="タグ削除"
      >×</button>
    `;

    row.querySelector("input")
      .addEventListener(
        "input",
        scheduleSave
      );

    row.querySelector(
      ".remove-small"
    ).addEventListener(
      "click",
      () => {

        if (
          $$("#tagList .tag-row")
            .length === 1
        ) {

          row.querySelector(
            "input"
          ).value = "";

        } else {

          row.remove();

        }

        scheduleSave();
      }
    );

    box.appendChild(row);
  });
}

function renderServings() {

  const r = getEditing();

  $$("#servingsPicker button")
    .forEach(b =>
      b.classList.toggle(
        "is-selected",
        b.dataset.value ===
          String(r.servings || "")
      )
    );
}

function renderImage() {

  const r = getEditing();

  const box =
    $("#imageDrop");

  const img =
    $("#imagePreview");

  if (r.image) {

    img.src =
      r.image;

    box.classList.add(
      "has-image"
    );

  } else {

    img.removeAttribute(
      "src"
    );

    box.classList.remove(
      "has-image"
    );
  }
}

function renderIngredients() {

  const r = getEditing();

  const list =
    $("#ingredientList");

  list.innerHTML = "";

  (
    r.ingredients?.length
      ? r.ingredients
      : [
          {
            type:"ingredient",
            name:"",
            amount:"",
            unit:""
          }
        ]
  ).forEach(item => {

    if (
      item.type === "part"
    ) {

      addPartRow(
        item,
        false
      );

    } else {

      addIngredientRow(
        item,
        false
      );
    }
  });
}

function addIngredientRow(
  data={
    name:"",
    amount:"",
    unit:""
  },
  focus=true
) {

  const row =
    document.createElement("div");

  row.className =
    "ingredient-row";

  row.dataset.type =
    "ingredient";

  row.innerHTML = `
    <span
      class="drag-handle"
      title="ドラッグして並び替え"
    >≡</span>

    <input
      placeholder="材料名"
      value="${escapeAttr(
        data.name || ""
      )}"
    >

    <input
      placeholder="分量"
      value="${escapeAttr(
        data.amount || ""
      )}"
    >

    <input
      placeholder="単位"
      value="${escapeAttr(
        data.unit || ""
      )}"
    >

    <button
      class="remove-row"
      type="button"
    >×</button>
  `;

  row.querySelectorAll("input")
    .forEach(i =>
      i.addEventListener(
        "input",
        scheduleSave
      )
    );

  row.querySelector(
    ".remove-row"
  ).addEventListener(
    "click",
    () => {

      row.remove();

      scheduleSave();
    }
  );

  bindDrag(row);

  $("#ingredientList")
    .appendChild(row);

  if (focus) {

    row.querySelector(
      "input"
    ).focus();
  }
}

function addPartRow(
  data={
    partId:PARTS[0].id,
    amount:"",
    unit:""
  },
  save=true
) {

  const part =
    PARTS.find(
      p =>
        p.id === data.partId
    ) || PARTS[0];

  const row =
    document.createElement("div");

  row.className =
    "ingredient-row part-row";

  row.dataset.type =
    "part";

  row.dataset.partId =
    part.id;

  /*
    既存データに unit がない場合は
    パーツの初期単位を使用
  */
  const unit =
    data.unit !== undefined
      ? data.unit
      : part.yieldUnit;

  row.innerHTML = `
    <span
      class="drag-handle"
      title="ドラッグして並び替え"
    >≡</span>

    <div class="part-name">
      ${escapeHtml(part.name)}
    </div>

    <input
      class="part-amount"
      placeholder="分量"
      value="${escapeAttr(
        data.amount || ""
      )}"
    >

    <input
      class="part-unit"
      placeholder="単位"
      value="${escapeAttr(
        unit || ""
      )}"
    >

    <button
      class="remove-row"
      type="button"
    >×</button>
  `;

  row.querySelector(
    ".part-amount"
  ).addEventListener(
    "input",
    scheduleSave
  );

  row.querySelector(
    ".part-unit"
  ).addEventListener(
    "input",
    scheduleSave
  );

  row.querySelector(
    ".remove-row"
  ).addEventListener(
    "click",
    () => {

      row.remove();

      scheduleSave();
    }
  );

  bindDrag(row);

  $("#ingredientList")
    .appendChild(row);

  if (save) {
    scheduleSave();
  }
}

function renderSteps() {

  const r =
    getEditing();

  const list =
    $("#stepList");

  list.innerHTML = "";

  (
    r.steps?.length
      ? r.steps
      : [
          {
            text:"",
            links:[]
          }
        ]
  ).forEach(
    (step,i) =>
      addStepRow(
        step,
        i,
        false
      )
  );
}

function addStepRow(
  data={
    text:"",
    links:[]
  },
  index=null,
  focus=true
) {

  const row =
    document.createElement("div");

  row.className =
    "step-row";

  row.innerHTML = `
    <div class="step-number">
      ${
        index === null
          ? $$("#stepList .step-row").length + 1
          : index + 1
      }
    </div>

    <div class="step-body">

      <textarea
        placeholder="手順"
      >${escapeHtml(
        data.text || ""
      )}</textarea>

      <div class="link-summary">

        ${
          (data.links || [])
            .map(
              n =>
                `<span
                  class="linked-chip"
                  data-name="${escapeAttr(n)}"
                >${escapeHtml(n)}</span>`
            )
            .join("")
        }

      </div>

      <button
        class="link-btn"
        type="button"
      >材料を指定</button>

    </div>

    <button
      class="remove-row"
      type="button"
    >×</button>
  `;

  row.querySelector(
    "textarea"
  ).addEventListener(
    "input",
    scheduleSave
  );

  row.querySelector(
    ".remove-row"
  ).addEventListener(
    "click",
    () => {

      row.remove();

      renumberSteps();

      scheduleSave();
    }
  );

  row.querySelector(
    ".link-btn"
  ).addEventListener(
    "click",
    () =>
      openIngredientLinkModal(row)
  );

  $("#stepList")
    .appendChild(row);

  if (focus) {

    row.querySelector(
      "textarea"
    ).focus();
  }
}

function renumberSteps() {

  $$("#stepList .step-number")
    .forEach(
      (n,i) =>
        n.textContent = i + 1
    );
}

function openIngredientLinkModal(row) {

  const r =
    getEditing();

  const existing =
    [
      ...row.querySelectorAll(
        ".linked-chip"
      )
    ].map(
      c => c.dataset.name
    );

  const ingredients =
    (r.ingredients || [])
      .filter(
        x =>
          x.type === "ingredient" &&
          x.name
      );

  const backdrop =
    document.createElement("div");

  backdrop.className =
    "modal-backdrop";

  backdrop.innerHTML = `
    <div class="modal">

      <h3>
        手順に材料を指定
      </h3>

      <p class="help">
        この手順で使う材料を選択してください。複数選択できます。
      </p>

      <div id="linkOptions"></div>

      <div class="modal-actions">

        <button
          class="cancel-btn"
          type="button"
        >キャンセル</button>

        <button
          class="confirm-btn"
          type="button"
        >指定する</button>

      </div>

    </div>
  `;

  const options =
    backdrop.querySelector(
      "#linkOptions"
    );

  ingredients.forEach(
    item => {

      const b =
        document.createElement(
          "button"
        );

      b.type =
        "button";

      b.className =
        "part-option";

      b.dataset.name =
        item.name;

      b.innerHTML = `
        <strong>
          ${escapeHtml(
            item.name
          )}
        </strong>

        <span>
          ${escapeHtml(
            (item.amount || "") +
            (item.unit || "")
          )}
        </span>
      `;

      if (
        existing.includes(
          item.name
        )
      ) {

        b.style.borderColor =
          "var(--blue)";
      }

      b.addEventListener(
        "click",
        () =>
          b.classList.toggle(
            "selected"
          )
      );

      options.appendChild(b);
    }
  );

  backdrop.querySelector(
    ".cancel-btn"
  ).addEventListener(
    "click",
    () =>
      backdrop.remove()
  );

  backdrop.querySelector(
    ".confirm-btn"
  ).addEventListener(
    "click",
    () => {

      const selected =
        [
          ...options.querySelectorAll(
            ".part-option.selected"
          )
        ].map(
          b => b.dataset.name
        );

      row.querySelector(
        ".link-summary"
      ).innerHTML =
        selected.map(
          n =>
            `<span
              class="linked-chip"
              data-name="${escapeAttr(n)}"
            >${escapeHtml(n)}</span>`
        ).join("");

      backdrop.remove();

      scheduleSave();
    }
  );

  document.body.appendChild(
    backdrop
  );
}

function addTag() {

  const row =
    document.createElement("div");

  row.className =
    "tag-row";

  row.innerHTML = `
    <input
      placeholder="タグを入力"
    >

    <button
      class="remove-small"
      type="button"
    >×</button>
  `;

  row.querySelector(
    "input"
  ).addEventListener(
    "input",
    scheduleSave
  );

  row.querySelector(
    ".remove-small"
  ).addEventListener(
    "click",
    () => {

      row.remove();

      scheduleSave();
    }
  );

  $("#tagList")
    .appendChild(row);

  row.querySelector(
    "input"
  ).focus();
}

function generateCode() {

  syncCurrentFromDOM();

  const r =
    getEditing();

  if (!r.id) {

    toast(
      "IDを入力してください"
    );

    $("#idInput").focus();

    return;
  }

  if (!r.title) {

    toast(
      "タイトルを入力してください"
    );

    $("#titleInput").focus();

    return;
  }

  const tags =
    (r.tags || [])
      .filter(Boolean);

  const search = [
    ...tags,

    ...r.ingredients
      .filter(
        x =>
          x.type === "ingredient"
      )
      .map(
        x => x.name
      )
      .filter(Boolean)

  ].join(" ");

  const ingredients =
    r.ingredients.map(
      x => {

        if (
          x.type === "part"
        ) {

          const p =
            PARTS.find(
              p =>
                p.id === x.partId
            );

          return `["${esc(
            p?.name || ""
          )}","${esc(
            (x.amount || "") +
            (x.unit || "")
          )}"]`;
        }

        return `["${esc(
          x.name || ""
        )}","${esc(
          (x.amount || "") +
          (x.unit || "")
        )}"]`;
      }
    );

  const steps =
    r.steps.map(
      s =>
        `"${esc(
          s.text || ""
        )}"`
    );

  const code = `{
    id: "${esc(r.id)}",
    name: "${esc(r.title)}",
    servings: ${
      r.servings
        ? Number(r.servings)
        : "null"
    },
    image: "${esc(
      r.image || ""
    )}",
    tags: [
      ${tags.map(
        t => `"${esc(t)}"`
      ).join(", ")}
    ],
    searchText: "${esc(search)}",
    ingredients: [
      ${ingredients.join(",\n      ")}
    ],
    steps: [
      ${steps.join(",\n      ")}
    ]
  },`;

  $("#generatedCode")
    .textContent = code;

  $("#codePanel")
    .classList.remove(
      "is-hidden"
    );

  $("#codePanel")
    .scrollIntoView({
      behavior:"smooth",
      block:"start"
    });
}

function renderSearchPreview() {

  const r =
    getEditing();

  if (!r) return;

  const tags =
    (r.tags || [])
      .filter(Boolean);

  const names =
    (r.ingredients || [])
      .filter(
        x =>
          x.type === "ingredient"
      )
      .map(
        x => x.name
      )
      .filter(Boolean);

  $("#searchTextPreview")
    .textContent =
      [
        ...tags,
        ...names
      ].join(" ") ||
      "タグ・材料を入力すると自動生成されます。";
}


/* =========================================
   材料のドラッグ並び替え
   ========================================= */

function bindDrag(row) {

  const handle =
    row.querySelector(
      ".drag-handle"
    );

  if (!handle) return;

  let dragging = false;
  let startY = 0;
  let startTop = 0;
  let placeholder = null;

  handle.addEventListener(
    "pointerdown",
    (e) => {

      e.preventDefault();

      handle.setPointerCapture?.(
        e.pointerId
      );

      startY =
        e.clientY;

      const move =
        (ev) => {

          ev.preventDefault();

          const distance =
            Math.abs(
              ev.clientY -
              startY
            );

          if (!dragging) {

            if (distance < 8) {
              return;
            }

            dragging = true;

            const rect =
              row.getBoundingClientRect();

            startTop =
              rect.top;

            placeholder =
              document.createElement(
                "div"
              );

            placeholder.className =
              "ingredient-placeholder";

            placeholder.style.height =
              `${rect.height}px`;

            placeholder.style.borderRadius =
              "9px";

            placeholder.style.border =
              "1px dashed var(--line)";

            placeholder.style.background =
              "rgba(143,175,114,.08)";

            placeholder.style.boxSizing =
              "border-box";

            row.parentNode.insertBefore(
              placeholder,
              row
            );

            row.classList.add(
              "is-dragging"
            );

            row.style.width =
              `${rect.width}px`;

            row.style.position =
              "fixed";

            row.style.left =
              `${rect.left}px`;

            row.style.top =
              `${startTop}px`;

            row.style.zIndex =
              "1000";

            row.style.transition =
              "box-shadow .15s ease, transform .15s ease";

            row.style.boxShadow =
              "0 14px 32px rgba(40,40,35,.20)";

            row.style.transform =
              "scale(1.025)";

            document.body.style.userSelect =
              "none";

            document.body.style.webkitUserSelect =
              "none";
          }

          const offset =
            ev.clientY -
            startY;

          row.style.transform =
            `translateY(${offset}px) scale(1.025)`;

          const list =
            $("#ingredientList");

          const rows =
            [
              ...list.querySelectorAll(
                ".ingredient-row:not(.is-dragging)"
              )
            ];

          const currentY =
            ev.clientY;

          for (
            const target of rows
          ) {

            const rect =
              target.getBoundingClientRect();

            const middle =
              rect.top +
              rect.height / 2;

            if (
              currentY <
              middle
            ) {

              if (
                placeholder !==
                target.previousElementSibling
              ) {

                list.insertBefore(
                  placeholder,
                  target
                );
              }

              return;
            }
          }

          if (rows.length) {

            const last =
              rows[
                rows.length - 1
              ];

            if (
              placeholder !==
              last.nextElementSibling
            ) {

              list.appendChild(
                placeholder
              );
            }
          }
        };

      const finish =
        () => {

          if (dragging) {

            if (placeholder) {

              placeholder.parentNode.insertBefore(
                row,
                placeholder
              );

              placeholder.remove();

              placeholder = null;
            }

            row.classList.remove(
              "is-dragging"
            );

            row.style.width = "";
            row.style.position = "";
            row.style.left = "";
            row.style.top = "";
            row.style.zIndex = "";
            row.style.transform = "";
            row.style.transition = "";
            row.style.boxShadow = "";

            document.body.style.userSelect =
              "";

            document.body.style.webkitUserSelect =
              "";

            scheduleSave();
          }

          dragging = false;

          handle.removeEventListener(
            "pointermove",
            move
          );

          handle.removeEventListener(
            "pointerup",
            finish
          );

          handle.removeEventListener(
            "pointercancel",
            finish
          );
        };

      handle.addEventListener(
        "pointermove",
        move
      );

      handle.addEventListener(
        "pointerup",
        finish
      );

      handle.addEventListener(
        "pointercancel",
        finish
      );
    }
  );
}

function handleImage(file) {

  if (!file) return;

  const reader =
    new FileReader();

  reader.onload =
    () => {

      const r =
        getEditing();

      r.image =
        reader.result;

      renderImage();

      scheduleSave();

      toast(
        "画像を保存しました"
      );
    };

  reader.readAsDataURL(file);
}

function deleteCurrent() {

  const r =
    getEditing();

  if (!r) return;

  if (
    !confirm(
      `「${
        r.title ||
        "無題のレシピ"
      }」を削除しますか？`
    )
  ) return;

  recipes =
    recipes.filter(
      x =>
        x.labId !==
        r.labId
    );

  saveRecipes();

  editingId = null;

  showPage("home");

  renderHome();

  toast(
    "削除しました"
  );
}

function escapeHtml(s) {

  return String(
    s ?? ""
  ).replace(
    /[&<>"']/g,
    c =>
      ({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#39;"
      }[c])
  );
}

function escapeAttr(s) {
  return escapeHtml(s);
}

function esc(s) {

  return String(
    s ?? ""
  )
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /"/g,
      '\\"'
    )
    .replace(
      /\n/g,
      "\\n"
    )
    .replace(
      /\r/g,
      ""
    );
}

let toastTimer;

function toast(msg) {

  const t =
    $("#toast");

  t.textContent =
    msg;

  t.classList.add(
    "show"
  );

  clearTimeout(
    toastTimer
  );

  toastTimer =
    setTimeout(
      () =>
        t.classList.remove(
          "show"
        ),
      1800
    );
}

$("#goHome")
  .addEventListener(
    "click",
    closeEditor
  );

$("#backHome")
  .addEventListener(
    "click",
    closeEditor
  );

$("#newRecipeTop")
  .addEventListener(
    "click",
    newRecipe
  );

$("#newRecipeHero")
  .addEventListener(
    "click",
    newRecipe
  );

$("#addTag")
  .addEventListener(
    "click",
    addTag
  );

$("#addIngredient")
  .addEventListener(
    "click",
    () => {

      syncCurrentFromDOM();

      addIngredientRow();
    }
  );

$("#addPart")
  .addEventListener(
    "click",
    () => {

      syncCurrentFromDOM();

      const backdrop =
        document.createElement(
          "div"
        );

      backdrop.className =
        "modal-backdrop";

      backdrop.innerHTML = `
        <div class="modal">

          <h3>
            レシピパーツを選択
          </h3>

          <p class="help">
            LABに登録済みのパーツから選びます。
          </p>

          <div id="partOptions"></div>

          <div class="modal-actions">

            <button
              class="cancel-btn"
              type="button"
            >閉じる</button>

          </div>

        </div>
      `;

      const box =
        backdrop.querySelector(
          "#partOptions"
        );

      PARTS.forEach(
        p => {

          const b =
            document.createElement(
              "button"
            );

          b.type =
            "button";

          b.className =
            "part-option";

          b.innerHTML = `
            <strong>
              ${escapeHtml(
                p.name
              )}
            </strong>

            <span>
              できあがり
              ${p.yieldAmount}${p.yieldUnit}
            </span>
          `;

          b.addEventListener(
            "click",
            () => {

              addPartRow({
                partId:p.id,
                amount:"",
                unit:p.yieldUnit
              });

              backdrop.remove();
            }
          );

          box.appendChild(b);
        }
      );

      backdrop.querySelector(
        ".cancel-btn"
      ).addEventListener(
        "click",
        () =>
          backdrop.remove()
      );

      document.body.appendChild(
        backdrop
      );
    }
  );

$("#addStep")
  .addEventListener(
    "click",
    () => {

      syncCurrentFromDOM();

      addStepRow();
    }
  );

$("#statusSelect")
  .addEventListener(
    "change",
    scheduleSave
  );

$("#idInput")
  .addEventListener(
    "input",
    () => {

      $("#editorHeading")
        .textContent =
          $("#titleInput")
            .value.trim() ||
          "NEW RECIPE";

      scheduleSave();
    }
  );

$("#titleInput")
  .addEventListener(
    "input",
    () => {

      $("#editorHeading")
        .textContent =
          $("#titleInput")
            .value.trim() ||
          "NEW RECIPE";

      scheduleSave();
    }
  );

$$("#servingsPicker button")
  .forEach(
    b =>
      b.addEventListener(
        "click",
        () => {

          $$("#servingsPicker button")
            .forEach(
              x =>
                x.classList.remove(
                  "is-selected"
                )
            );

          b.classList.add(
            "is-selected"
          );

          scheduleSave();
        }
      )
  );

$("#imageInput")
  .addEventListener(
    "change",
    e =>
      handleImage(
        e.target.files[0]
      )
  );

$("#removeImage")
  .addEventListener(
    "click",
    () => {

      const r =
        getEditing();

      r.image = "";

      renderImage();

      scheduleSave();
    }
  );

$("#generateCode")
  .addEventListener(
    "click",
    generateCode
  );

$("#copyCode")
  .addEventListener(
    "click",
    async () => {

      try {

        await navigator.clipboard.writeText(
          $("#generatedCode")
            .textContent
        );

        $("#copyMessage")
          .textContent =
            "コピーしました ✓";

        toast(
          "コードをコピーしました"
        );

      } catch(e) {

        $("#copyMessage")
          .textContent =
            "コピーできませんでした。コードを長押ししてコピーしてください。";
      }
    }
  );

$("#deleteRecipe")
  .addEventListener(
    "click",
    deleteCurrent
  );

$$(".filter-btn")
  .forEach(
    b =>
      b.addEventListener(
        "click",
        () => {

          $$(".filter-btn")
            .forEach(
              x =>
                x.classList.remove(
                  "is-active"
                )
            );

          b.classList.add(
            "is-active"
          );

          filter =
            b.dataset.filter;

          renderHome();
        }
      )
  );

window.addEventListener(
  "beforeunload",
  () => {

    if (editingId) {

      syncCurrentFromDOM();

      saveCurrent();
    }
  }
);

renderHome();