// --------------------------------------------------------------------------------------

function evalWithVariables(code, vars) {
    var varString = "";
    for (var i in vars) varString += "var " + i + " = " + JSON.stringify(vars[i]) + ";";
    eval?.(varString);
    return eval(code);
}

// --------------------------------------------------------------------------------------

class Signal {
    constructor(name) {
        this.name = name;
        this.value = null;
        this.listeners = [];
        Wire.instance.registerSignal(name, this);
    }

    get() {
        return this.value;
    }

    listen(listener) {
        this.listeners.push(listener);
    }
}

class State extends Signal {
    constructor(name, value) {
        super(name);
        this.set(value);
    }

    set(value) {
        this.value = value;
        this.listeners.forEach((l) => l(this.value));
    }
}

class Computed extends Signal {
    constructor(name, dependencies, compute) {
        super(name);
        this.dependencies = dependencies;
        this.compute = compute;
        this.dependencies.forEach((d) => d.listen(this.onDependencyChange.bind(this)));
        this.onDependencyChange();
    }

    onDependencyChange() {
        this.value = this.compute(...this.dependencies.map((d) => d.get()));
        this.listeners.forEach((l) => l(this.value));
    }
}

// --------------------------------------------------------------------------------------

class WireElement {
    static ALLOWED_ATTRIBUTES = ["to", "with", "over"];

    constructor(el) {
        this.el = el;
        this.attributes = {};

        // Extract and check attributes
        for (const attr of this.el.getAttributeNames()) {
            this.attributes[attr] = this.el.getAttribute(attr);
            if (!WireElement.ALLOWED_ATTRIBUTES.includes(attr)) {
                console.error("Invalid wire attributes: ", this.el.getAttributeNames());
                return;
            }
        }

        // Ensure correct attribute layout
        if (this.attributes.to && (this.attributes.with || this.attributes.over)) {
            console.error("Invalid wire attribute layout: ", this.attributes);
            return;
        }

        // Resolve signal to listen to
        this.listenedSignal = null;
        if (this.attributes.to) this.listenedSignal = wire.resolveSignal(this.attributes.to);
        else if (this.attributes.over) this.listenedSignal = wire.resolveSignal(this.attributes.over);
        else if (this.attributes.with) this.listenedSignal = wire.resolveSignal(this.attributes.with);
        if (!this.listenedSignal) {
            console.error("No wire attribute signal: ", this.attributes);
            return;
        }

        // Store template if needed
        if (this.attributes.over || this.attributes.with) this.template = this.el.innerHTML;

        // Listen to signal and render
        this.listenedSignal.listen(this.render.bind(this));
        this.render();
    }

    render() {
        // Directly render signal value
        if (this.attributes.to) {
            this.el.innerHTML = this.listenedSignal.get();
        }

        // Hydrate and render template for each item in list
        else if (this.attributes.over) {
            const list = this.listenedSignal.get();
            this.el.innerHTML = list.reduce((acc, item) => {
                let values = this.attributes.with ? { item } : {};
                return acc + wire.hydrateTemplate(this.template, values);
            }, "");
        }

        // Hydrate and render template
        else if (this.attributes.with) {
            this.el.innerHTML = wire.hydrateTemplate(this.template);
        }
    }
}

class Wire {
    static instance = null;
    wireElements = [];
    signalDict = {};

    constructor() {
        if (Wire.instance != null) throw new Error("Wire instance already exists");
        Wire.instance = this;
    }

    onDocumentLoad() {
        const documentElements = document.getElementsByTagName("wire");
        for (const el of documentElements) this.wireElements.push(new WireElement(el));
    }

    registerSignal(name, signal) {
        this.signalDict[name] = signal;
    }

    resolveSignal(name) {
        return this.signalDict[name];
    }

    hydrateTemplate(template, variables = {}) {
        let hydrated = template;
        for (let i = 0; i < hydrated.length; i++) {
            if (hydrated[i] === "{") {
                if (i == hydrated.length - 1) throw new Error("Unmatched '{' in template (found single '{' at EOF)");
                if (hydrated[i + 1] !== "{") throw new Error("Unmatched '{' in template (found single '{')");
                let end = hydrated.indexOf("}", i);
                if (end === -1) throw new Error("Unmatched '{' in template (could not find closing '}')");
                if (end == i + 2) throw new Error("Empty code block in template");
                if (end == hydrated.length - 1) throw new Error("Unmatched '}' in template (found single '}' at EOF)");
                if (hydrated[end + 1] !== "}") throw new Error("Unmatched '}' in template (found single '}')");
                const code = hydrated.slice(i + 2, end);
                const result = evalWithVariables(code, variables);
                hydrated = hydrated.slice(0, i) + result + hydrated.slice(end + 2);
            }
        }
        return hydrated;
    }
}

// --------------------------------------------------------------------------------------

let wire = new Wire();
addEventListener("load", (e) => wire.onDocumentLoad());
