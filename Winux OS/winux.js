
class WinuxSystem {
    constructor() {
        this.windows = new Map();  // 改用Map提高查找效率
        this.windowCount = 0;
        this.initTaskbar();
        this.initContextMenu();
        this.registerDefaultApps();  // 预注册应用
    }

    registerDefaultApps() {
        this.apps = [
            { id: 'explorer', name: '文件管理器', icon: 'explorer.png' },
            { id: 'browser', name: '浏览器', icon: 'browser.png' },
            { id: 'editor', name: '文本编辑器', icon: 'editor.png' }
        ];
    }

    createWindow(title) {
        const winId = `win_${++this.windowCount}`;
        const win = new WinuxWindow(winId, title);
        this.windows.set(winId, win);
        return winId;
    }

    closeWindow(winId) {
        if(this.windows.has(winId)) {
            this.windows.get(winId).destroy();
            this.windows.delete(winId);
        }
    }

    initTaskbar() {
        document.getElementById('start-btn').addEventListener('click', () => {
            this.createWindow('开始菜单');
        });
    }

    initContextMenu() {
        const hideMenu = () => {
            document.getElementById('contextMenu').style.display = 'none';
        };

        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const menu = document.getElementById('contextMenu');
            menu.style.display = 'block';
            menu.style.left = `${Math.min(e.pageX, window.innerWidth-150)}px`;
            menu.style.top = `${Math.min(e.pageY, window.innerHeight-200)}px`;
            setTimeout(() => document.addEventListener('click', hideMenu, { once: true }));
        });
    }
}

class WinuxWindow {
    constructor(id, title) {
        this.id = id;
        this.element = document.createElement('div');
        this.element.className = 'window';
        this.element.dataset.winId = id;
        this.element.style.zIndex = 1000 + this.id.split('_')[1];
        
        this.render(title);
        document.getElementById('desktop').appendChild(this.element);
        this.makeDraggable();
        this.bindEvents();
    }

    render(title) {
        this.element.innerHTML = `
            <div class="title-bar">
                <span>${title}</span>
                <button class="close-btn">×</button>
            </div>
            <div class="content">${this.getContent(title)}</div>
        `;
    }

    getContent(title) {
        const templates = {
            '开始菜单': `<div class="start-menu">${this.apps.map(app => `
                <div class="app-item" data-app="${app.id}">
                    <img src="${app.icon}" width="32">
                    <span>${app.name}</span>
                </div>`).join('')}</div>`,
            '默认': `<p>${title} 内容区域</p>`
        };
        return templates[title] || templates['默认'];
    }

    makeDraggable() {
        const titleBar = this.element.querySelector('.title-bar');
        let isDragging = false;

        titleBar.addEventListener('mousedown', (e) => {
            if(e.target.tagName === 'BUTTON') return;
            
            isDragging = true;
            const offsetX = e.clientX - this.element.offsetLeft;
            const offsetY = e.clientY - this.element.offsetTop;

            const moveHandler = (e) => {
                if(!isDragging) return;
                this.element.style.left = `${e.clientX - offsetX}px`;
                this.element.style.top = `${e.clientY - offsetY}px`;
            };

            const upHandler = () => {
                isDragging = false;
                document.removeEventListener('mousemove', moveHandler);
                document.removeEventListener('mouseup', upHandler);
            };

            document.addEventListener('mousemove', moveHandler);
            document.addEventListener('mouseup', upHandler);
        });
    }

    bindEvents() {
        this.element.querySelector('.close-btn').addEventListener('click', () => {
            winux.closeWindow(this.id);
        });
    }

    destroy() {
        this.element.remove();
    }
}

const winux = new WinuxSystem();
