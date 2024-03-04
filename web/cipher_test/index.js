const main = document.getElementById("main");

function createHTMLElement(elementString) {
    const div = document.createElement("div");
    div.innerHTML = elementString;
    return div.firstElementChild;
}

class PanelEntity {
    constructor(contentEntities) {
        // Setup HTML elements
        this.elPanel = createHTMLElement(`
            <div class="panel">
                <div class="panel-bar"></div>
                <div class="panel-content"></div>
            </div>`);

        this.elPanelBar = this.elPanel.querySelector(".panel-bar");
        this.elPanelContent = this.elPanel.querySelector(".panel-content");

        for (const entity of contentEntities) this.addContent(entity);

        main.appendChild(this.elPanel);

        this.elPanelBar.addEventListener("mousedown", (e) =>
            this.onMouseDown(e)
        );
        document.addEventListener("mousemove", (e) => {
            this.onMouseMove(e);
        });
        document.addEventListener("mouseup", (e) => {
            this.onMouseUp(e);
        });

        // Setup state
        this.isDragging = false;
        this.initialMouseX = 0;
        this.initialMouseY = 0;
        this.initialOffsetX = 0;
        this.initialOffsetY = 0;
    }

    addContent(entity) {
        this.elPanelContent.appendChild(entity.getHTMLElement());
    }

    setPosition(x, y) {
        this.elPanel.style.left = x + "px";
        this.elPanel.style.top = y + "px";
        if (this.isDragging) this.isDragging = false;
    }

    getHTMLElement() {
        return this.elPanel;
    }

    onMouseDown(e) {
        this.isDragging = true;
        this.initialMouseX = e.clientX;
        this.initialMouseY = e.clientY;
        this.initialOffsetX = this.elPanel.offsetLeft;
        this.initialOffsetY = this.elPanel.offsetTop;
    }

    onMouseMove(e) {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.initialMouseX;
        const deltaY = e.clientY - this.initialMouseY;
        this.elPanel.style.left = this.initialOffsetX + deltaX + "px";
        this.elPanel.style.top = this.initialOffsetY + deltaY + "px";
    }

    onMouseUp() {
        this.isDragging = false;
    }
}

class TextEntity {
    constructor(text) {
        this.elMain = createHTMLElement(
            `<div class="text-content">${text}</div>`
        );

        main.appendChild(this.elMain);
    }

    getHTMLElement() {
        return this.elMain;
    }
}

class ProcessingEntity {
    constructor(contentEntities) {
        this.elMain = new PanelEntity(contentEntities);
    }

    addContent(entity) {
        this.elMain.addContent(entity);
    }

    setPosition(x, y) {
        this.elMain.setPosition(x, y);
    }

    getHTMLElement() {
        return this.elMain.getHTMLElement();
    }
}

// ----------------------------------------------

const p1 = new PanelEntity([new TextEntity("Hello, World!")]);

const p2 = new PanelEntity([
    new TextEntity(
        "01232324334252323\n" + "45645632234456454\n" + "13231212323232"
    ),
]);

const p3 = new ProcessingEntity([new TextEntity("And again...")]);

p1.setPosition(50, 50);
p2.setPosition(100, 200);
p3.setPosition(400, 120);
