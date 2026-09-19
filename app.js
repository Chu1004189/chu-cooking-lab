/* =================================
   CHU dot COOKING LAB
================================= */

const STORAGE_KEY = "chu-dot-cooking-lab-v1";


/* =================================
   PARTS
================================= */

const PARTS = [
  {
    id: "spicy-dare",
    name: "ピリ辛だれ",
    yieldAmount: "84",
    yieldUnit: "g"
  },
  {
    id: "sesame-dressing",
    name: "ごまドレッシング",
    yieldAmount: "120",
    yieldUnit: "g"
  },
  {
    id: "garlic-sauce",
    name: "にんにくだれ",
    yieldAmount: "70",
    yieldUnit: "g"
  }
];


/* =================================
   DOM HELPERS
================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => [
  ...document.querySelectorAll(selector)
];


/* =================================
   STATE
================================= */

let recipes = loadRecipes();
let editingId = null;
let filter = "all";
let autosaveTimer = null;


/* =================================
   BASIC HELPERS
================================= */

function uid(){
  return (
    "lab-" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2,7)
  );
}


function escapeHtml(value = ""){
  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}


function normalizeArray(value){
  return Array.isArray(value) ? value : [];
}


function normalizeRecipe(recipe){
  return {
    labId: recipe.labId || uid(),
    id: recipe.id || "",
    title: recipe.title || "",
    image: recipe.image || "",
    tags: normalizeArray(recipe.tags).length
      ? normalizeArray(recipe.tags)
      : [""],
    servings:
      recipe.servings === null ||
      recipe.servings === undefined
        ? ""
        : String(recipe.servings),

    ingredients: normalizeArray(recipe.ingredients).map(item => ({
      type: item.type === "part" ? "part" : "ingredient",
      partId: item.partId || "",
      name: item.name || "",
      amount:
        item.amount === null ||
        item.amount === undefined
          ? ""
          : String(item.amount),
      unit: item.unit || ""
    })),

    steps: normalizeArray(recipe.steps).map(step => ({
      text: step.text || "",
      links: normalizeArray(step.links)
    })),

    status:
      recipe.status === "complete"
        ? "complete"
        : "research",

    updatedAt:
      Number(recipe.updatedAt) || Date.now()
  };
}


/* =================================
   BLANK RECIPE
================================= */

function blankRecipe(){
  return {
    labId: uid(),

    id: "",
    title: "",
    image: "",

    tags: [""],

    servings: "",

    ingredients: [
      {
        type: "ingredient",
        name: "",
        amount: "",
        unit: ""
      }
    ],

    steps: [
      {
        text: "",
        links: []
      }
    ],

    status: "research",

    updatedAt: Date.now()
  };
}


/* =================================
   LOAD / SAVE
================================= */

function loadRecipes(){

  try{

    const raw = localStorage.getItem(STORAGE_KEY);

    if(raw){

      const data = JSON.parse(raw);

      if(Array.isArray(data)){
        return data.map(normalizeRecipe);
      }
    }

  }catch(error){

    console.warn(
      "レシピデータの読み込みに失敗しました。",
      error
    );

  }

  return [
    {
      labId: uid(),
      id: "ebi-shio-yakisoba",
      title: "海老塩焼きそば",
      image: "",
      tags: [
        "麺類",
        "海鮮",
        "ガッツリ"
      ],
      servings: "2",

      ingredients: [
        {
          type: "ingredient",
          name: "中華麺",
          amount: "2",
          unit: "玉"
        },
        {
          type: "ingredient",
          name: "むき海老",
          amount: "120",
          unit: "g"
        },
        {
          type: "ingredient",
          name: "キャベツ",
          amount: "120",
          unit: "g"
        },
        {
          type: "ingredient",
          name: "もやし",
          amount: "100",
          unit: "g"
        },
        {
          type: "ingredient",
          name: "ごま油",
          amount: "10",
          unit: "g"
        },
        {
          type: "ingredient",
          name: "鶏ガラスープの素",
          amount: "5",
          unit: "g"
        },
        {
          type: "ingredient",
          name: "塩",
          amount: "3",
          unit: "g"
        },
        {
          type: "ingredient",
          name: "黒こしょう",
          amount: "少々",
          unit: ""
        },
        {
          type: "ingredient",
          name: "にんにく",
          amount: "5",
          unit: "g"
        }
      ],

      steps: [
        {
          text:
            "フライパンにごま油とにんにくを入れて中火で熱する。",
          links: [
            "ごま油",
            "にんにく"
          ]
        },
        {
          text:
            "海老を加えて炒め、色が変わったらキャベツともやしを加える。",
          links: [
            "むき海老",
            "キャベツ",
            "もやし"
          ]
        },
        {
          text:
            "中華麺を加えてほぐしながら炒める。",
          links: [
            "中華麺"
          ]
        },
        {
          text:
            "鶏ガラスープの素、塩、黒こしょうで味を整える。",
          links: [
            "鶏ガラスープの素",
            "塩",
            "黒こしょう"
          ]
        }
      ],

      status: "research",
      updatedAt: Date.now()
    },

    {
      labId: uid(),
      id: "butakoma-shoga",
      title: "豚こま生姜焼き",
      image: "",
      tags: [
        "肉料理",
        "ごはん"
      ],
      servings: "2",
      ingredients: [
        {
          type: "ingredient",
          name: "豚こま肉",
          amount: "250",
          unit: "g"
        },
        {
          type: "ingredient",
          name: "醤油",
          amount: "20",
          unit: "g"
        },
        {
          type: "ingredient",
          name: "みりん",
          amount: "20",
          unit: "g"
        },
        {
          type: "ingredient",
          name: "しょうが",
          amount: "10",
          unit: "g"
        }
      ],
      steps: [
        {
          text:
            "豚こま肉を炒め、調味料を加えて煮絡める。",
          links: [
            "豚こま肉",
            "醤油",
            "みりん",
            "しょうが"
          ]
        }
      ],
      status: "complete",
      updatedAt: Date.now()
    }
  ];
}


function saveRecipes(){

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(recipes)
  );

  const saveState = $("#saveState");

  if(saveState){
    saveState.textContent = "保存済み";
  }
}


/* =================================
   PAGE CONTROL
================================= */

function showPage(page){

  const homePage = $("#homePage");
  const editorPage = $("#editorPage");

  homePage.classList.toggle(
    "is-hidden",
    page !== "home"
  );

  editorPage.classList.toggle(
    "is-hidden",
    page !== "editor"
  );

  window.scrollTo(0,0);
}


/* =================================
   HOME
================================= */

function renderHome(){

  const list = $("#recipeList");
  const count = $("#recipeCount");

  const filtered = recipes
    .filter(recipe => {
      return (
        filter === "all" ||
        recipe.status === filter
      );
    })
    .sort((a,b) => {
      return (
        (b.updatedAt || 0) -
        (a.updatedAt || 0)
      );
    });

  count.textContent =
    `${filtered.length} RECIPE${filtered.length === 1 ? "" : "S"}`;

  if(!filtered.length){

    list.innerHTML = `
      <div class="empty-state">
        <strong>レシピがありません</strong>
        <span>新しいレシピを作ってみましょう。</span>
      </div>
    `;

    return;
  }

  list.innerHTML = filtered
    .map(recipe => {

      const originalIndex =
        recipes.indexOf(recipe);

      const number =
        String(originalIndex + 1).padStart(2,"0");

      const statusClass =
        recipe.status === "complete"
          ? "complete"
          : "research";

      const statusText =
        recipe.status === "complete"
          ? "完成済"
          : "研究中";

      const statusMark =
        recipe.status === "complete"
          ? "✓"
          : "";

      const servingsText =
        recipe.servings
          ? `${recipe.servings}人前`
          : "";

      return `
        <article
          class="recipe-card"
          data-lab-id="${escapeHtml(recipe.labId)}"
        >

          <div class="recipe-number">
            #${number}
          </div>

          <h2>
            ${escapeHtml(recipe.title || "NEW RECIPE")}
          </h2>

          <div class="recipe-card-foot">

            <span class="status-badge ${statusClass}">
              ${
                statusMark
                  ? `<span class="status-check">${statusMark}</span>`
                  : `<span class="status-dot"></span>`
              }
              ${statusText}
            </span>

            <span class="card-meta">
              ${servingsText}
            </span>

          </div>

        </article>
      `;
    })
    .join("");

  $$(".recipe-card").forEach(card => {

    card.addEventListener("click",() => {

      openEditor(
        card.dataset.labId
      );

    });

  });
}


/* =================================
   FILTER
================================= */

function setFilter(nextFilter){

  filter = nextFilter;

  $$(".filter-btn").forEach(button => {

    button.classList.toggle(
      "is-active",
      button.dataset.filter === filter
    );

  });

  renderHome();
}


/* =================================
   EDITOR
================================= */

function getEditingRecipe(){

  return recipes.find(
    recipe => recipe.labId === editingId
  );

}


function openEditor(labId){

  const recipe = recipes.find(
    item => item.labId === labId
  );

  if(!recipe) return;

  editingId = labId;

  renderEditor();

  showPage("editor");
}


function closeEditor(){

  saveCurrent();

  editingId = null;

  showPage("home");

  renderHome();
}


function renderEditor(){

  const recipe = getEditingRecipe();

  if(!recipe) return;

  $("#editorHeading").textContent =
    recipe.title || "NEW RECIPE";

  $("#idInput").value =
    recipe.id || "";

  $("#titleInput").value =
    recipe.title || "";

  $("#statusSelect").value =
    recipe.status || "research";

  renderImage(recipe);
  renderTags(recipe);
  renderServings(recipe);
  renderIngredients(recipe);
  renderSteps(recipe);
  updateSearchPreview();

  $("#saveState").textContent =
    "保存済み";

  $("#codePanel").classList.add(
    "is-hidden"
  );

  $("#generatedCode").textContent = "";
  $("#copyMessage").textContent = "";
}


/* =================================
   IMAGE
================================= */

function renderImage(recipe){

  const drop = $("#imageDrop");
  const preview = $("#imagePreview");

  if(recipe.image){

    preview.src = recipe.image;

    drop.classList.add("has-image");

  }else{

    preview.removeAttribute("src");

    drop.classList.remove("has-image");

  }
}


function handleImageChange(event){

  const file =
    event.target.files?.[0];

  if(!file) return;

  const reader =
    new FileReader();

  reader.onload = () => {

    const recipe = getEditingRecipe();

    if(!recipe) return;

    recipe.image =
      reader.result;

    renderImage(recipe);

    scheduleAutosave();
  };

  reader.readAsDataURL(file);
}


function removeImage(){

  const recipe = getEditingRecipe();

  if(!recipe) return;

  recipe.image = "";

  $("#imageInput").value = "";

  renderImage(recipe);

  scheduleAutosave();
}


/* =================================
   TAGS
================================= */

function renderTags(recipe){

  const list = $("#tagList");

  list.innerHTML =
    recipe.tags
      .map((tag,index) => {

        return `
          <div class="tag-row">

            <input
              type="text"
              value="${escapeHtml(tag)}"
              data-tag-index="${index}"
              placeholder="タグ"
              autocomplete="off"
            >

            <button
              class="remove-small"
              type="button"
              data-remove-tag="${index}"
              aria-label="タグを削除"
            >
              ×
            </button>

          </div>
        `;

      })
      .join("");

  $$("#tagList input").forEach(input => {

    input.addEventListener(
      "input",
      scheduleAutosave
    );

  });

  $$("#tagList [data-remove-tag]").forEach(button => {

    button.addEventListener("click",() => {

      const index =
        Number(button.dataset.removeTag);

      recipe.tags.splice(index,1);

      if(!recipe.tags.length){
        recipe.tags.push("");
      }

      renderTags(recipe);

      scheduleAutosave();

    });

  });
}


function addTag(){

  const recipe = getEditingRecipe();

  if(!recipe) return;

  syncCurrentFromDOM();

  recipe.tags.push("");

  renderTags(recipe);

  const inputs =
    $$("#tagList input");

  inputs.at(-1)?.focus();

  scheduleAutosave();
}


/* =================================
   SERVINGS
================================= */

function renderServings(recipe){

  $$("#servingsPicker button").forEach(button => {

    button.classList.toggle(
      "is-selected",
      button.dataset.value === String(recipe.servings || "")
    );

  });
}


function setServings(value){

  const recipe = getEditingRecipe();

  if(!recipe) return;

  recipe.servings = value;

  renderServings(recipe);

  scheduleAutosave();
}


/* =================================
   INGREDIENTS
================================= */

function renderIngredients(recipe){

  const list = $("#ingredientList");

  list.innerHTML =
    recipe.ingredients
      .map((ingredient,index) => {

        return ingredient.type === "part"
          ? renderPartRow(ingredient,index)
          : renderIngredientRow(ingredient,index);

      })
      .join("");

  bindIngredientEvents();

}


function renderIngredientRow(item,index){

  return `
    <div
      class="ingredient-row"
      data-index="${index}"
    >

      <div
        class="drag-handle"
        data-drag-index="${index}"
        title="ドラッグして並べ替え"
        aria-label="材料を並べ替え"
      >
        ⋮⋮
      </div>

      <input
        type="text"
        data-field="name"
        value="${escapeHtml(item.name)}"
        placeholder="材料名"
        autocomplete="off"
      >

      <input
        type="text"
        data-field="amount"
        value="${escapeHtml(item.amount)}"
        placeholder="分量"
        autocomplete="off"
      >

      <input
        type="text"
        data-field="unit"
        value="${escapeHtml(item.unit)}"
        placeholder="単位"
        autocomplete="off"
      >

      <button
        class="remove-row"
        type="button"
        data-remove-index="${index}"
        aria-label="材料を削除"
      >
        ×
      </button>

    </div>
  `;
}


function renderPartRow(item,index){

  const part =
    PARTS.find(
      part => part.id === item.partId
    );

  const name =
    part?.name ||
    item.name ||
    "パーツ";

  return `
    <div
      class="ingredient-row part-row"
      data-index="${index}"
    >

      <div
        class="drag-handle"
        data-drag-index="${index}"
        title="ドラッグして並べ替え"
        aria-label="材料を並べ替え"
      >
        ⋮⋮
      </div>

      <div class="part-name">
        ${escapeHtml(name)}
      </div>

      <input
        type="text"
        data-field="amount"
        value="${escapeHtml(item.amount)}"
        placeholder="分量"
        autocomplete="off"
      >

      <input
        type="text"
        data-field="unit"
        value="${escapeHtml(item.unit)}"
        placeholder="単位"
        autocomplete="off"
      >

      <button
        class="remove-row"
        type="button"
        data-remove-index="${index}"
        aria-label="パーツを削除"
      >
        ×
      </button>

    </div>
  `;
}


function bindIngredientEvents(){

  const recipe = getEditingRecipe();

  if(!recipe) return;

  $$("#ingredientList .ingredient-row").forEach(row => {

    const index =
      Number(row.dataset.index);

    row.querySelectorAll("input").forEach(input => {

      input.addEventListener(
        "input",
        () => {

          syncIngredientRow(
            recipe,
            row,
            index
          );

          scheduleAutosave();

        }
      );

    });

  });


  $$("#ingredientList [data-remove-index]").forEach(button => {

    button.addEventListener("click",() => {

      const index =
        Number(button.dataset.removeIndex);

      recipe.ingredients.splice(index,1);

      if(!recipe.ingredients.length){

        recipe.ingredients.push({
          type:"ingredient",
          name:"",
          amount:"",
          unit:""
        });

      }

      renderIngredients(recipe);

      scheduleAutosave();

    });

  });


  $$("#ingredientList [data-drag-index]").forEach(handle => {

    bindDrag(handle);

  });
}


function syncIngredientRow(recipe,row,index){

  const item =
    recipe.ingredients[index];

  if(!item) return;

  row.querySelectorAll("input").forEach(input => {

    const field =
      input.dataset.field;

    if(field){
      item[field] =
        input.value;
    }

  });
}


function addIngredient(){

  const recipe = getEditingRecipe();

  if(!recipe) return;

  syncCurrentFromDOM();

  recipe.ingredients.push({
    type:"ingredient",
    name:"",
    amount:"",
    unit:""
  });

  renderIngredients(recipe);

  const rows =
    $$("#ingredientList .ingredient-row");

  rows.at(-1)
    ?.querySelector('input[data-field="name"]')
    ?.focus();

  scheduleAutosave();
}


/* =================================
   PARTS
================================= */

function addPart(){

  openPartModal();
}


function openPartModal(){

  const existing =
    $("#partModal");

  existing?.remove();

  const modal =
    document.createElement("div");

  modal.id = "partModal";
  modal.className = "modal-backdrop";

  modal.innerHTML = `
    <div class="modal">

      <h3>パーツを追加</h3>

      <div class="part-options">

        ${PARTS.map(part => `
          <button
            type="button"
            class="part-option"
            data-part-id="${escapeHtml(part.id)}"
          >

            <strong>
              ${escapeHtml(part.name)}
            </strong>

            <span>
              ${escapeHtml(part.yieldAmount)}${escapeHtml(part.yieldUnit)}
            </span>

          </button>
        `).join("")}

      </div>

      <div class="modal-actions">

        <button
          type="button"
          class="cancel-btn"
          data-modal-cancel
        >
          キャンセル
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  modal
    .querySelector("[data-modal-cancel]")
    .addEventListener(
      "click",
      () => modal.remove()
    );

  modal.addEventListener("click",event => {

    if(event.target === modal){
      modal.remove();
    }

  });

  modal
    .querySelectorAll("[data-part-id]")
    .forEach(button => {

      button.addEventListener("click",() => {

        const part =
          PARTS.find(
            item =>
              item.id ===
              button.dataset.partId
          );

        if(!part) return;

        const recipe =
          getEditingRecipe();

        if(!recipe) return;

        syncCurrentFromDOM();

        recipe.ingredients.push({
          type:"part",
          partId:part.id,
          name:part.name,
          amount:part.yieldAmount,
          unit:part.yieldUnit
        });

        modal.remove();

        renderIngredients(recipe);

        scheduleAutosave();

      });

    });
}


/* =================================
   STEPS
================================= */

function renderSteps(recipe){

  const list = $("#stepList");

  list.innerHTML =
    recipe.steps
      .map((step,index) =>
        renderStepRow(step,index)
      )
      .join("");

  bindStepEvents();
}


function renderStepRow(step,index){

  const links =
    normalizeArray(step.links);

  const chips =
    links
      .map(name => `
        <span class="linked-chip">
          ${escapeHtml(name)}
        </span>
      `)
      .join("");

  return `
    <div
      class="step-row"
      data-step-index="${index}"
    >

      <div class="step-number">
        ${index + 1}
      </div>

      <div class="step-body">

        <textarea
          data-step-text
          placeholder="手順を入力"
        >${escapeHtml(step.text)}</textarea>

        <div class="link-summary">
          ${chips}
        </div>

        <button
          type="button"
          class="link-btn"
          data-link-step="${index}"
        >
          材料を指定
        </button>

      </div>

      <button
        type="button"
        class="remove-row"
        data-remove-step="${index}"
        aria-label="手順を削除"
      >
        ×
      </button>

    </div>
  `;
}


function bindStepEvents(){

  $$("#stepList .step-row").forEach(row => {

    const index =
      Number(row.dataset.stepIndex);

    const textarea =
      row.querySelector("[data-step-text]");

    textarea.addEventListener(
      "input",
      () => {

        const recipe =
          getEditingRecipe();

        if(!recipe) return;

        if(recipe.steps[index]){
          recipe.steps[index].text =
            textarea.value;
        }

        updateSearchPreview();

        scheduleAutosave();

      }
    );

  });


  $$("#stepList [data-link-step]").forEach(button => {

    button.addEventListener("click",() => {

      openIngredientLinkModal(
        Number(button.dataset.linkStep)
      );

    });

  });


  $$("#stepList [data-remove-step]").forEach(button => {

    button.addEventListener("click",() => {

      const recipe =
        getEditingRecipe();

      if(!recipe) return;

      const index =
        Number(button.dataset.removeStep);

      recipe.steps.splice(index,1);

      if(!recipe.steps.length){

        recipe.steps.push({
          text:"",
          links:[]
        });

      }

      renderSteps(recipe);

      scheduleAutosave();

    });

  });
}


function addStep(){

  const recipe = getEditingRecipe();

  if(!recipe) return;

  syncCurrentFromDOM();

  recipe.steps.push({
    text:"",
    links:[]
  });

  renderSteps(recipe);

  const textareas =
    $$("#stepList textarea");

  textareas.at(-1)?.focus();

  scheduleAutosave();
}


/* =================================
   MATERIAL LINK
   ※ 複数選択対応
================================= */

function openIngredientLinkModal(stepIndex){

  const recipe =
    getEditingRecipe();

  if(!recipe) return;

  const step =
    recipe.steps[stepIndex];

  if(!step) return;

  const ingredients =
    recipe.ingredients.filter(
      item =>
        item.type !== "part" &&
        item.name.trim()
    );

  if(!ingredients.length){

    showToast(
      "先に材料を追加してください"
    );

    return;
  }

  const existingLinks =
    new Set(
      normalizeArray(step.links)
    );

  const modal =
    document.createElement("div");

  modal.className =
    "modal-backdrop";

  modal.innerHTML = `
    <div class="modal">

      <h3>手順に材料を指定</h3>

      <div class="part-options">

        ${ingredients.map(ingredient => {

          const selected =
            existingLinks.has(
              ingredient.name
            );

          return `
            <button
              type="button"
              class="part-option ${selected ? "selected" : ""}"
              data-link-name="${escapeHtml(ingredient.name)}"
            >

              <strong>
                ${escapeHtml(ingredient.name)}
              </strong>

              <span>
                ${escapeHtml(ingredient.amount)}
                ${escapeHtml(ingredient.unit)}
              </span>

            </button>
          `;

        }).join("")}

      </div>

      <div class="modal-actions">

        <button
          type="button"
          class="cancel-btn"
          data-modal-cancel
        >
          キャンセル
        </button>

        <button
          type="button"
          class="confirm-btn"
          data-modal-confirm
        >
          決定
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(modal);


  const selected =
    new Set(existingLinks);


  modal
    .querySelectorAll("[data-link-name]")
    .forEach(button => {

      button.addEventListener("click",() => {

        const name =
          button.dataset.linkName;

        if(selected.has(name)){

          selected.delete(name);

          button.classList.remove(
            "selected"
          );

        }else{

          selected.add(name);

          button.classList.add(
            "selected"
          );

        }

      });

    });


  modal
    .querySelector("[data-modal-cancel]")
    .addEventListener(
      "click",
      () => modal.remove()
    );


  modal
    .querySelector("[data-modal-confirm]")
    .addEventListener("click",() => {

      step.links =
        [...selected];

      renderSteps(recipe);

      scheduleAutosave();

      modal.remove();

    });


  modal.addEventListener("click",event => {

    if(event.target === modal){
      modal.remove();
    }

  });
}


/* =================================
   DRAG SORT
================================= */

function bindDrag(handle){

  let startY = 0;
  let startIndex = null;

  const onPointerDown = event => {

    const recipe =
      getEditingRecipe();

    if(!recipe) return;

    startY =
      event.clientY;

    startIndex =
      Number(handle.dataset.dragIndex);

    handle.setPointerCapture?.(
      event.pointerId
    );

    handle.style.opacity = ".45";
  };


  const onPointerMove = event => {

    if(startIndex === null) return;

    const row =
      handle.closest(".ingredient-row");

    if(!row) return;

    const currentIndex =
      Number(row.dataset.index);

    const delta =
      event.clientY - startY;

    if(Math.abs(delta) < 20){
      return;
    }

    const rows =
      $$("#ingredientList .ingredient-row");

    const targetRow =
      rows.find(other => {

        const index =
          Number(other.dataset.index);

        if(index === currentIndex){
          return false;
        }

        const rect =
          other.getBoundingClientRect();

        return (
          event.clientY >
            rect.top &&
          event.clientY <
            rect.bottom
        );

      });

    if(!targetRow) return;

    const targetIndex =
      Number(targetRow.dataset.index);

    if(targetIndex === startIndex){
      return;
    }

    const recipe =
      getEditingRecipe();

    if(!recipe) return;

    const [moved] =
      recipe.ingredients.splice(
        startIndex,
        1
      );

    recipe.ingredients.splice(
      targetIndex,
      0,
      moved
    );

    startIndex = targetIndex;

    renderIngredients(recipe);

    scheduleAutosave();

    const newHandle =
      $$("#ingredientList [data-drag-index]")[startIndex];

    newHandle?.setPointerCapture?.(
      event.pointerId
    );

    newHandle?.focus?.();
  };


  const onPointerUp = () => {

    handle.style.opacity = "";

    startIndex = null;
  };


  handle.addEventListener(
    "pointerdown",
    onPointerDown
  );

  handle.addEventListener(
    "pointermove",
    onPointerMove
  );

  handle.addEventListener(
    "pointerup",
    onPointerUp
  );

  handle.addEventListener(
    "pointercancel",
    onPointerUp
  );
}


/* =================================
   DOM → STATE
================================= */

function syncCurrentFromDOM(){

  const recipe =
    getEditingRecipe();

  if(!recipe) return;


  recipe.id =
    $("#idInput").value.trim();

  recipe.title =
    $("#titleInput").value.trim();

  recipe.status =
    $("#statusSelect").value;


  recipe.tags =
    $$("#tagList input")
      .map(input =>
        input.value.trim()
      );


  if(!recipe.tags.length){
    recipe.tags = [""];
  }


  $$("#ingredientList .ingredient-row")
    .forEach(row => {

      const index =
        Number(row.dataset.index);

      const item =
        recipe.ingredients[index];

      if(!item) return;

      row.querySelectorAll("input")
        .forEach(input => {

          const field =
            input.dataset.field;

          if(field){
            item[field] =
              input.value;
          }

        });

    });


  $$("#stepList .step-row")
    .forEach(row => {

      const index =
        Number(row.dataset.stepIndex);

      const step =
        recipe.steps[index];

      if(!step) return;

      const textarea =
        row.querySelector(
          "[data-step-text]"
        );

      if(textarea){
        step.text =
          textarea.value;
      }

      step.links =
        [...row.querySelectorAll(".linked-chip")]
          .map(chip =>
            chip.textContent.trim()
          );

    });


  recipe.updatedAt =
    Date.now();

}


/* =================================
   SAVE / AUTOSAVE
================================= */

function saveCurrent(){

  if(!editingId) return;

  syncCurrentFromDOM();

  saveRecipes();
}


function scheduleAutosave(){

  if(!editingId) return;

  const saveState =
    $("#saveState");

  if(saveState){
    saveState.textContent =
      "保存中…";
  }

  clearTimeout(
    autosaveTimer
  );

  autosaveTimer =
    setTimeout(() => {

      saveCurrent();

    },500);
}


/* =================================
   NEW RECIPE
================================= */

function newRecipe(){

  const recipe =
    blankRecipe();

  recipes.unshift(recipe);

  saveRecipes();

  openEditor(recipe.labId);

  setTimeout(() => {

    $("#idInput")?.focus();

  },50);
}


/* =================================
   DELETE
================================= */

function deleteRecipe(){

  const recipe =
    getEditingRecipe();

  if(!recipe) return;

  const title =
    recipe.title ||
    "このレシピ";

  const confirmed =
    window.confirm(
      `「${title}」を削除しますか？`
    );

  if(!confirmed) return;

  recipes =
    recipes.filter(
      item =>
        item.labId !== editingId
    );

  saveRecipes();

  editingId = null;

  showPage("home");

  renderHome();

  showToast(
    "レシピを削除しました"
  );
}


/* =================================
   SEARCH TEXT
================================= */

function buildSearchText(recipe){

  const values = [

    recipe.title,

    ...normalizeArray(recipe.tags),

    ...normalizeArray(recipe.ingredients)
      .filter(item =>
        item.type !== "part"
      )
      .map(item =>
        item.name
      )

  ];

  return values
    .map(value =>
      String(value || "").trim()
    )
    .filter(Boolean)
    .join(" ");
}


function updateSearchPreview(){

  const recipe =
    getEditingRecipe();

  if(!recipe) return;

  syncCurrentFromDOMWithoutTimestamp();

  $("#searchTextPreview").textContent =
    buildSearchText(recipe);
}


/* =================================
   DOM SYNC WITHOUT TOUCHING updatedAt
================================= */

function syncCurrentFromDOMWithoutTimestamp(){

  const recipe =
    getEditingRecipe();

  if(!recipe) return;


  recipe.id =
    $("#idInput").value.trim();

  recipe.title =
    $("#titleInput").value.trim();

  recipe.status =
    $("#statusSelect").value;

  recipe.tags =
    $$("#tagList input")
      .map(input =>
        input.value.trim()
      );

  if(!recipe.tags.length){
    recipe.tags = [""];
  }


  $$("#ingredientList .ingredient-row")
    .forEach(row => {

      const index =
        Number(row.dataset.index);

      const item =
        recipe.ingredients[index];

      if(!item) return;

      row.querySelectorAll("input")
        .forEach(input => {

          const field =
            input.dataset.field;

          if(field){
            item[field] =
              input.value;
          }

        });

    });
}


/* =================================
   CODE GENERATOR
================================= */

function generateCode(){

  const recipe =
    getEditingRecipe();

  if(!recipe) return;

  syncCurrentFromDOM();

  const searchText =
    buildSearchText(recipe);

  const servings =
    recipe.servings
      ? Number(recipe.servings)
      : null;

  const codeData = {

    id: recipe.id,

    name: recipe.title,

    servings,

    image: recipe.image,

    tags: recipe.tags
      .filter(Boolean),

    searchText,

    ingredients:
      recipe.ingredients.map(item => {

        if(item.type === "part"){

          return {
            type: "part",
            partId: item.partId,
            name: item.name,
            amount: item.amount,
            unit: item.unit
          };

        }

        return {
          type: "ingredient",
          name: item.name,
          amount: item.amount,
          unit: item.unit
        };

      }),

    steps:
      recipe.steps.map(step => ({
        text: step.text,
        links: normalizeArray(step.links)
      }))

  };


  const code =
`{
  id: ${JSON.stringify(codeData.id)},
  name: ${JSON.stringify(codeData.name)},
  servings: ${JSON.stringify(codeData.servings)},
  image: ${JSON.stringify(codeData.image)},
  tags: ${JSON.stringify(codeData.tags)},
  searchText: ${JSON.stringify(codeData.searchText)},
  ingredients: ${JSON.stringify(codeData.ingredients, null, 2)},
  steps: ${JSON.stringify(codeData.steps, null, 2)}
}`;

  $("#generatedCode").textContent =
    code;

  $("#codePanel").classList.remove(
    "is-hidden"
  );

  $("#copyMessage").textContent = "";

}


/* =================================
   COPY CODE
================================= */

async function copyCode(){

  const code =
    $("#generatedCode").textContent;

  if(!code) return;

  try{

    await navigator.clipboard.writeText(
      code
    );

    $("#copyMessage").textContent =
      "コピーしました";

  }catch(error){

    const textarea =
      document.createElement("textarea");

    textarea.value = code;

    document.body.appendChild(
      textarea
    );

    textarea.select();

    try{
      document.execCommand("copy");

      $("#copyMessage").textContent =
        "コピーしました";

    }catch(copyError){

      $("#copyMessage").textContent =
        "コピーできませんでした";

    }

    textarea.remove();
  }
}


/* =================================
   TOAST
================================= */

let toastTimer = null;

function showToast(message){

  const toast =
    $("#toast");

  if(!toast) return;

  toast.textContent =
    message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    },1800);
}


/* =================================
   EVENTS
================================= */

function bindEvents(){

  /* HOME */

  $("#goHome")
    .addEventListener(
      "click",
      () => {

        if(editingId){
          closeEditor();
        }else{
          showPage("home");
          renderHome();
        }

      }
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


  $("#backHome")
    .addEventListener(
      "click",
      closeEditor
    );


  /* FILTER */

  $$(".filter-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          setFilter(
            button.dataset.filter
          );

        }
      );

    });


  /* EDITOR BASIC */

  $("#idInput")
    .addEventListener(
      "input",
      () => {

        const recipe =
          getEditingRecipe();

        if(!recipe) return;

        recipe.id =
          $("#idInput").value.trim();

        scheduleAutosave();

      }
    );


  $("#titleInput")
    .addEventListener(
      "input",
      () => {

        const recipe =
          getEditingRecipe();

        if(!recipe) return;

        recipe.title =
          $("#titleInput").value.trim();

        $("#editorHeading").textContent =
          recipe.title ||
          "NEW RECIPE";

        updateSearchPreview();

        scheduleAutosave();

      }
    );


  $("#statusSelect")
    .addEventListener(
      "change",
      () => {

        const recipe =
          getEditingRecipe();

        if(!recipe) return;

        recipe.status =
          $("#statusSelect").value;

        scheduleAutosave();

      }
    );


  /* IMAGE */

  $("#imageInput")
    .addEventListener(
      "change",
      handleImageChange
    );


  $("#removeImage")
    .addEventListener(
      "click",
      removeImage
    );


  /* TAGS */

  $("#addTag")
    .addEventListener(
      "click",
      addTag
    );


  /* SERVINGS */

  $$("#servingsPicker button")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          setServings(
            button.dataset.value
          );

        }
      );

    });


  /* INGREDIENTS */

  $("#addIngredient")
    .addEventListener(
      "click",
      addIngredient
    );


  $("#addPart")
    .addEventListener(
      "click",
      addPart
    );


  /* STEPS */

  $("#addStep")
    .addEventListener(
      "click",
      addStep
    );


  /* CODE */

  $("#generateCode")
    .addEventListener(
      "click",
      generateCode
    );


  $("#copyCode")
    .addEventListener(
      "click",
      copyCode
    );


  /* DELETE */

  $("#deleteRecipe")
    .addEventListener(
      "click",
      deleteRecipe
    );


  /* BEFORE UNLOAD */

  window.addEventListener(
    "beforeunload",
    () => {

      if(editingId){
        saveCurrent();
      }

    }
  );
}


/* =================================
   INIT
================================= */

bindEvents();

showPage("home");

renderHome();