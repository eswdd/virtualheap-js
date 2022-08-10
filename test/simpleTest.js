import { NodeType } from '../src/node.js'
import { ProjectorFactory } from '../src/projectors.js'
import { UpdateType } from '../src/updates.js'
import { HeapListener, MutableHeap } from '../src/heap.js'

class GoalDetail {

    constructor(/*ObjectNode*/ node) {
        this._node = node;
    }

    /*void*/ setScorer(/*String*/ s) {
        this._node.ensureField("scorer", ProjectorFactory.scalarProjector.getType()).project(ProjectorFactory.scalarProjector).set(s);
    }
    /*String*/ getScorer() {
        return this._node.ensureField("scorer", ProjectorFactory.scalarProjector.getType()).project(ProjectorFactory.scalarProjector).get();
    }

    /*void*/ setMinutes(/*Integer*/ i) {
        this._node.ensureField("minutes", ProjectorFactory.scalarProjector.getType()).project(ProjectorFactory.scalarProjector).set(i);
    }
    /*Integer*/ getMinutes() {
        return this._node.ensureField("minutes", ProjectorFactory.scalarProjector.getType()).project(ProjectorFactory.scalarProjector).get();
    }
}

class FootballScores {


    static /*ComplexListProjector<GoalDetail>*/ goalsProjector = 
        ProjectorFactory.listProjector(ProjectorFactory.objectProjector(new GoalDetail()));
    static /*ObjectProjector<GoalDetail>*/ goalProjector = 
        ProjectorFactory.objectProjector(new GoalDetail());
    static /*ScalarListProjector<String>*/ scalarListProjector = 
        ProjectorFactory.listProjector(ProjectorFactory.scalarProjector);

    constructor(/*ObjectNode*/ node) {
        this._node = node;
    }

    /*Integer*/ getHome() {
        return this._node.ensureField("home", ProjectorFactory.scalarProjector.getType()).project(ProjectorFactory.scalarProjector).get();
    }
    /*void*/ setHome(/*Integer*/ i) {
        this._node.ensureField("home", ProjectorFactory.scalarProjector.getType()).project(ProjectorFactory.scalarProjector).set(i);
    }

    /*Integer*/ getAwayClient() {
        return this._node.getField("away") != null ? this._node.getField("away").project(ProjectorFactory.scalarProjector).get() : null;
    }
    /*Integer*/ getAway() {
        return this._node.ensureField("away", ProjectorFactory.scalarProjector.getType()).project(ProjectorFactory.scalarProjector).get();
    }
    /*void*/ setAway(/*Integer*/ i) {
        this._node.ensureField("away", ProjectorFactory.scalarProjector.getType()).project(ProjectorFactory.scalarProjector).set(i);
    }

    /*HListComplex<GoalDetail>*/ goals() {
        return this._node.ensureField("goals", FootballScores.goalsProjector.getType()).project(FootballScores.goalsProjector);
    }

    /*GoalDetail*/ getGoal() {
        return this._node.ensureField("goal", FootballScores.goalProjector.getType()).project(FootballScores.goalProjector);
    }

    /*HListScalar<String>*/ getListOfStrings() {
        return this._node.ensureField("strings2", FootballScores.scalarListProjector.getType()).project(FootballScores.scalarListProjector);
    }

    /*void*/ clear() {
        this._node.clear();
    }
}

class LoggingTreeListener extends HeapListener {

    /*void*/ applyUpdate(/*UpdateBlock*/ update) {
        console.log("BEGIN");
        update.list().forEach(u => {
            switch (u.getUpdateType()) {
                case UpdateType.INSTALL_ROOT:
                    console.log("\t+ROOT {id: " + u.getId() + ", type: " + u.getUpdateType() + "}");
                    break;
                case UpdateType.INSTALL_FIELD:
                    console.log("\t+ {parentId: " + u.getParentId() + ", id: " + u.getId() + ", name: \"" + u.getName() + "\", type: " + u.getUpdateType() + "}");
                    break;
                case UpdateType.INSTALL_INDEX:
                    console.log("\t+ {parentId: " + u.getParentId() + ", id: " + u.getId() + ", index: " + u.getIndex() + ", type: " + u.getUpdateType() + "}");
                    break;
                case UpdateType.SET_SCALAR:
                    console.log("\t# {id: " + u.getId() + ", value: " + u.getValue() + "}");
                    break;
                case UpdateType.REMOVE_FIELD:
                    console.log("\t- {parentId: " + u.getParentId() + ", id: \"" + u.getId() + "\"}");
                    break;
                case UpdateType.REMOVE_INDEX:
                    console.log("\t# {parentId: " + u.getParentId()+ ", id: " + u.getId() + "}");
                    break;
                case UpdateType.REMOVE_CHILDREN:
                    console.log("\t! {id: " + u.getId() + "}");
                    break;
                case UpdateType.TERMINATE_HEAP:
                    console.log("\t! TERMINATE HEAP");
                    break;
                default:
                    throw new Error("Unrecognised update type: "+u.getUpdateType());
            }
        })
        console.log("END");
    }

}
    
    
    
const scoresFactory = ProjectorFactory.objectProjector(new FootballScores());

function simpleTest() {
    
    
}



describe("A suite", function() {
    it("simple test works", function() {
      expect(true).toBe(true);


        const src = new MutableHeap("src");

        const target = new MutableHeap("target");

        src.addListener(target.asListener(), false);

        src.beginUpdate();

        const scores = scoresFactory.project(src.ensureRoot(NodeType.OBJECT));
        src.endUpdate();
        
        expect(target.toString()).toBe(src.toString());
        
        src.beginUpdate();
        scores.setAway(0);
        scores.setHome(1);
        const firstGoal = scores.goals().addLast();
        firstGoal.setScorer("Rooney");
        firstGoal.setMinutes(34);
        src.endUpdate();
        
        expect(target.toString()).toBe(src.toString());
        
        src.beginUpdate();
        scores.goals().clear();
        src.endUpdate();
        
        expect(target.toString()).toBe(src.toString());
        
        src.beginUpdate();
        scores.clear();
        src.endUpdate();
        
        expect(target.toString()).toBe(src.toString());
    });
  });