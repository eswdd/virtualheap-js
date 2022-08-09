import { InstallField, InstallIndex, RemoveChildren, SetScalar } from './updates.js'

/*enum*/
class NodeType {
    static LIST = new NodeType("LIST");
    static MAP = new NodeType("MAP");
    static OBJECT = new NodeType("OBJECT");
    static SCALAR = new NodeType("SCALAR");

    constructor(name) {
        this._name = name;
    }
    toString() {
        return `NodeType.${this._name}`;
    }
}


class Node {

    constructor(/*int*/id, /*Heap*/heap) {
        this._id = id;
        this._heap = heap;
        // /*int*/
        this._index = 0;
        // String
        this._name = null;
        // Object
        this._projection = null;
    }


    /*void*/ visitChildren(/*NodeVisitor*/visitor) {
    }



    /*void*/ project(/*NodeProjector*/projector) {
        if (this._projection == null) {
            this._projection = projector.project(this);
        }
        return this._projection;
    }



    /*int*/ getId() {
        return this._id;
    }



    /*NodeType*/ getType() {
        throw new Error("Not implemented");
    }



    /*void*/ beforeMutation() {
        this._heap.assertCanUpdate();
    }


    /*String*/ toString() {

        return "Node{" +

        "id=" + this._id +

        ", heap=" + this._heap +

        ", index=" + this._index +

        ", name='" + this._name + '\'' +

        ", NodeType='" + getType() + '\'' +

        ", projection=" + this._projection +

        '}';

    }



    /*String*/ prettyPrint() {
        return this.prettyPrint(0, false);
    }



    /*String*/ prettyPrint(/*int*/ depth, /*boolean*/ collapse) {
        throw new Error("Not implemented.");
    }

}


class CollectionNode {
    /*int*/
    size() {
        throw new Error("Not implemented.");
    }
}

/*implements CollectionNode*/
class ListNode extends Node {

    constructor(/*int*/ id, /*MutableHeap*/ heap) {
        super(id, heap);
        if (heap == null || heap.constructor.name != "MutableHeap") {
            throw new Error("Expecting a MutableHeap: "+heap.constructor.name);
        }
        /*List<Node>*/
        this._children = [];
    }

    /*Node*/ 
    installIndex(/*boolean*/ fromListener, /*int*/ id, /*int*/ index, /*NodeType*/ type) {
        if (!fromListener) {
            this.beforeMutation();
        }
        const child = this._heap.allocateNode(id, type);
        child.index = index;
        this._children.splice(index, 0, child);
        //re-index
        for (let i = index + 1; i < this._children.length; i++) {
            this._children[i].index = i;
        }
        this._heap.emit(new InstallIndex(this.getId(), id, index, type));
        return child;
    }

    /*void*/
    removeById(/*boolean*/ fromListener, /*int*/ id) {
        if (!fromListener) {
            this.beforeMutation();
        }
        const deallocatedIds = new Set();
        const child = heap.getNode(id);
        this._children.splice(index, 1);
        //re-index
        for (let i = child.index; i < this._children.length; i++) {
            const next = this._children[i];
            next.index = i;
        }
        this._heap.deallocateNode(fromListener, child, deallocatedIds);
        deallocatedIds.add(child.getId());
        this._heap.emit(new RemoveIndex(this.getId(), id, child.index, deallocatedIds));
    }

    /*Node*/ 
    getIndexAt(/*int*/ index) {
        return this._children.get(index);
    }

    /*Node*/ 
    insertAt(/*int*/ index, /*NodeType*/ type) {
        return this.installIndex(false, this._heap.allocateId(), index, type);
    }

    /*void*/
    removeIndex(/*int*/ index) {
        this.removeById(false, this._children.get(index).getId());
    }

    /*void*/
    visitChildren(/*NodeVisitor*/ visitor) {
        this._children.forEach(child => {
            visitor.visitNode(child);
            child.visitChildren(visitor);
        });
    }

    /*void*/
    clear(/*boolean*/ fromListener = false) {
        if (!fromListener) {
            this.beforeMutation();
        }
        if (this.size() == 0) {
            return;
        }

        const deallocatedIds = new Set();
        this._children.forEach(child => {
            this._heap.deallocateNode(fromListener, child, deallocatedIds);
            deallocatedIds.add(child.getId());
        });
        this._children.splice(0, this._children.length);
        this._heap.emit(new RemoveChildren(this._id, deallocatedIds));
    }

    /*int*/ 
    size() {
        return this._children.length;
    }

    /*String*/
    toString() {
        let s = "[";
        let sep = "";
        this._children.forEach(child => {
            s += sep + child.getId();
            sep = ", ";
        });
        return s + "]";
    }

    /*String*/
    prettyPrint(/*int*/ depth, /*boolean*/ collapse) {
        let s = "[";
        let sep = "";
        this._children.forEach(child => {
            s += sep + child.prettyPrint(depth, true);
            sep = ", ";
            i++;
        });
        return s + "]";
    }

    /*NodeType*/ 
    getType() {
        return NodeType.LIST;
    }

    /*boolean*/
    equals(o) {
        if (this == o) {
            return true;
        }
        if (o == null || typeof(this) != typeof(o)) {
            return false;
        }

        if (this._children != null ? !this._children.equals(o._children) : o._children != null) {
            return false;
        }

        return true;
    }

    /*List<Node>*/ 
    children() {
        return this._children;
    }

}
 
/*implements CollectionNode*/
class MapNode extends Node {

    constructor(/*int*/ id, /*Heap*/ heap) {
        super(id, heap);
        if (heap == null || heap.constructor.name != "MutableHeap") {
            throw new Error("Expecting a MutableHeap: "+heap.constructor.name);
        }
        /*Map<String, Node>*/
        this._children = {};
    }

    /*Node*/ 
    installField(/*boolean*/ fromListener, /*int*/ id, /*String*/ name, /*NodeType*/ type) {
        if (!fromListener) {
            this.beforeMutation();
        }
        //console.log("parentId = "+this._id);
        const child = this._heap.allocateNode(id, type);
        child.name = name;
        this._children[name] = child;
        this._heap.emit(new InstallField(this._id, id, name, type));
        return child;
    }

    /*void*/ 
    removeField(/*boolean*/ fromListener, /*Node*/ child) {
        if (!fromListener) {
            this.beforeMutation();
        }
        if (child == null) {
            return;
        }

        const deallocatedIds = new Set();
        this._children.remove(child.name);
        this._heap.deallocateNode(fromListener, child, deallocatedIds);
        this._deallocatedIds.add(child.getId());
        this._heap.emit(new RemoveField(this.getId(), child.getId(), child.name, deallocatedIds));
    }

    /*void*/ removeField(/*boolean*/ fromListener, /*int*/ id) {
        const child = this._heap.getNode(id);
        this.removeField(fromListener, child);
    }

    /*Node*/ getField(/*String*/ name) {
        return this._children[name];
    }

    /*Node*/ ensureField(/*String*/ name, /*NodeType*/ type) {
        let node = this.getField(name);
        if (node == null) {
            node = this.installField(false, this._heap.allocateId(), name, type);
        }
        return node;
    }

    /*void*/ removeField(/*String*/ name) {
        this.removeField(false, this._children[name]);
    }

    /*int*/ size() {
        return this._children.length
    }

    /*void*/ clear(/*boolean*/ fromListener = false) {
        if (this.size() == 0) {
            return;
        }

        if (!fromListener) {
            this.beforeMutation();
        }
        const deallocatedIds = new Set();
        for (const [key, child] of Object.entries(this._children)) {
            this._heap.deallocateNode(fromListener, child, deallocatedIds);
            deallocatedIds.add(child.getId());
        }
        this._children = {};
        this._heap.emit(new RemoveChildren(this.getId(), deallocatedIds));
    }

    /*void*/ visitChildren(/*NodeVisitor*/ visitor) {
        for (const [key, child] of Object.entries(this._children)) {
            visitor.visitNode(child);
            child.visitChildren(visitor);
        }
    }

    /*String*/ toString() {
        let s = "{";
        let sep = "";
        for (const [key, value] of Object.entries(this._children)) {
            s += sep + key + ":" + value.getId();
            sep = ", ";
        }
        s += "}";
        return s;
    }

    /*String*/ prettyPrint(/*int*/ depth, /*boolean*/ collapse) {
        let sb = "";
        if (!collapse) {
            for (/*int*/ i = 0; i < depth; i++) {
                sb += "  ";
            }
        }
        sb += '{';
        let sep = "";
        for (const [key, value] of Object.entries(this._children)) {
            if (!collapse) {
                sb += "\n";
                for (/*int*/ i = 0; i <= depth; i++) {
                    sb += "  ";
                }
            }
            sb += sep + key + ": " + value.prettyPrint(depth + 1, collapse);
            sep = ", ";
        }
        if (!collapse) {
            sb += "\n";
            for (/*int*/ let i = 0; i < depth; i++) {
                sb += "  ";
            }
        }
        return sb + '}';
    }

    /*NodeType*/ getType() {
        return NodeType.MAP;
    }

    /*Set<String>*/ getFields() {
        return new Set(Object.keys(this._children));
    }

    /*boolean*/
    equals(o) {
        if (o == null || typeof(this) != typeof(o)) {
            return false;
        }

        if (this._children != null ? !this._children.equals(o._children) : o._children != null) {
            return false;
        }

        return true;
    }

}

class ObjectNode extends MapNode {

    constructor(/*int*/ id, /*Heap*/ heap) {
        super(id, heap);
    }

    /*NodeType*/ getType() {
        return NodeType.OBJECT;
    }
}

class ScalarNode extends Node {

    constructor(/*int*/ id, /*MutableHeap*/ heap) {
        super(id, heap);
        if (heap == null || heap.constructor.name != "MutableHeap") {
            throw new Error("Expecting a MutableHeap: "+heap.constructor.name);
        }
        this._value = null;
    }

    /*void*/ set(/*T*/ newValue, /*boolean*/ fromListener = false) {
        if (!fromListener) {
            this.beforeMutation();
        }
        if (this._value == null && newValue == null) {
            return;
        }
        if (this._value != null && newValue != null && this._value === newValue) {
            return;
        }

        this._value = newValue;
        this._heap.emit(new SetScalar(this._id, this._value));
    }

    /*T*/ get() {
        return this._value;
    }

    /*String*/ prettyPrint(/*int*/ depth, /*boolean*/ collapse) {
        return toString();
    }

    /*String*/ toString() {
        return this._value + "";
    }

    /*NodeType*/ getType() {
        return NodeType.SCALAR;
    }

    /*boolean*/
    equals(o) {
        if (o == null || typeof(this) != typeof(o)) {
            return false;
        }

        if (this._value != null ? this._value != o._value : o._value != null) {
            return false;
        }

        return true;
    }

}


class NodeVisitor {

	/*void*/ visitNode(/*Node*/ node) {
        throw new Error("Not implemented.");
    }

}

export {
    Node,
    NodeType,
    CollectionNode,
    ListNode,
    MapNode,
    ObjectNode,
    ScalarNode,
    NodeVisitor
}