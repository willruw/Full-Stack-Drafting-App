import * as assert from 'assert';
import { makeDraft, makePick, getDrafters, getOptions, getTotalRounds, getCurrRound, getCurrIndex, removeOption, addPick, incrementCurrRound, toJsonDraft, fromJsonDraft, setIndex } from './draft';

describe('draft', function() {

    it('makeDraft', function() {

        //Straight-line code heuristic, test 1
        assert.deepStrictEqual(makeDraft(["drafter 1", "drafter 2"], ["snickers", "kit kat", "mars bar"], 2, 1, 1, [{drafter:"drafter 1", drafted:"kit kat"}]), 
        {drafters:["drafter 1", "drafter 2"], options:["snickers", "kit kat", "mars bar"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]});

        //Straight-line code heuristic, test 2
        assert.deepStrictEqual(makeDraft(["drafter 1", "drafter 2", "drafter 3"], ["snickers", "kit kat", "mars bar", "crunch bar"], 4, 2, 2, [{drafter:"drafter 1", drafted:"kit kat"}, {drafter:"drafter 2", drafted:"mars bar"}]), 
        {drafters:["drafter 1", "drafter 2", "drafter 3"], options:["snickers", "kit kat", "mars bar", "crunch bar"], totalRounds:4, currRound:2, currIndex:2, picks:[{drafter:"drafter 1", drafted:"kit kat"}, {drafter:"drafter 2", drafted:"mars bar"}]});

    });

    it('makePick', function() {

        //Straight-line code heuristic, test 1
        assert.deepStrictEqual(makePick("drafter 1", "drafted 1"), {drafter:"drafter 1", drafted:"drafted 1"});

        //Straight-line code heuristic, test 2
        assert.deepStrictEqual(makePick("drafter 2", "drafted 2"), {drafter:"drafter 2", drafted:"drafted 2"});

    });

    it('toJsonDraft', function() {

        //Straight-line code heuristic, all fields non-empty domain, test 1
        const draft1 = makeDraft(["drafter 1", "drafter 2"], ["option 1", "option 2"], 5, 3, 2, [makePick("drafter 1", "option 1"), makePick("drafter 2", "option 2")]);
        assert.deepStrictEqual(toJsonDraft(draft1),
        [["drafter 1", "drafter 2"], ["option 1", "option 2"], "5", "3", "2", [["drafter 1", "option 1"], ["drafter 2", "option 2"]]]);

        //Straight-line code heuristic, all fields non-empty domain, test 2
        const draft2 = makeDraft(["drafter 1", "drafter 2", "drafter 3", "drafter 4"], ["option 1", "option 2", "option 3", "option 4"], 6, 2, 1, [makePick("drafter 1", "option 1"), makePick("drafter 2", "option 2"), makePick("drafter 3", "option 3"), makePick("drafter 4", "option 4")]);
        assert.deepStrictEqual(toJsonDraft(draft2),
        [["drafter 1", "drafter 2", "drafter 3", "drafter 4"], ["option 1", "option 2", "option 3", "option 4"], "6", "2", "1", [["drafter 1", "option 1"], ["drafter 2", "option 2"], ["drafter 3", "option 3"], ["drafter 4", "option 4"]]]);

        //Straight-line code heuristic, empty options domain
        const draft3 = makeDraft(["drafter 1", "drafter 2", "drafter 3", "drafter 4"], [], 6, 7, 3, [makePick("drafter 1", "option 1"), makePick("drafter 2", "option 2"), makePick("drafter 3", "option 3"), makePick("drafter 4", "option 4")]);
        assert.deepStrictEqual(toJsonDraft(draft3),
        [["drafter 1", "drafter 2", "drafter 3", "drafter 4"], [], "6", "7", "3", [["drafter 1", "option 1"], ["drafter 2", "option 2"], ["drafter 3", "option 3"], ["drafter 4", "option 4"]]]);
    
        //Straight-line code heuristic, empty Picks
        const draft4 = makeDraft(["drafter 1", "drafter 2"], ["option 1", "option 2"], 3, 2, 1, []);
        assert.deepStrictEqual(toJsonDraft(draft4),
        [["drafter 1", "drafter 2"], ["option 1", "option 2"], "3", "2", "1", []]);
    });

    it('fromJsonDraft', function() {

        //Straight-line code heuristic, all fields non-empty domain, test 1
        const jsonDraft1 = [["drafter 1", "drafter 2"], ["option 1", "option 2"], "5", "3", "2", [["drafter 1", "option 1"], ["drafter 2", "option 2"]]];
        assert.deepStrictEqual(fromJsonDraft(jsonDraft1), 
        makeDraft(["drafter 1", "drafter 2"], ["option 1", "option 2"], 5, 3, 2, [makePick("drafter 1", "option 1"), makePick("drafter 2", "option 2")]));

        //Straight-line code heuristic, all fields non-empty domain, test 2
        const jsonDraft2 = [["drafter 1", "drafter 2", "drafter 3", "drafter 4"], ["option 1", "option 2", "option 3", "option 4"], "6", "2", "1", [["drafter 1", "option 1"], ["drafter 2", "option 2"], ["drafter 3", "option 3"], ["drafter 4", "option 4"]]];
        assert.deepStrictEqual(fromJsonDraft(jsonDraft2), 
        makeDraft(["drafter 1", "drafter 2", "drafter 3", "drafter 4"], ["option 1", "option 2", "option 3", "option 4"], 6, 2, 1, [makePick("drafter 1", "option 1"), makePick("drafter 2", "option 2"), makePick("drafter 3", "option 3"), makePick("drafter 4", "option 4")]));

        //Straight-line code heuristic, empty options domain
        const jsonDraft3 = [["drafter 1", "drafter 2", "drafter 3", "drafter 4"], [], "6", "7", "5", [["drafter 1", "option 1"], ["drafter 2", "option 2"], ["drafter 3", "option 3"], ["drafter 4", "option 4"]]];
        assert.deepStrictEqual(fromJsonDraft(jsonDraft3),
        makeDraft(["drafter 1", "drafter 2", "drafter 3", "drafter 4"], [], 6, 7, 5, [makePick("drafter 1", "option 1"), makePick("drafter 2", "option 2"), makePick("drafter 3", "option 3"), makePick("drafter 4", "option 4")]));

        //Straight-line code heuristic, empty Picks
        const jsonDraft4 = [["drafter 1", "drafter 2"], ["option 1", "option 2"], "3", "2", "2", []];
        assert.deepStrictEqual(fromJsonDraft(jsonDraft4),
        makeDraft(["drafter 1", "drafter 2"], ["option 1", "option 2"], 3, 2, 2, []));

        //Straight-line code heuristic, invalid data test 1
        const jsonDraft5 = makeDraft(["drafter 1", "drafter 2"], ["option 1", "option 2"], 5, 3, 2, [makePick("drafter 1", "option 1"), makePick("drafter 2", "option 2")]);
        assert.throws(() => fromJsonDraft(jsonDraft5), Error);

        //Straight-line code heuristic, invalid data test 2
        const jsonDraft6 = "test";
        assert.throws(() => fromJsonDraft(jsonDraft6), Error);

    });

    it('getDrafters', function() {

        //Straight-line code heuristic, test 1
        const draft1 = {drafters:["drafter 1", "drafter 2"], options:["snickers", "kit kat", "mars bar"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]}
        assert.deepStrictEqual(getDrafters(draft1), ["drafter 1", "drafter 2"]);

        //Straight-line code heuristic, test 2
        const draft2 = {drafters:["drafter 1", "drafter 2", "drafter 3"], options:["snickers", "kit kat", "mars bar", "crunch bar"], totalRounds:4, currRound:2, currIndex: 3, picks:[{drafter:"drafter 1", drafted:"kit kat"}, {drafter:"drafter 2", drafted:"mars bar"}]};
        assert.deepStrictEqual(getDrafters(draft2), ["drafter 1", "drafter 2", "drafter 3"]);
    });

    it('getOptions', function() {

        //Straight-line code heuristic, test 1
        const draft1 = {drafters:["drafter 1", "drafter 2"], options:["snickers", "kit kat", "mars bar"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]}
        assert.deepStrictEqual(getOptions(draft1), ["snickers", "kit kat", "mars bar"]);

        //Straight-line code heuristic, test 2
        const draft2 = {drafters:["drafter 1", "drafter 2", "drafter 3"], options:["snickers", "kit kat", "mars bar", "crunch bar"], totalRounds:4, currRound:2, currIndex:2, picks:[{drafter:"drafter 1", drafted:"kit kat"}, {drafter:"drafter 2", drafted:"mars bar"}]};
        assert.deepStrictEqual(getOptions(draft2), ["snickers", "kit kat", "mars bar", "crunch bar"]);
    });

    it('getTotalRounds', function() {

        //Straight-line code heuristic, test 1
        const draft1 = {drafters:["drafter 1", "drafter 2"], options:["snickers", "kit kat", "mars bar"], totalRounds:2, currRound:1, currIndex: 1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]}
        assert.deepStrictEqual(getTotalRounds(draft1), 2);

        //Straight-line code heuristic, test 2
        const draft2 = {drafters:["drafter 1", "drafter 2", "drafter 3"], options:["snickers", "kit kat", "mars bar", "crunch bar"], totalRounds:4, currRound:2, currIndex:2, picks:[{drafter:"drafter 1", drafted:"kit kat"}, {drafter:"drafter 2", drafted:"mars bar"}]};
        assert.deepStrictEqual(getTotalRounds(draft2), 4);

    });

    it('getCurrRound', function() {

        //Straight-line code heuristic, test 1
        const draft1 = {drafters:["drafter 1", "drafter 2"], options:["snickers", "kit kat", "mars bar"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]}
        assert.deepStrictEqual(getCurrRound(draft1), 1);

        //Straight-line code heuristic, test 2
        const draft2 = {drafters:["drafter 1", "drafter 2", "drafter 3"], options:["snickers", "kit kat", "mars bar", "crunch bar"], totalRounds:4, currRound:2, currIndex:2, picks:[{drafter:"drafter 1", drafted:"kit kat"}, {drafter:"drafter 2", drafted:"mars bar"}]};
        assert.deepStrictEqual(getCurrRound(draft2), 2);

    });

    it('getCurrIndex', function() {
        
        //Straight-line code heuristic, test 1
        const draft1 = {drafters:["drafter 1", "drafter 2"], options:["snickers", "kit kat", "mars bar"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]}
        assert.deepStrictEqual(getCurrIndex(draft1), 1);

        //Straight-line code heuristic, test 2
        const draft2 = {drafters:["drafter 1", "drafter 2", "drafter 3"], options:["snickers", "kit kat", "mars bar", "crunch bar"], totalRounds:4, currRound:2, currIndex:2, picks:[{drafter:"drafter 1", drafted:"kit kat"}, {drafter:"drafter 2", drafted:"mars bar"}]};
        assert.deepStrictEqual(getCurrIndex(draft2), 2);

    });

    it('removeOption', function() {

        //0 loops, 1st test
        const draft1 = {drafters:["drafter 1", "drafter 2"], options:[], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]}
        assert.deepStrictEqual(removeOption(draft1, ""), 
        {drafters:["drafter 1", "drafter 2"], options:[], totalRounds:2, currRound:1, currIndex:1., picks:[{drafter:"drafter 1", drafted:"kit kat"}]});
        //0 loops, 2nd test
        assert.deepStrictEqual(removeOption(draft1, "test"), 
        {drafters:["drafter 1", "drafter 2"], options:[], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]});

        //1 loop, 1st test
        const draft2 = {drafters:["drafter 1", "drafter 2"], options:["snickers"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]}
        assert.deepStrictEqual(removeOption(draft2, "snickers"), 
        {drafters:["drafter 1", "drafter 2"], options:[], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]});
        //1 loop, 2nd test
        const draft3 = {drafters:["drafter 1", "drafter 2"], options:["kit-kat"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]}
        assert.deepStrictEqual(removeOption(draft3, "snickers"), 
        {drafters:["drafter 1", "drafter 2"], options:["kit-kat"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]});

        //2+ loops, 1st test
        const draft4 = {drafters:["drafter 1", "drafter 2"], options:["kit-kat", "snickers", "mars bar"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]}
        assert.deepStrictEqual(removeOption(draft4, "snickers"), 
        {drafters:["drafter 1", "drafter 2"], options:["kit-kat", "mars bar"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]});
        //2+ loops, 2nd test
        const draft5 = {drafters:["drafter 1", "drafter 2"], options:["kit-kat", "snickers", "mars bar", "crunch bar"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]}
        assert.deepStrictEqual(removeOption(draft5, "crunch bar"), 
        {drafters:["drafter 1", "drafter 2"], options:["kit-kat", "snickers", "mars bar"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]});
    });

    it('addPick', function() {
        
        //Straight-line code heuristic, test 1
        const draft1 = {drafters:["drafter 1", "drafter 2"], options:["kit-kat", "snickers", "mars bar"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]}
        const pick1 = makePick("drafter 2", "mars bar");
        assert.deepStrictEqual(addPick(draft1, pick1), 
        {drafters:["drafter 1", "drafter 2"], options:["kit-kat", "snickers", "mars bar"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}, {drafter:"drafter 2", drafted:"mars bar"}]})

        //Straight-line code heuristic, test 2
        const draft2 = {drafters:["drafter 1", "drafter 2"], options:["kit-kat", "snickers", "mars bar"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]}
        const pick2 = makePick("drafter 2", "snickers");
        assert.deepStrictEqual(addPick(draft2, pick2), 
        {drafters:["drafter 1", "drafter 2"], options:["kit-kat", "snickers", "mars bar"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}, {drafter:"drafter 2", drafted:"snickers"}]})
    });

    it('incrementCurrRound', function() {

        //Straight-line code heuristic, test 1
        const draft1 = {drafters:["drafter 1", "drafter 2"], options:["kit-kat", "snickers", "mars bar"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]}
        assert.deepStrictEqual(incrementCurrRound(draft1), 
        {drafters:["drafter 1", "drafter 2"], options:["kit-kat", "snickers", "mars bar"], totalRounds:2, currRound:2, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]})

        //Straight-line code heuristic, test 2
        const draft2 = {drafters:["drafter 1", "drafter 2", "drafter 3"], options:["snickers", "kit kat", "mars bar", "crunch bar"], totalRounds:4, currRound:2, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}, {drafter:"drafter 2", drafted:"mars bar"}]};
        assert.deepStrictEqual(incrementCurrRound(draft2), 
        {drafters:["drafter 1", "drafter 2", "drafter 3"], options:["snickers", "kit kat", "mars bar", "crunch bar"], totalRounds:4, currRound:3, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}, {drafter:"drafter 2", drafted:"mars bar"}]})

    });

    it('setIndex', function() {

        //Straight-line code heuristic, test 1
        const draft1 = {drafters:["drafter 1", "drafter 2"], options:["kit-kat", "snickers", "mars bar"], totalRounds:2, currRound:1, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}]}
        assert.deepStrictEqual(setIndex(draft1, 0), 
        {drafters:["drafter 1", "drafter 2"], options:["kit-kat", "snickers", "mars bar"], totalRounds:2, currRound:1, currIndex:0, picks:[{drafter:"drafter 1", drafted:"kit kat"}]})

        //Straight-line code heuristic, test 2
        const draft2 = {drafters:["drafter 1", "drafter 2", "drafter 3"], options:["snickers", "kit kat", "mars bar", "crunch bar"], totalRounds:4, currRound:2, currIndex:1, picks:[{drafter:"drafter 1", drafted:"kit kat"}, {drafter:"drafter 2", drafted:"mars bar"}]};
        assert.deepStrictEqual(setIndex(draft2, 3), 
        {drafters:["drafter 1", "drafter 2", "drafter 3"], options:["snickers", "kit kat", "mars bar", "crunch bar"], totalRounds:4, currRound:2, currIndex:3, picks:[{drafter:"drafter 1", drafted:"kit kat"}, {drafter:"drafter 2", drafted:"mars bar"}]})
    });

});