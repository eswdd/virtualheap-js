class HCollection {
    /*int*/ size() {
        throw new Error("Not implemented.");
    }
}

class HListBase extends HCollection {

    *[Symbol.iterator] () {
        throw new Error("Not implemented.");
    }

    /*T*/ get(/*int*/ index) {
        throw new Error("Not implemented.");
    }

    /*void*/ removeAt(/*int*/ index) {
        throw new Error("Not implemented.");
    }

    /*boolean*/ remove(/*T*/ value) {
        throw new Error("Not implemented.");
    }

    /*void*/ removeLast() {
        throw new Error("Not implemented.");
    }

    /*void*/ removeFirst() {
        throw new Error("Not implemented.");
    }

    /*T*/ peek() {
        throw new Error("Not implemented.");
    }

    /*boolean*/ pop() {
        throw new Error("Not implemented.");
    }

    /*void*/ clear() {
        throw new Error("Not implemented.");
    }
}

class HListComplex extends HListBase {

    /*T*/ insertAt(/*int*/ index) {
        throw new Error("Not implemented.");
    }

    /*T*/ addLast() {
        throw new Error("Not implemented.");
    }

    /*T*/ addFirst() {
        throw new Error("Not implemented.");
    }

    /*T*/ push() {
        throw new Error("Not implemented.");
    }
}

class HListScalar extends HListBase {

    /*void*/ insertAt(/*int*/ index, /*T*/ value) {
        throw new Error("Not implemented.");
    }

    /*void*/ addFirst(/*T*/ value) {
        throw new Error("Not implemented.");
    }

    /*void*/ addLast(/*T*/ value) {
        throw new Error("Not implemented.");
    }

    /*void*/ push(/*T*/ value) {
        throw new Error("Not implemented.");
    }
}


class HMapBase extends HCollection {

    /*T*/ get(/*String*/ key) {
        throw new Error("Not implemented.");
    }

    /*void*/ remove(/*String*/ key) {
        throw new Error("Not implemented.");
    }

    /*void*/ clear() {
        throw new Error("Not implemented.");
    }

    /*Set<String>*/ keySet() {
        throw new Error("Not implemented.");
     }
}

class HMapComplex extends HMapBase {

    /*T*/ put(/*String*/ key) {
        throw new Error("Not implemented.");
    }
}

class HMapScalar extends HMapBase {

    /*void*/ put(/*String*/ key, /*T*/ value) {
        throw new Error("Not implemented.");
    }
}

class HSet extends HCollection {

    *[Symbol.iterator] () {
        throw new Error("Not implemented.");
    }

    /*T*/ get(/*int*/ index) {
        throw new Error("Not implemented.");
    }

    /*T*/ add() {
        throw new Error("Not implemented.");
    }

    /*boolean*/ remove(/*Object*/ value) {
        throw new Error("Not implemented.");
    }

    /*void*/ clear() {
        throw new Error("Not implemented.");
    }
}

 
export {
    HCollection,
    HListBase,
    HListComplex,
    HListScalar,
    HMapBase,
    HMapComplex,
    HMapScalar,
    HSet
}