const selectors = {
  notifoList: ".phabricator-notification-list",
  notifos: ".phabricator-notification-list .phabricator-notification",
  taskInNotifo: ".phui-handle:not(.phui-link-person)",
  buttonsInHeader:
    ".phui-header-shell.phui-profile-header .phui-header-action-links",
};
const collapsedIcon = "◀︎";
const collapsedUpIcon = "▲";
const expandedIcon = "▼";

// Notifications list modifications

const notifos = Array.from(document.querySelectorAll(selectors.notifos))
  .map((el) => ({
    el,
    task: el.querySelector(selectors.taskInNotifo),
  }))
  .filter(({ task }) => !!task);

const groups = notifos.reduce((gs, n) => {
  let key = n.task.href;
  gs[key] = gs[key] || {
    title: n.task.textContent,
    href: key,
    class: n.task.className,
    children: [],
  };
  gs[key].children.push(n);
  return gs;
}, {});

const notifoList = document.querySelector(selectors.notifoList);
const groupedNotifos = document.createElement("div");

Object.keys(groups).forEach((k, i) => {
  let group = groups[k];
  groupedNotifos.appendChild(renderGroup(group, i));
});

notifoList.appendChild(groupedNotifos);

function renderGroup(group, i) {
  const container = document.createElement("div");
  container.style.padding = "0.5em 1em";
  if (i % 2 == 0) container.style.backgroundColor = "#f5f5f5";
  container.innerHTML = `
    <h3 class='phui-header-header'>
      <span style='float: right;'>
        <span class="read visual-only phui-icon-view phui-font-fa fa-eye-slash" aria-hidden="true" style='cursor:pointer'></span>
        <span class='toggle' style='min-width: 50px; text-align: right; display: inline-block; cursor: pointer; font-weight: bold;'>${group.children.length} <span>◀︎</span></span>
      </span>
      <a href='${group.href}' class='${group.class}'></a>
    </h3>
    <div class='grouped-notifos' style='display: none; font-size: 0.8em;'>
    </div>
  `;
  // Set title as text content to avoid html injection
  container.querySelector("h3>a").textContent = group.title;

  const toggle = container.querySelector(".toggle");
  const toggleIcon = toggle.querySelector("span");
  const read = container.querySelector(".read");
  const grouped = container.querySelector(".grouped-notifos");

  read.addEventListener("click", () => {
    const i = document.createElement("img");
    i.src = group.href;
    container.remove();
  });

  toggle.addEventListener("click", () => {
    if (toggleIcon.textContent === collapsedIcon) {
      toggleIcon.textContent = expandedIcon;
      grouped.style.display = "block";
    } else {
      toggleIcon.textContent = collapsedIcon;
      grouped.style.display = "none";
    }
  });

  group.children.forEach((n) => grouped.appendChild(n.el));

  return container;
}

// Expand collapse buttons in header

const buttonsInHeader = document.querySelector(selectors.buttonsInHeader);
const buttonClasses =
  "button button-grey has-icon has-text phui-button-default msl phui-header-action-link";
const expandClass = "expand-all-button";
const collapseClass = "collapse-all-button";
const expandCollapseButtonsHtml = `
    <a class="${expandClass} ${buttonClasses}">${expandedIcon} Expand all</a>
    <a class="${collapseClass} ${buttonClasses}">${collapsedUpIcon} Collapse all</a>
  `;
// Prepend the buttons because they are floated right for some reason...
buttonsInHeader.innerHTML =
  expandCollapseButtonsHtml + buttonsInHeader.innerHTML;

const toggles = Array.from(notifoList.querySelectorAll(".toggle"));

const expandCollapseHandler = (label) => (event) => {
  toggles.forEach((toggle) => {
    const toggleIcon = toggle.querySelector("span");
    if (toggleIcon.textContent === label) toggle.click();
  });
};

buttonsInHeader
  .querySelector(`.${expandClass}`)
  .addEventListener("click", expandCollapseHandler(collapsedIcon));
buttonsInHeader
  .querySelector(`.${collapseClass}`)
  .addEventListener("click", expandCollapseHandler(expandedIcon));
