import { NodeType} from './node.js'
import { ScalarListProjection, ScalarMapProjection, ComplexListProjection, ComplexMapProjection } from './projections.js'

class NodeProjector {

	/*T*/ project(/*Node*/ node) {
		throw new Error("Not implemented");
	}

	/*NodeType*/ getType() {
		throw new Error("Not implemented");
	}

}

class ScalarProjector extends NodeProjector {

	/*ScalarProjection<T>*/ project(/*Node*/ node) {
		return /*(ScalarProjection<T>)*/node;
	}

	/*NodeType*/ getType() {
		return NodeType.SCALAR;
	}

}

class ProjectorFactory {

	static listProjector(/*ScalarProjector<T>*/ valueProjector) {
		if (valueProjector.constructor.name === "ScalarProjector") {
			return new ScalarListProjector(valueProjector);
		}
		else {
			return new ComplexListProjector(valueProjector);
		}
	}

	static mapProjector(/*NodeProjector<T>*/ valueProjector) {
		if (valueProjector.constructor.name === "ScalarProjector") {
			return new ScalarMapProjector(valueProjector);
		}
		else {
			return new ComplexMapProjector(valueProjector);
		}
	}

	static /*ObjectProjector<T>*/ objectProjector(instance) {
		const prototype = Object.getPrototypeOf(instance);
		return new ObjectProjector(prototype.constructor);
	}

    static scalarProjector = new ScalarProjector();
}

class ComplexListProjector extends NodeProjector {

	constructor(/*NodeProjector<T>*/ valueProjector) {
		super();
		this._valueProjector = valueProjector;
	}

	/*ComplexListProjection<T>*/ project(/*Node*/ node) {
		return new ComplexListProjection(/*(ListNode)*/node, this._valueProjector);
	}

	/*NodeType*/ getType() {
		return NodeType.LIST;
    }
}

class ComplexMapProjector extends NodeProjector {

	constructor(/*NodeProjector<T>*/ valueProjector) {
		super();
		this._valueProjector = valueProjector;
	}

	/*ComplexMapProjection<T>*/ project(/*Node*/ node) {
		return new ComplexMapProjection(/*(MapNode)*/node, this._valueProjector);
	}

	/*NodeType*/ getType() {
		return NodeType.MAP;
    }
}

class ObjectProjector extends NodeProjector {

	constructor(/*Class<T>*/ constructor) {
		super();
		//console.log("Passed constructor: "+constructor.name)
        this._constructor = constructor;
	}

	/*T*/ project(/*Node*/ node) {
		return new this._constructor(/*(ObjectNode)*/node);
	}

	/*NodeType*/ getType() {
		return NodeType.OBJECT;
	}
}

class ScalarListProjector extends NodeProjector {
	
	constructor(/*ScalarProjector*/ valueProjector) {
		super();
		this._valueProjector = valueProjector;
	}

	/*ScalarListProjector<T>*/ project(/*Node*/ node) {
		return new ScalarListProjection(/*(MapNode)*/node, this._valueProjector);
	}

	/*NodeType*/ getType() {
		return NodeType.LIST;
	}
}

class ScalarMapProjector extends NodeProjector {

	constructor(/*ScalarProjector*/ valueProjector) {
		super();
		this._valueProjector = valueProjector;
	}

	/*ScalarMapProjection<T>*/ project(/*Node*/ node) {
		return new ScalarMapProjection(/*(MapNode)*/node, this._valueProjector);
	}

	/*NodeType*/ getType() {
		return NodeType.MAP;
	}
}

export {
	ComplexListProjector,
	ComplexMapProjector,
	NodeProjector,
	ObjectProjector,
	ProjectorFactory,
	ScalarListProjector,
	ScalarMapProjector,
	ScalarProjector
}