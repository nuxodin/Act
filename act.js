



export class Act extends EventTarget {
    constructor(target, parent){
        super();
        this.$target = target;
        this.$parent = parent;
    }
    get $proxy(){
        return new Proxy(this, {
            get(target, prop, receiver) {
                return target.$get(prop);
            },
            set(target, prop, value, receiver) {
                return target.$set(prop, value);
            }
        });
    }
    $set(prop, value) {
        console.log(this)
        if (this.$target[prop]!==value) {
            this.dispatchEvent(new CustomEvent('set', {prop, value}));
            this.$target[prop] = value;
        }
        return true;
    }
    $get(prop) {
        this.dispatchEvent(new CustomEvent('get', {prop}));
        return this.$target[prop];
    }
}






Act.obj = class extends Act {
    constructor(obj, parent){
        super(obj, parent)
        this.$target = obj
        this.$parent = parent;
    }
    $set(prop, value) {
        //super(prop);
        this.$target[prop] = value;
    }
    $get(prop) {
        //super(prop);
        return this.$target[prop];
    }
}


Act.fetch = class extends Act {
    constructor(url) {
        this.$Url = new Url(url);
    }
    $get(prop){
        return fetch(this.$url+'/'+prop).then(res=>res.body());
    }
    async $set(prop, value){
        const response = await fetch(this.$url+'/'+prop, {
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
