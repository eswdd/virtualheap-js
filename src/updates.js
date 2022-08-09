/*enum*/
class UpdateType {
    static INSTALL_FIELD = new UpdateType ("INSTALL_FIELD");
    static INSTALL_INDEX = new UpdateType ("INSTALL_INDEX");
    static INSTALL_ROOT = new UpdateType ("INSTALL_ROOT");
    static REMOVE_CHILDREN = new UpdateType ("REMOVE_CHILDREN");
    static REMOVE_INDEX = new UpdateType ("REMOVE_INDEX");
    static REMOVE_FIELD = new UpdateType ("REMOVE_FIELD");
    static SET_SCALAR = new UpdateType ("SET_SCALAR");
    static TERMINATE_HEAP = new UpdateType ("TERMINATE_HEAP");

    constructor(name) {
        this._name = name;
    }
    toString() {
        return `UpdateType.${this._name}`;
    }
}



class UpdateVisitor  {
	/*void*/ onScalarSet(/*SetScalar*/ delta) {
        throw new Error("Not implemented.");
    }
	/*void*/ onFieldInstall(/*InstallField*/ delta) {
        throw new Error("Not implemented.");
    }
	/*void*/ onFieldRemove(/*RemoveField*/ delta) {
        throw new Error("Not implemented.");
    }
	/*void*/ onIndexInstall(/*InstallIndex*/ delta) {
        throw new Error("Not implemented.");
    }
	/*void*/ onIndexRemove(/*RemoveIndex*/ delta) {
        throw new Error("Not implemented.");
    }
	/*void*/ onChildrenRemove(/*RemoveChildren*/ delta) {
        throw new Error("Not implemented.");
    }
	/*void*/ onRootInstall(/*InstallRoot*/ delta) {
        throw new Error("Not implemented.");
    }
    /*void*/ onHeapTermination(/*TerminateHeap*/ delta) {
        throw new Error("Not implemented.");
    }
}

class Update {
    /*void*/ visit(/*UpdateVisitor*/ visitor) {
        throw new Error("Not implemented");
    }
    /*UpdateType*/ getUpdateType() {
        throw new Error("Not implemented");
    }
}

class UpdateBlock {

    static /*UpdateBlock*/ merge(/*UpdateBlock...*/ updateBlocks) {
        updateBlocks = typeof(updateBlocks) == "Array" ? updateBlocks : Array.prototype.slice.apply(arguments);
        let merged = [];
        updateBlocks.forEach(block => {
            merged.concat(block.list());
        });
        return new UpdateBlock(merged);
    }

    constructor(/*List<? extends Update>*/ block) {
        this._block = block != null ? [...block] : [];
        this._cachedHash = 0;
    }

    /*List<? extends Update>*/ list() {
        return this._block;
    }

    /*String*/ toString() {
        let s = "[";
        sep = "";
        block.forEach(delta => {
            s += sep + delta + "\n";
            sep = "\t";
        });
        return s + "]";
    }

    /*void*/ visit(/*UpdateVisitor*/ visitor) {
        block.forEach(update => {
            update.visit(visitor);
        });
    }

    /*boolean*/ 
    equals(o) {
        if (this == o) {
            return true;
        }
        if (o == null || typeof(this) != typeof(o)) {
            return false;
        }

        if (this._block != null ? !this._block.equals(o._block) : o._block != null) {
            return false;
        }

        return true;
    }

    /*int*/ hash() {
        if (this._cachedHash == 0 && !block.isEmpty()) {
            this._cachedHash = block.hash();
        }
        return this._cachedHash;
    }
}

class NodeUpdate extends Update {

    constructor(/*int*/ id) {
        super(id);
        this._id = id;
    }

    /*int*/ getId() {
        return this._id;
    }
}

class ChildUpdate extends NodeUpdate {

    constructor(/*int*/ parentId, /*int*/ id) {
        super(id);
        this._parentId = parentId;
    }

    /*int*/ getParentId() {
        return this._parentId;
    }
}

class IndexedUpdate extends ChildUpdate {

    constructor(/*int*/ parentId, /*int*/ id, /*int*/ index) {
        super(parentId, id);
        this._index = index;
    }

    /*int*/ getIndex() {
        return this._index;
    }

}

class NamedUpdate extends ChildUpdate {


    constructor(/*int*/ parentId, /*int*/ id, /*String*/ name) {
        super(parentId, id);
        this._name = name;
    }

    /*String*/ getName() {
        return this._name;
    }

}

class InstallField extends NamedUpdate {

    constructor(/*int*/ parentId, /*int*/ id, /*String*/ name, /*NodeType*/  type) {
        super(parentId, id, name);
        this._type = type;
    }

    /*UpdateType*/ getUpdateType() {
        return UpdateType.INSTALL_FIELD;
    }

    /*void*/ visit(/*UpdateVisitor*/  visitor) {
        visitor.onFieldInstall(this);
    }

    /*boolean*/ equals(that) {
        if (that == null || typeof(this) != typeof(that)) {
            return false;
        }

        if (getId() != that.getId()) return false;
        if (getParentId() != that.getParentId()) return false;
        if (!getName() != that.getName()) return false;
        if (this._type != that._type) return false;

        return true;
    }

    /*int*/ hash() {
        /*int*/ result = getParentId();
        result = 31 * result + getId();
        result = 31 * result + getName().hash();
        result = 31 * result + this._type.hash();
        return result;
    }

    /*NodeType*/  getType() {
        return this._type;
    }

    /*String*/ toString() {
        return "InstallField(" + getParentId() + ", " + getId() + ", " + getName() + ", " + this._type + ")";
    }
}

class InstallIndex extends IndexedUpdate {

    constructor(/*int*/ parentId, /*int*/ id, /*int*/ index, /*NodeType*/  type) {
        super(parentId, id, index);
        this._type = type;
    }

    /*UpdateType*/ getUpdateType() {
        return UpdateType.INSTALL_INDEX;
    }


    /*void*/ visit(/*UpdateVisitor*/  visitor) {
        visitor.onIndexInstall(this);
    }

    /*boolean*/ equals(that) {
        if (that == null || typeof(this) != typeof(that)) {
            return false;
        }

        if (getId() != that.getId()) return false;
        if (getParentId() != that.getParentId()) return false;
        if (!this.getIndex() != that.getIndex()) return false;
        if (this._type != that._type) return false;

        return true;
    }

    /*int*/ hash() {
        /*int*/ result = getParentId();
        result = 31 * result + getId();
        result = 31 * result + getName().hash();
        result = 31 * result + this._type.hash();
        return result;
    }

    /*NodeType*/  getType() {
        return this._type;
    }

    /*String*/ toString() {
        return "InstallIndex(" + getParentId() + ", " + getId() + ", " + getIndex()+ ", " + this._type + ")";
    }
}

class InstallRoot extends NodeUpdate {

    constructor(/*int*/ id, /*NodeType*/ type) {
        super(id);
        this._type = type;
    }

    /*UpdateType*/ getUpdateType() {
        return UpdateType.INSTALL_ROOT;
    }

    /*void*/ visit(/*UpdateVisitor*/ visitor) {
        visitor.onRootInstall(this);
    }

    /*boolean*/ equals(that) {
        if (that == null || typeof(this) != typeof(that)) {
            return false;
        }

        if (this.getId() != that.getId()) return false;
        if (this._type != that._type) return false;

        return true;
    }

    /*int*/ hash() {
        let result = getId();
        result = 31 * result + this._type.hash();
        return result;
    }

    /*NodeType*/ getType() {
        return this._type;
    }

    /*String*/ toString() {
        return "InstallRoot(" + this.getId() + ", " + this._type + ")";
    }
}

class RemoveChildren extends NodeUpdate {

    constructor(/*int*/ id, /*Set<Integer>*/  deallocatedIds) {
        super(id);
        this._deallocatedIds = deallocatedIds;
    }

    /*UpdateType*/ getUpdateType() {
        return UpdateType.REMOVE_CHILDREN;
    }

    /*void*/ visit(/*UpdateVisitor*/  visitor) {
        visitor.onChildrenRemove(this);
    }

    /*boolean*/ equals(that) {
        if (that == null || typeof(this) != typeof(that)) {
            return false;
        }

        if (this.getId() != that.getId()) return false;

        return true;
    }

    /*int*/ hash() {
        return this.getId();
    }

    /*Set<Integer>*/  getDeallocatedIds() {
        return this._deallocatedIds;
    }

    /*String*/ toString() {
        return "RemoveChildren(" + this.getId() + ")";
    }
}

class RemoveField extends NamedUpdate {

    constructor(/*int*/ parentId, /*int*/ id, /*String*/ name, /*Set<Integer>*/  deallocatedIds) {
        super(parentId, id, name);
        this.this._deallocatedIds = deallocatedIds;
    }

    /*UpdateType*/ getUpdateType() {
        return UpdateType.REMOVE_FIELD;
    }

    /*void*/ visit(/*UpdateVisitor*/  visitor) {
        visitor.onFieldRemove(this);
    }

    /*boolean*/ equals(that) {
        if (that == null || typeof(this) != typeof(that)) {
            return false;
        }

        if (this.getId() != that.getId()) return false;
        if (this.getParentId() != that.getParentId()) return false;

        return true;
    }

    /*int*/ hash() {
        let result = this.getId();
        result = 31 * result + this.getParentId().hash();
        return result;
    }

    /*Set<Integer>*/  getDeallocatedIds() {
        return this._deallocatedIds;
    }

    /*String*/ toString() {
        return "RemoveField(" + this.getParentId() + ", " + this.getId() + ", Set(...))";
    }
}

class RemoveIndex extends IndexedUpdate {

    constructor(/*int*/ parentId, /*int*/ id, /*int*/ index, /*Set<Integer>*/  deallocatedIds) {
        super(parentId, id, index);
        this._deallocatedIds = deallocatedIds;
    }

    /*UpdateType*/ getUpdateType() {
        return UpdateType.REMOVE_INDEX;
    }

    /*void*/ visit(/*UpdateVisitor*/  visitor) {
        visitor.onIndexRemove(this);
    }

    /*boolean*/ equals(that) {
        if (that == null || typeof(this) != typeof(that)) {
            return false;
        }

        if (this.getId() != that.getId()) return false;
        if (this.getIndex() != that.getIndex()) return false;
        if (this.getParentId() != that.getParentId()) return false;

        return true;
    }

    /*int*/ hash() {
        let result = this.getId();
        result = 31 * result + this.getIndex().hash();
        result = 31 * result + this.getParentId().hash();
        return result;
    }

    /*Set<Integer>*/  getDeallocatedIds() {
        return this._deallocatedIds;
    }

    /*String*/ toString() {
        return "RemoveIndex(" + this.getParentId() + ", " + this.getId() + ", " + this.getIndex() + ", Set(...))";
    }
}

class SetScalar extends NodeUpdate {

    constructor(/*int*/ id, /*Object*/  value) {
        super(id);
        this._value = value;
    }

    /*UpdateType*/ getUpdateType() {
        return UpdateType.SET_SCALAR;
    }

    /*void*/ visit(/*UpdateVisitor*/  visitor) {
        visitor.onScalarSet(this);
    }

    /*Object*/  getValue() {
        return this._value;
    }

    /*boolean*/ equals(that) {
        if (that == null || typeof(this) != typeof(that)) {
            return false;
        }

        if (this.getId() != that.getId()) return false;
        if (this._value != that._value) return false;

        return true;
    }

    /*int*/ hash() {
        let result = this.getId();
        result = 31 * result + this._value.hash();
        return result;
    }

    /*String*/ toString() {
        return "SetScalar(" + this.getId() + ", " + this._value + ")";
    }
}

class TerminateHeap extends Update {

    /*UpdateType*/ getUpdateType() {
        return UpdateType.TERMINATE_HEAP;
    }

    /*void*/ visit(/*UpdateVisitor*/  visitor) {
        visitor.onHeapTermination(this);
    }

    /*String*/ toString() {
        return "TerminateHeap()";
    }

    /*boolean*/ equals(that) {
        if (that == null || typeof(this) != typeof(that)) {
            return false;
        }

        return true;
    }

    /*int*/ hash() {
        return getUpdateType().hashCode();
    }
}

export {
    IndexedUpdate,
    InstallField,
    InstallIndex,
    InstallRoot,
    NodeUpdate,
    RemoveChildren,
    RemoveField,
    RemoveIndex,
    SetScalar,
    TerminateHeap,
    UpdateType,
    UpdateVisitor,
    UpdateBlock
}