



Act = class extends EventTarget {
    constructor(target, parent){
        this.target = target;
        this.$parent = parent;
    }
    $set(name, value) {
        if (this.target[name]===value) return; //
    }
    $get(name) {
        return this.target[name];
        this.dispatchEvent(new CustomEvent('get', {name}));
        this.$trigger('get-in');
    }
}




Act.obj = class extends Act {
    constructor(obj, parent){
        this.target = obj
        this.$parent = parent;
    }
    $set(name, value) {
        super(name);
        this.target[name] = value;
    }
    $get(name) {
        super(name);
        return this.target[name];
    }
}


Act.fetch = class extends Act {
    constructor(url) {
        this.$Url = new Url(url);
    }
    $get(name){
        return fetch(this.$url+'/'+name).then(res=>res.body());
    }
    $set(name, value){
        const response = await fetch(this.$url+'/'+name, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            redirect: 'follow',
            //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(value) // body data type must match "Content-Type" header
        });
        return response.json();
    }
}


Act.denoFs = class extends Act {
    consturctor(root) {
        this.root = root;
    }

}
