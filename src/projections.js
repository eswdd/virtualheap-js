import { HListBase } from './heap_types.js'

class AbstractListProjection extends HListBase {

    constructor(/*ListNode*/ node) {
        super();
		this._node = node;
	}

    /*void*/ removeAt(/*int*/ index) {
        if (index >= 0 && index < this.size()) {
            this._node.removeIndex(index);
        } else {
            throw new Error("Index out of bounds");
        }
    }

    /*boolean*/ remove(/*T*/ value) {
        let index = 0;
        while (index < this.size()) {
            if (this._node.get(index) == value) {
                this.removeeAt(index);
                return true;
            }
            index++;
        }
        return false;
    }

    /*void*/ removeLast() {
        let index = this.size() - 1;
        if (index >= 0) {
            this.removeAt(index);
        } else {
            throw new Error("No such element");
        }
    }

    /*void*/ removeFirst() {
        if (this.size() > 0) {
            this.removeAt(0);
        } else {
            throw new Error("No such element");
        }
    }

    /*T*/ peek() {
        if (this.size() == 0) {
            return null;
        } else {
            return this.get(0);
        }
    }

    /*boolean*/ pop() {
        if (this.size() > 0) {
            this.removeFirst();
            return true;
        } else {
            return false;
        }
    }

    /*int*/ size() {
        if (this._node == null) {
            return 0;
        }
        return this._node.size();
    }

    /*void*/ clear() {
    	this._node.clear();
    }



    *[Symbol.iterator] () {
        let index = 0;
        while (index < size()) {
            yield this.get(index++);
        }
    }
}

// implements HMapBase<T> 
class AbstractMapProjection {

	constructor(/*MapNode*/ node) {
		this._node = node;
	}

    /*void*/ remove(/*String*/ key) {
        this._node.removeField(key);
    }

    /*void*/ clear() {
		this._node.clear();
	}

	/*int*/ size() {
		return this._node.size();
	}

    /*Set*/ keySet() {
        return this._node.getFields();
    }
}

// implements HListComplex<T>
class ComplexListProjection extends AbstractListProjection {

    constructor(/*ListNode*/ node, /*NodeProjector<T>*/ valueProjector) {
		super(node);
        this._valueProjector = valueProjector;
	}

	/*T*/ get(/*int*/ index) {
        if (index >= 0 && index < this.size()) {
            return this._node.getIndexAt(index).project(this._valueProjector);
        } else {
            throw new Error("ArrayIndexOutOfBounds");
        }
    }

    /*T*/ insertAt(/*int*/ index) {
        return this._node.insertAt(index, this._valueProjector.getType()).project(this._valueProjector);
    }

    /*T*/ addLast() {
        return this.insertAt(this.size());
    }

    /*T*/ addFirst() {
        return this.insertAt(0);
    }

    /*T*/ push() {
        return this.addFirst();
    }
}

// implements HMapComplex<T>
class ComplexMapProjection extends AbstractMapProjection {

	constructor(/*MapNode*/ node, /*NodeProjector<T>*/ valueProjector) {
		super(node);
		this._valueProjector = valueProjector;
	}

    /*T*/ get(/*String*/ key) {
		const value = this._node.getField(key);
		if (value != null) {
			return value.project(this._valueProjector);
		} else {
			return null;
		}
	}

    /*T*/ put(/*String*/ key) {
		return this._node.ensureField(key, this._valueProjector.getType()).project(this._valueProjector);
	}
}

// implements HListScalar<T>
class ScalarListProjection extends AbstractListProjection {


    constructor(/*ListNode*/ node, /*ScalarProjector<T>*/ valueProjector) {
		super(node);
        this._valueProjector = valueProjector;
	}

	/*T*/ get(/*int*/ index) {
        if (index >= 0 && index < size()) {
            return this._node.getIndexAt(index).project(this._valueProjector).get();
        } else {
            throw new IndexOutOfBoundsException();
        }
    }

    /*void*/ addFirst(/*T*/ value) {
        this.insertAt(0, value);
    }

    /*void*/ addLast(/*T*/ value) {
        this.insertAt(this.size(), value);
    }

    /*void*/ insertAt(/*int*/ index, /*T*/ value) {
        const insertedNode = this._node.insertAt(index, this._valueProjector.getType());
        const projectedNode = insertedNode.project(this._valueProjector);
        projectedNode.set(value);
    }

    /*void*/ push(/*T*/ value) {
        this.addFirst(value);
    }
}

// implements HMapScalar
class ScalarMapProjection extends AbstractMapProjection {

	constructor(/*MapNode*/ node, /*ScalarProjector<T>*/ valueProjector) {
        super(node);
		this._valueProjector = valueProjector;
	}

    /*T*/ get(/*String*/ key) {
		const value = this._node.getField(key);
		if (value != null) {
			return value.project(valueProjector).get();
		} else {
			return null;
		}
	}

    /*void*/ put(/*String*/ key, /*T*/ value) {
		this._node.ensureField(key, this._valueProjector.getType()).project(this._valueProjector).set(value);
	}
}

class ScalarProjection {

	/*T*/ get() {
        throw new Error("Not implemented.");
    }
	/*void*/ set(/*T*/ value) {
        throw new Error("Not implemented.");
    }

}

export {
    ComplexListProjection,
    ComplexMapProjection,
    ScalarListProjection,
    ScalarMapProjection,
    ScalarProjection
}