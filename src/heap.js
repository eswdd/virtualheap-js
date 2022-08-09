import { NodeVisitor, NodeType, ObjectNode, ScalarNode, ListNode, MapNode } from './node.js';
import { UpdateBlock, UpdateType, InstallField, InstallIndex, InstallRoot, RemoveField, RemoveIndex, SetScalar, TerminateHeap } from './updates.js';

class ObservableHeap {
    constructor() {
        this._listeners = null;
    }

    /*void*/ addListener(/*HeapListener*/ listener) {
        if (this._listeners == null) {
            this._listeners = new Set();
        }
        this._listeners.add(listener);
    }

    /*void*/ removeListener(/*HeapListener*/ listener) {
        if (this._listeners != null) {
            this._listeners.remove(listener);
        }
    }

    /*Set<HeapListener>*/ getListeners() {
        return this._listeners;
    }

    /*void*/ onEndUpdate(/*UpdateBlock*/ block) {
        if (this._listeners != null && block.list().length != 0) {
            this._listeners.forEach(listener => {
                listener.applyUpdate(block);
            });
        }
    }

    /*void*/ emit(/*Update*/ delta) {
        throw new Error("Not implemented");
    }
}

class Heap extends ObservableHeap {

    // ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    constructor(/*String*/ uri) {
        super();
        this._uri = uri;
        // todo: lock
        this._meAsListener = null;
        this._terminated = false;
        this._currentUpdates = null;
    }

    /*String*/ getUri() {
        return this._uri;
    }

    /**
     * Get this heap as a listener. Allows chaining of heaps.
     */
    /*HeapListener*/ asListener() {
        if (this._meAsListener == null) {
            const me = this;
            this._meAsListener = {

                /*void*/ applyUpdate: function(/*UpdateBlock*/ update) {
                    me.beginUpdate();
                    update.list().forEach(u => {
                        //console.log(u)
                        switch (u.getUpdateType()) {
                            case UpdateType.INSTALL_ROOT:
                                me.installRoot(true, u.getId(), u.getType());
                                break;
                            case UpdateType.INSTALL_FIELD:
                                me.installField(true, u.getParentId(), u.getId(),
                                                       u.getName(), u.getType());
                                break;
                            case UpdateType.INSTALL_INDEX:
                                me.installIndex(true, u.getParentId(), u.getId(),
                                                       u.getIndex(), u.getType());
                                break;
                            case UpdateType.SET_SCALAR:
                                me.setScalar(true, u.getId(), u.getValue());
                                break;
                            case UpdateType.REMOVE_FIELD:
                                me.removeField(true, u.getParentId(), u.getId());
                                break;
                            case UpdateType.REMOVE_INDEX:
                                me.removeIndex(true, u.getParentId(), u.getId());
                                break;
                            case UpdateType.REMOVE_CHILDREN:
                                me.removeChildren(true, u.getId());
                                break;
                            case UpdateType.TERMINATE_HEAP:
                                me.terminateHeap();
                                break;
                            default:
                                throw new Error("Unrecognised update type: "+u.getUpdateType());
                        }
                    });
                    me.endUpdate();
                }
            };
        }
        return this._meAsListener;
    }

    /*void*/ beginUpdate() {
        // todo: locking
        //lock.writeLock().lock();
        if (this._currentUpdates !=null) {
            throw new Error("Heap has current update block, did you finish the previous update?");
        }
        this._currentUpdates = new Array();
    }

    /*UpdateBlock*/ endUpdate() {
        try {
            this.assertHaveUpdateBlock();
            const block = new UpdateBlock(this._currentUpdates);
            this.onEndUpdate(block);
            this._currentUpdates = null;
            return block;
        }
        finally {
            // todo: locking
            //lock.writeLock().unlock();
        }
    }

    /*void*/ terminateHeap() {
        this.assertLock();
        this._terminated = true;
        this.emit(new TerminateHeap());
    }

    /*boolean*/ isTerminated() {
        return this._terminated;
    }

    /*void*/ addListener(/*HeapListener*/ listener, /*boolean*/ populateWithCurrentState) {
        // todo: locking
        // if (lock.writeLock().isHeldByCurrentThread()) {
            // throw new IllegalStateException("Listeners cannot be added whilst holding the lock");
        // }
        // lock.readLock().lock();
        try {
            // pass the current state to the listener
            if (populateWithCurrentState) {
                this.traverse(listener);
            }
            super.addListener(listener);
        } finally {
            // lock.readLock().unlock();
        }
    }

    /*boolean*/ isRootInstalled() {
        throw new Error("Not implemented.")
    }

    /*Node*/ ensureRoot(/*NodeType*/ type) {
        throw new Error("Not implemented.")
    }

    /*Node*/ getRoot() {
        throw new Error("Not implemented.")
    }

    /*void*/ traverse(/*HeapListener*/ listener) {
        throw new Error("Not implemented.")
    }

    // ---- Protected methods

    /*void*/ assertLock() {
        // todo: locking
        // if (!lock.writeLock().isHeldByCurrentThread()) {
            // throw new Error("Lock not held by current thread");
        // }
    }

    /*void*/ assertNotTerminated() {
        if (this._terminated) {
            throw new Error("/*Heap*/ has been terminated and so can't take further updates");
        }
    }

    /*void*/ assertHaveUpdateBlock() {
        if (this._currentUpdates ==null) {
            throw new Error("/*Heap*/ doesn't have a current update block");
        }
    }

    /*void*/ removeField(/*boolean*/ fromListener, /*int*/ parentId, /*int*/ id) {
        throw new Error("Not implemented.")
    }

    /*void*/ removeIndex(/*boolean*/ fromListener, /*int*/ parentId, /*int*/ id) {
        throw new Error("Not implemented.")
    }

    /*void*/ installField(/*boolean*/ fromListener, /*int*/ parentId, /*int*/ id, /*String*/ name, /*NodeType*/ type) {
        throw new Error("Not implemented.")
    }

    /*void*/ installRoot(/*boolean*/ fromListener, /*int*/ id, /*NodeType*/ type) {
        throw new Error("Not implemented.")
    }

    /*void*/ setScalar(/*boolean*/ fromListener, /*int*/ id, /*Object*/ value) {
        throw new Error("Not implemented.")
    }

    /*void*/ removeChildren(/*boolean*/ fromListener, /*int*/ id) {
        throw new Error("Not implemented.")
    }

    /*void*/ installIndex(/*boolean*/ fromListener, /*int*/ parentId, /*int*/ id, /*int*/ index, /*NodeType*/ type) {
        throw new Error("Not implemented.")
    }

    // --- Package methods

    /*void*/ emit(/*Update*/ delta) {
        if (this._currentUpdates ==null) {
            throw new Error("Being asked to emit an delta, yet we don't appear to have started an update");
        }
        this._currentUpdates.push(delta);
    }

    /*void*/ assertCanUpdate() {
        throw new Error("Not implemented.")
    }

    /*int*/ allocateId() {
        throw new Error("Not implemented.")
    }

    /*Node*/ allocateNode(/*int*/ id, /*NodeType*/ type) {
        throw new Error("Not implemented.")
    }

    /*void*/ deallocateNode(/*boolean*/ fromListener, /*Node*/ node, /*final Set<Integer>*/ deallocatedIds) {
        throw new Error("Not implemented.")
    }

    /*Node*/ getNode(/*int*/ id) {
        throw new Error("Not implemented.")
    }

}



class HeapDiff {

    static /*HeapDiffBuilder*/ getHeapDiffFrom(/*Heap*/ from) {
        return new HeapDiffBuilder(from);
    }

    static /*UpdateBlock*/ getHeapDiff(/*Heap*/ to, /*Heap*/ from) {
        /*Node*/ toRoot = to.getRoot();
        /*Node*/ fromRoot = from.getRoot();

        const installs = [];
        const removes = [];

        if (fromRoot == null) {
            if (toRoot != null) {
                // Empty heap - simply add everything
                installs.push(new InstallRoot(toRoot.getId(), toRoot.getType()));
                deepAdd(toRoot, installs);
            }
        } else {
            if (toRoot == null) {
                throw new Error("Cannot update a non-empty heap to an empty heap (cannot uninstall root nodes)");
            }
            getUpdates(toRoot, fromRoot, installs, removes);
        }

        const diffs = new Array(removes);
        diffs.append(installs);

        return new UpdateBlock(diffs);
    }

    static /*void*/ getUpdates(/*Node*/ toNode, /*Node*/ fromNode, /*List<Update>*/ installs, /*List<Update>*/ removes) {
        if (toNode.getType() != fromNode.getType()) {
            throw new IllegalArgumentException("Error generating heap diff");
        }
        switch (toNode.getType()) {
            case MAP:
            case OBJECT:
                getMapUpdates(toNode, fromNode, installs, removes);
                break;
            case LIST:
                getListUpdates(toNode, fromNode, installs, removes);
                break;
            case SCALAR:
                getScalarUpdates(toNode, fromNode, installs);
                break;
            default:
                throw new Error("Unknown NodeType: " + toNode.getType());

        }
    }

    static /*void*/ getListUpdates(/*ListNode*/ toNode, /*ListNode*/ fromNode, /*List<Update>*/ installs, /*List<Update>*/ removes) {

        // get the longest common subsequence
        const lcs = lcs(toNode, fromNode);

        // Remove everything from 2 that isn't in lcs
        let index = 0;
        for ( ; index < lcs.length && index < fromNode.size(); index++) {
            const fromLcs = lcs[i];
            let fromListTwo;
            while (!nodesEqualExclIndex(fromLcs, fromListTwo = fromNode.getIndexAt(index++))) {
                removes.add(new RemoveIndex(fromNode.getId(), fromListTwo.getId(), fromListTwo.index, null));
            }
            getUpdates(fromLcs, fromListTwo, installs, removes);
        }
        for (let i = index; i < fromNode.size(); i++) {
            const toRemove = fromNode.getIndexAt(i);
            removes.add(new RemoveIndex(fromNode.getId(), toRemove.getId(), toRemove.index, null));
        }

        // Add everything in 1 that isn't in lcs
        index = 0;
        for ( ; index < lcs.length && index < toNode.size(); index++) {
            const fromLcs = lcs[i];
            let fromListOne;
            while (!nodesEqualExclIndex(fromLcs, fromListOne = toNode.getIndexAt(index++))) {
                installs.add(new InstallIndex(toNode.getId(), fromListOne.getId(), fromListOne.index, fromListOne.getType()));
                deepAdd(fromListOne, installs);
            }
        }
        for (let i = index; i < toNode.size(); i++) {
            const toInstall = toNode.getIndexAt(i);
            installs.add(new InstallIndex(toNode.getId(), toInstall.getId(), toInstall.index, toInstall.getType()));
            deepAdd(toInstall, installs);
        }

    }

    static /*List<Node>*/ lcs(/*ListNode*/ one, /*ListNode*/ two) {
        const table = new int[one.size() + 1][two.size() +1];
        for (/*int*/ i = 0; i < table.length; i++) {
            for (/*int*/ j = 0; j < table[0].length; j++) {
                if (i == 0 || j == 0) {
                    table[i][j] = 0;
                } else if (nodesEqualExclIndex(one.getIndexAt(i-1), two.getIndexAt(j-1))) {
                    table[i][j] = table[i-1][j-1] + 1;
                } else {
                    table[i][j] = Math.max(table[i-1][j], table[i][j-1]);
                }
            }
        }

        /*List<Node>*/ function reconstruct(/*int*/ x, /*int*/ y) {
            if (x == 0 || y == 0) {
                return [];
            } else if (nodesEqualExclIndex(one.getIndexAt(x - 1), two.getIndexAt(y - 1))) {
                const list = reconstruct(x-1, y-1);
                list.add(one.getIndexAt(x-1));
                return list;
            } else if (table[x-1][y] > table[x][y-1]) {
                return reconstruct(x-1, y);
            } else {
                return reconstruct(x, y-1);
            }
        }

        return new Reconstructor().reconstruct(one.size(), two.size());
    }

    static /*void*/ getScalarUpdates(/*ScalarNode*/ toNode, /*ScalarNode*/ fromNode, /*List<Update>*/ installs) {
        if (!equalsNullSafe(toNode.get(), fromNode.get())) {
            installs.add(new SetScalar(fromNode.getId(), toNode.get()));
        }
    }

    static /*void*/ getMapUpdates(/*MapNode*/ toNode, /*MapNode*/ fromNode, /*List<Update>*/ installs, /*List<Update>*/ removes) {
        const inOneNotTwo = difference(toNode.getFields(), fromNode.getFields());
        for (const field in inOneNotTwo) {
            const child = toNode.getField(field);
            installs.add(new InstallField(fromNode.getId(), child.getId(), field, child.getType()));
            deepAdd(child, installs);
        }
        const inTwoOneNot = difference(fromNode.getFields(), toNode.getFields());
        for (const field in inTwoOneNot) {
            const child = fromNode.getField(field);
            removes.add(new RemoveField(fromNode.getId(), child.getId(), child.name, null));
        }
        // Possible that we have children with the same name but are actually different
        const inBoth = intersection(toNode.getFields(), fromNode.getFields());
        for (const field in inBoth) {
            const oneChild = toNode.getField(field);
            const twoChild = fromNode.getField(field);
            if (!nodesEqual(oneChild, twoChild)) {
                removes.add(new RemoveField(fromNode.getId(), twoChild.getId(), twoChild.name, null));
                installs.add(new InstallField(fromNode.getId(), oneChild.getId(), oneChild.name, oneChild.getType()));
                deepAdd(oneChild, installs);
            } else {
                getUpdates(oneChild, twoChild, installs, removes);
            }
        }

    }

    // Called when a new node has been added, so we want to add all of its children
    static /*void*/ deepAdd(/*Node*/ node, /*List<Update>*/ installs) {
        switch (node.getType()) {
            case MAP:
            case OBJECT:
                for (const field in node.getFields()) {
                    const child = node.getField(field);
                    installs.add(new InstallField(node.getId(), child.getId(), field, child.getType()));
                    deepAdd(child, installs);
                }
                break;
            case LIST:
                for (let i = 0; i < node.size(); i++) {
                    const child = node.getIndexAt(i);
                    installs.add(new InstallIndex(node.getId(), child.getId(), i, child.getType()));
                    deepAdd(child, installs);
                }
                break;
            case SCALAR:
                if (node.get() != null) {
                    installs.add(new SetScalar(node.getId(), node.get()));
                }
                break;
            default:
                throw new Error("Unknown NodeType: " + node.getType());
        }
    }

    static /*boolean*/ equalsNullSafe(/*Object*/ a, /*Object*/ b) {
        return a == null ? b == null : a.equals(b);
    }

    static /*boolean*/ nodesEqualExclIndex(/*Node*/ a, /*Node*/ b) {
        return a.getType() == b.getType() &&
                a.getId() == b.getId() &&
                equalsNullSafe(a._name, b._name);
    }

    static /*boolean*/ nodesEqual(/*Node*/ a, /*Node*/ b) {
        return nodesEqualExclIndex(a, b) &&
                a.index == b.index;
    }

    static /*Set<String>*/ difference(/*Set<String>*/ a, /*Set<String>*/ b) {
        const _difference = new Set(a);
        for (const elem of b) {
            _difference.delete(elem);
        }
        return _difference;
    }

    static /*Set<String>*/ intersection(/*Set<String>*/ a, /*Set<String>*/ b) {
        const _intersection = new Set();
        for (const elem of b) {
            if (a.has(elem)) {
            _intersection.add(elem);
            }
        }
        return _intersection;
    }

}

class HeapDiffBuilder {
    HeapDiffBuilder(/*Heap*/ fromHeap) {
        this._fromHeap = fromHeap;
    }

    /*UpdateBlock*/ to(/*Heap*/ toHeap) {
        return getHeapDiff(toHeap, this._fromHeap);
    }
}

class HeapListener {

    /*void*/ applyUpdate(/*UpdateBlock*/ update) {
        throw new Error("Not implemented")
    }

}

class MutableHeap extends Heap {

    ///*int*/ idgen = 0;
    // previously deallocated ids which are available for reuse
    // Queue<Integer> availableIds = new ArrayDeque<Integer>();
    //List<Node> heap = new ArrayList<Node>();
    ///*Node*/ root = null;
    ///*Heap*/ srcHeap;
    ///*Conflater*/ newListenerConflater;
    ///*UpdateBlock*/ newListenerState = new UpdateBlock();


    constructor(/*String*/ uri, /*Heap*/ srcHeap = null, /*boolean*/ populateWithCurrentState = false, /*Conflater*/ newListenerConflater = null) {
        super(uri);
        this._idgen = 0;
        this._availableIds = [];
        this._heap = [];
        this._root = null;
        this._newListenerState = new UpdateBlock();

        this._newListenerConflater = newListenerConflater;
        this._srcHeap = srcHeap;
        if (srcHeap) {
            srcHeap.addListener(asListener(), populateWithCurrentState);
        }
    }

    /*void*/ disconnectFromSourceHeap() {
        if (this._srcHeap != null) {
            this._srcHeap.removeListener(asListener());
            this._srcHeap = null;
        }
    }

    /*int*/ allocateId() {
        if (this._availableIds.length != 0) {
            return this._availableIds.shift();
        }
        return this._idgen++;
    }

    /*Node*/ allocateNode(/*int*/ id, /*NodeType*/ type) {
        const node = this.createNode(id, type);
        while (this._heap.length <= id) {
            this._heap.push(null);
        }
        this._heap[id] = node;
        return node;
    }

    /*Node*/ createNode(/*int*/ id, /*NodeType*/ type) {
        switch (type) {
            case NodeType.LIST:
                return new ListNode(id, this);
            case NodeType.MAP:
                return new MapNode(id, this);
            case NodeType.OBJECT:
                return new ObjectNode(id, this);
            case NodeType.SCALAR:
                return new ScalarNode(id, this);
            default:
                throw new Error("Can't create node for type: " + type);
        }
    }

    /*void*/ deallocateNode(/*boolean*/ fromListener, /*Node*/ node, /*final Set<Integer>*/ deallocatedIds) {
        this._heap[node.getId()], null;
        if (!fromListener) {
            this._availableIds.push(node.getId());
        }
        const heap = this._heap;
        const availableIds = this._availableIds;
        node.visitChildren({
            visitNode: function(child) {
                heap[child.getId()] = null;
                deallocatedIds.add(child.getId());
                if (!fromListener) {
                    availableIds.push(child.getId());
                }
            }
        });
    }

    /*Node*/ ensureRoot(/*NodeType*/ type) {
        if (this._root != null) {
            if (!this._root.getType().equals(type)) {
                throw new Error("Can't change node type of an existing root node");
            }
            return this._root;
        }
        this.installRoot(false, this.allocateId(), type);
        return this._root;
    }

    /*Node*/ getNode(/*int*/ id) {
        return this._heap[id];
    }

    /*Node*/ getRoot() {
        return this._root;
    }

    /*boolean*/ isRootInstalled() {
        return this._root != null;
    }

    /*void*/ onEndUpdate(/*UpdateBlock*/ block) {
        if (this._newListenerConflater != null) {
            this._newListenerState = this._newListenerConflater.conflate(this._newListenerState, block);
        }
        super.onEndUpdate(block);
    }

    /**
     * Give the current state of this heap to the given listener. Requires that this listener is not already listening to the heap.
     */
    /*void*/ traverse(/*HeapListener*/ listener) {
        // todo: locking
        //lock.readLock().lock();
        try {
            if (this.getListeners() != null && this.getListeners().contains(listener)) {
                throw new Error("Passed listener is already listening to this heap!");
            }
            if (this._newListenerConflater != null) {
                listener.applyUpdate(this._newListenerState);
            }
            else {
                const updates = new HeapCopyingNodeVisitor().copy(getRoot());

                // last thing if we're there..
                if (this._terminated) {
                    updates.add(new TerminateHeap());
                }
                listener.applyUpdate(new UpdateBlock(updates));
            }
        }
        finally {
            // todo: locking
            //lock.readLock().unlock();
        }
    }

    // --- Package methods

    /*void*/ assertCanUpdate() {
        this.assertLock();
        this.assertHaveUpdateBlock();
        this.assertNotTerminated();
    }

    // ---- Protected methods

    /*void*/ removeField(/*boolean*/ fromListener, /*int*/ parentId, /*int*/ id) {
        const parent = this._heap[parentId];
        if (parent == null) {
            throw new Error("Trying to remove a field from a parentId which doesn't map to a node: "+ parentId);
        }
        parent.removeField(fromListener, id);
    }

    /*void*/ removeIndex(/*boolean*/ fromListener, /*int*/ parentId, /*int*/ id) {
        const parent = this._heap[parentId];
        if (parent.constructor.name == "ListNode") {
            parent.removeById(fromListener, id);
        }
        else {
            throw new Error("Can't remove an index from a node of type "+parent.constructor.name);
        }
    }

    /*void*/ installField(/*boolean*/ fromListener, /*int*/ parentId, /*int*/ id, /*String*/ name, /*NodeType*/ type) {
        //console.log(parentId);
        const parent = this._heap[parentId];
        //console.log(parent);
        parent.installField(fromListener, id, name, type);
    }

    /*void*/ installRoot(/*boolean*/ fromListener, /*int*/ id, /*NodeType*/ type) {
        if (this.isRootInstalled()) {
            throw new Error("Root already installed");
        }
        this._root = this.allocateNode(id, type);
        this.emit(new InstallRoot(id, type));
    }

    /*void*/ setScalar(/*boolean*/ fromListener, /*int*/ id, /*Object*/ value) {
        const node = this._heap[id];
        node.set(value, fromListener);
    }

    /*void*/ removeChildren(/*boolean*/ fromListener, /*int*/ id) {
        const node = this._heap[id];
        switch (node.getType()) {
            case NodeType.LIST: node.clear(fromListener); return;
            case NodeType.MAP: node.clear(fromListener); return;
            case NodeType.OBJECT: node.clear(fromListener); return;
        }
        throw new Error(id +  " " + node.getClass() + " " + node.getType());
    }

    /*void*/ installIndex(/*boolean*/ fromListener, /*int*/ parentId, /*int*/ id, /*int*/ index, /*NodeType*/ type) {
        //console.log("parentId = " + parentId);
        //console.log(this._heap);
        const parent = this._heap[parentId];
        if (parent.constructor.name == "ListNode") {
            parent.installIndex(fromListener, id, index, type);
        }
        else {
            throw new Error("Can't install an index on a node of type "+parent.constructor.name);
        }
    }


    /*String*/ toString() {
        let sb = "";

        for (const n in this._heap) {
            sb += n + ":" + this._heap[n] + "\n";
        }

        return sb.toString();
    }

    /*String*/ prettyPrint() {
        return this._root == null ? "null" : this._root.prettyPrint();
    }
}
// --- Private methods

class HeapCopyingNodeVisitor extends NodeVisitor {

    // final /*List<Update>*/ updates = new ArrayList<Update>();

    /*List<Update>*/ copy(/*Node*/ rootNode) {
        if (rootNode != null) {
            updates.add(new InstallRoot(rootNode.getId(), rootNode.getType()));
            this.visitNode(rootNode);
            rootNode.visitChildren(this);
        }
        return updates;

    }

    /*void*/ visitNode(/*Node*/ node) {
        switch (node.getType()) {
            case MAP:
            case OBJECT:
                for (const field in node.getFields()) {
                    const childNode = node.getField(field);
                    if (childNode != null) {
                        updates.add(new InstallField(node.getId(), childNode.getId(), field, childNode.getType()));
                    }
                }
                break;
            case LIST:
                for (let i = 0; i < node.size(); i++) {
                    const childNode = node.getIndexAt(i);
                    if (childNode != null) {
                        updates.add(new InstallIndex(node.getId(), childNode.getId(), childNode.index, childNode.getType()));
                    }
                }
                break;
            case SCALAR:
                updates.add(new SetScalar(node.getId(), node.value));
                break;
            default:
                throw new Error("Unknown node type: " + node.getType());

        }
    }
}

export {
    Heap,
    HeapCopyingNodeVisitor,
    HeapDiff,
    HeapDiffBuilder,
    HeapListener,
    MutableHeap,
    ObservableHeap
}