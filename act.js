
export class Act extends EventTarget {
    constructor(target, parent){
        super();

        this.addEventListener = this.addEventListener.bind(this);
        this.removeEventListener = this.removeEventListener.bind(this);
        this.dispatchEvent = this.dispatchEvent.bind(this);

        this.$target = target;
        this.$parent = parent;
    }
    get $proxy(){
        return new Proxy(this, {
            get(actInstance, prop, receiver) {
                if (prop in actInstance) {
                    // if (typeof actInstance[prop] === 'function') {
                    //     return function(...args) {
                    //         var thisVal = this === receiver ? actInstance : this;
                    //         return Reflect.apply(actInstance[prop], thisVal, args);
                    //     }
                    // }
                    return Reflect.get(actInstance, prop, receiver);
                }
                return actInstance.$get(prop);
            },
            set(actInstance, prop, value, receiver) {
                if (prop in actInstance) return Reflect.set(actInstance, prop, value, receiver);
                return actInstance.$set(prop, value);
            }
        });
    }
    $set(prop, value) {

        if (this.$target[prop]===value) return true;
        this.dispatchEvent(new CustomEvent('set', {prop, value}));

        if (typeof value === 'object') {
            value = new this.constructor(value, this).$proxy;
        } else {
            this.$target[prop] = value;
        }

        return true;
    }
    $get(prop) {
        this.dispatchEvent(new CustomEvent('get', {prop}));
        return this.$target[prop];
    }
}


// https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel
/*
Act.prototype.broadCast = function(id){
    const bc = new BroadcastChannel('act_'+id);
    this.addEventListener('set-deep',function(){
        bc.postMessage(this.target);
    })
    bc.onmessage = (e)=>{
        this.$set(e.data);
    }
}
*/

Act.obj = class extends Act {
    constructor(obj, parent){
        super(obj, parent)
    }
}


Act.fetch = class extends Act {
    constructor(url, parent) {
        super(url, parent)
        this.$url = url.replace(/\/$/,'');
    }
    $get(prop, params){
        var url = new URL(this.$url+'/'+prop);
        url.search = new URLSearchParams(params).toString();
        return fetch(url).then(res=>res.json());
    }
    $dir(prop){
        return new this.constructor(this.$url+'/'+prop);
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






Act.fs = class extends Act {
    constructor(target, parent) {
        super(target, parent);

        setTimeout( async ()=>{
            const watcher=Deno.watchFs(target);
            for await(const event of watcher) {}
        });
    }
    $set(prop, value) {
        return Deno.writeTextFile(this.$target+'/'+prop, value);
    }
    $get(prop) {
        return Deno.readTextFile(this.$target+'/'+prop);
    }

}
