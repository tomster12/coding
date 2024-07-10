class Signal {
    constructor(name) {
        this.name = name;
        this.value = null;
        this.listeners = [];
        Wire.instance.registerSignals(name, this);
    }

    get() {
        return this.value;
    }

    listen(listener) {
        this.listeners.push(listener);
    }
}

class Base extends Signal {
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

class WireElementTo {
    constructor(el) {
        this.el = el;
        this.to = el.getAttribute("to");
        this.state = wire.resolveSignal(this.to);
        this.state.listen(this.render.bind(this));
        this.render();
    }

    render() {
        this.el.innerHTML = this.state.get();
    }
}

class WireElementWith {
    constructor(el) {
        this.el = el;
        this.template = el.innerHTML;
        this.with = el.getAttribute("with");
        this.state = wire.resolveSignal(this.with);
        this.state.listen(this.render.bind(this));
        this.render();
    }

    render() {
        this.el.innerHTML = wire.hydrateTemplate(this.template);
    }
}

class WireElementOver {
    constructor(el) {
        this.el = el;
        this.template = el.innerHTML;
        this.over = el.getAttribute("over");
        this.with = el.getAttribute("with");
        this.state = wire.resolveSignal(this.over);
        this.state.listen(this.render.bind(this));
        this.render();
    }

    render() {
        const list = this.state.get();
        let html = "";

        list.forEach((item) => {
            if (this.with) {
                html += wire.hydrateTemplate(this.template, { item });
            } else {
                html += wire.hydrateTemplate(this.template);
            }
        });

        this.el.innerHTML = html;
    }
}
function evalWithVariables(func, vars) {
    // TODO: Fix strictness situation
    var varString = "";
    for (var i in vars) varString += "var " + i + " = " + vars[i] + ";";
    const evalString = varString + " var result = " + func + ";";
    eval?.(evalString);

    console.log(evalString);
    console.log(result);

    return result;
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
        // Parse all wire tags in document
        const documentElements = document.getElementsByTagName("wire");
        for (const el of documentElements) {
            const attributes = el.getAttributeNames();
            const hasTo = attributes.includes("to");
            const hasWith = attributes.includes("with");
            const hasOver = attributes.includes("over");

            if (hasTo && !(hasWith || hasOver)) {
                this.wireElements.push(new WireElementTo(el));
            } else if (hasWith && !hasTo && !hasOver) {
                this.wireElements.push(new WireElementWith(el));
            } else if (hasOver && !hasTo) {
                this.wireElements.push(new WireElementOver(el));
            } else {
                console.error("Invalid wire tag attributes: ", attributes);
            }
        }
    }

    registerSignals(name, signal) {
        this.signalDict[name] = signal;
    }

    resolveSignal(name) {
        return this.signalDict[name];
    }

    hydrateTemplate(template, values = {}) {
        let hydrated = template;

        for (let i = 0; i < hydrated.length; i++) {
            if (hydrated[i] === "{") {
                let end = hydrated.indexOf("}", i);
                if (end === -1) throw new Error("Unmatched { in template");
                const code = hydrated.slice(i + 2, end);
                const result = evalWithVariables(code, values);
                hydrated = hydrated.slice(0, i) + result + hydrated.slice(end + 2);
            }
        }

        return hydrated;
    }
}

let wire = new Wire();
addEventListener("load", (e) => wire.onDocumentLoad());
