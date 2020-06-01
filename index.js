const selectors = {
  notifoList: '.phabricator-notification-list',
  notifos: '.phabricator-notification-list .phabricator-notification',
  taskInNotifo: '.phui-handle:not(.phui-link-person)'
};

const notifos = Array.from(document.querySelectorAll(selectors.notifos))
  .map(el => ({
    el,
    task: el.querySelector(selectors.taskInNotifo)
  }))
  .filter(({ task }) => !!task);

const groups = notifos.reduce((gs, n) => {
  let key = n.task.href;
  gs[key] = gs[key] || {
    title: n.task.textContent,
    href: key,
    class: n.task.className,
    children: []
  };
  gs[key].children.push(n);
  return gs;
}, {});

const notifoList = document.querySelector(selectors.notifoList);
const groupedNotifos = document.createElement('div');
const toggles = [];

Object.keys(groups).forEach((k, i) => {
  let group = groups[k];
  groupedNotifos.appendChild(renderGroup(group, i));
});

function clickIfLabel(label) {
  toggles.forEach((toggle) => {
    const toggleIcon = toggle.querySelector('span');
    if (toggleIcon.textContent === label) toggle.click();
  });
}

const buttons = document.createElement('div');
buttons.innerHTML = `
  <div style="text-align: right; padding: 5px 0;">
    <a class="expand">Expand all</a> | <a class="collapse">Collapse all</a>
  </div>
`;

buttons.querySelector('.expand').addEventListener('click', () => { clickIfLabel('◀︎'); });
buttons.querySelector('.collapse').addEventListener('click', () => { clickIfLabel('▼'); });

notifoList.appendChild(buttons);
notifoList.appendChild(groupedNotifos);

function renderGroup(group, i) {
  const container = document.createElement('div');
  container.style.padding = '0.5em 1em';
  if (i % 2 == 0) container.style.backgroundColor = '#f5f5f5';
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
  container.querySelector('h3>a').textContent = group.title;

  const toggle = container.querySelector('.toggle');
  const toggleIcon = toggle.querySelector('span');
  const read = container.querySelector('.read');
  const grouped = container.querySelector('.grouped-notifos');

  read.addEventListener('click', () => {
    const i = document.createElement('img');
    i.src = group.href;
    container.remove();
  });

  toggle.addEventListener('click', () => {
    if (toggleIcon.textContent === '◀︎') {
      toggleIcon.textContent = '▼';
      grouped.style.display = 'block';
    } else {
      toggleIcon.textContent = '◀︎';
      grouped.style.display = 'none';
    }
  });
  toggles.push(toggle);

  group.children.forEach(n => grouped.appendChild(n.el));

  return container;
}
