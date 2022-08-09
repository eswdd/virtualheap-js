import { MutableHeap } from './heap.js'

class ImmutableHeap extends MutableHeap {
    ImmutableHeap(/*String*/ uri) {
        super(uri);
    }
    ImmutableHeap(/*String*/ uri, /*Conflater*/ newListenerConflater) {
        super(uri, newListenerConflater);
    }

    ImmutableHeap(/*String*/ uri, /*Heap*/ srcHeap, /*boolean*/ populateWithCurrentState) {
        super(uri, srcHeap, populateWithCurrentState);
    }

    constructor(/*String*/ uri, /*Heap*/ srcHeap, /*boolean*/ populateWithCurrentState, /*Conflater*/ newListenerConflater) {
        super(uri, srcHeap, populateWithCurrentState, newListenerConflater);
    }

    /*void*/ assertLock() {
        // do nothing, locks not required for immutable heaps
    }

    /*Node*/ createNode(/*int*/ id, /*NodeType*/ type) {
        /*Node*/ node;
        switch(type) {
            case LIST:
                node = new ImmutableListNode(id, this);
                break;
            case OBJECT:
                node = new ImmutableObjectNode(id, this);
                break;
            case MAP:
                node = new ImmutableMapNode(id, this);
                break;
            case SCALAR:
                node = new ImmutableScalarNode(id, this);
                break;
            default: throw new IllegalArgumentException("Can't create node for type: "+type);
        }
        return node;
    }



    /*void*/ installRoot(/*boolean*/ fromListener, /*int*/ id, /*NodeType*/ type) {
        if (!fromListener) {
            throw new ImmutableHeapException("Can't install root on an immutable heap");
        }
        super.installRoot(fromListener, id, type);
    }

    /*void*/ setScalar(/*boolean*/ fromListener, /*int*/ id, /*Object*/ value) {
        if (!fromListener) {
            throw new ImmutableHeapException("Can't set scalar on an immutable heap");
        }
        super.setScalar(fromListener, id, value);
    }

    /*void*/ removeChildren(/*boolean*/ fromListener, /*int*/ id) {
        if (!fromListener) {
            throw new ImmutableHeapException("Can't remove children on an immutable heap");
        }
        super.removeChildren(fromListener, id);
    }

    /*void*/ installIndex(/*boolean*/ fromListener, /*int*/ parentId, /*int*/ id, /*int*/ index, /*NodeType*/ type) {
        if (!fromListener) {
            throw new ImmutableHeapException("Can't install index on an immutable heap");
        }
        super.installIndex(fromListener, parentId, id, index, type);
    }

    /*void*/ removeIndex(/*boolean*/ fromListener, /*int*/ parentId, /*int*/ id) {
        if (!fromListener) {
            throw new ImmutableHeapException("Can't remove index on an immutable heap");
        }
        super.removeIndex(fromListener, parentId, id);
    }

    /*void*/ installField(/*boolean*/ fromListener, /*int*/ parentId, /*int*/ id, /*String*/ name, /*NodeType*/ type) {
        if (!fromListener) {
            throw new ImmutableHeapException("Can't install field on an immutable heap");
        }
        super.installField(fromListener, parentId, id, name, type);
    }

    /*void*/ removeField(/*boolean*/ fromListener, /*int*/ parentId, /*int*/ id) {
        if (!fromListener) {
            throw new ImmutableHeapException("Can't remove field on an immutable heap");
        }
        super.removeField(fromListener, parentId, id);
    }
}

class ImmutableListNode extends ListNode {
    constructor(/*int*/ id, /*MutableHeap*/ heap) {
        super(id, heap);
    }

    /*void*/ beforeMutation() {
        throw new ImmutableHeapException("Can't mutate an immutable heap");
    }
}

class ImmutableObjectNode extends ObjectNode {
    constructor(/*int*/ id, /*MutableHeap*/ heap) {
        super(id, heap);
    }

    /*void*/ beforeMutation() {
        throw new ImmutableHeapException("Can't mutate an immutable heap");
    }
}

class ImmutableMapNode extends MapNode {
    constructor(/*int*/ id, /*MutableHeap*/ heap) {
        super(id, heap);
    }

    /*void*/ beforeMutation() {
        throw new ImmutableHeapException("Can't mutate an immutable heap");
    }
}

class ImmutableScalarNode extends ScalarNode {
    constructor(/*int*/ id, /*MutableHeap*/ heap) {
        super(id, heap);
    }

    /*void*/ beforeMutation() {
        throw new ImmutableHeapException("Can't mutate an immutable heap");
    }
}

export {
    ImmutableHeap,
}