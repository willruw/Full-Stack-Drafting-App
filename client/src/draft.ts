/** Describes what makes up a pick */
export type Pick = {readonly drafter:string, readonly drafted:string};

/** Describes what makes up a draft */
export type Draft = {   readonly drafters:string[], 
                        readonly options:string[], 
                        readonly totalRounds:number, 
                        readonly currRound:number, 
                        readonly currIndex:number
                        readonly picks:Pick[]}

/** Creates a new Draft */
export function makeDraft(drafters:string[], options:string[], totalRounds:number, currRound:number, currIndex:number, picks:Pick[]): Draft {
  return {drafters:drafters, options:options, totalRounds:totalRounds, currRound:currRound, currIndex:currIndex, picks:picks};
}

/** Creates a new Pick */
export function makePick(drafter:string, drafted:string) : Pick {
    return {drafter:drafter, drafted:drafted};
}

/**
 * Returns a JSON describing the given draft
 * @param draft draft to JSONify
 * @returns the draft in JSON form
 */
export function toJsonDraft(draft:Draft): any {
    return [draft.drafters, draft.options, draft.totalRounds.toString(), draft.currRound.toString(), draft.currIndex.toString(), toJsonPick(draft.picks)];
}

/**
 * Returns a JSON describing all of the picks in a draft
 * @param pick pick array to turn into JSON/string array
 * @returns JSON/string array describing the picks in the draft
 */
function toJsonPick(pick:Pick[]):any {
    let i = 0;
    let pickStringArr = [];
    //Creating a string array instead of the original records
    //{{ Inv: pickStringArr[0..i] = toJSON(pick[0..i]) }}
    while (i !== pick.length) {
        pickStringArr.push([pick[i].drafter, pick[i].drafted]);
        i = i + 1;
    }
    return pickStringArr;
}

/**
 * Returns a JSON draft into its original state
 * @param data JSONified draft to turn back into draft
 * @returns actual draft version of provided JSON draft
 */
export function fromJsonDraft(data:any) : Draft {
    if (Array.isArray(data) && data.length === 6) {
        return makeDraft(data[0], data[1], parseInt(data[2]), parseInt(data[3]), parseInt(data[4]), fromJsonPick(data[5]));
    } else {
        throw new Error(`type ${typeof data} is not a valid draft`);
    }
}

/**
 * Returns a Pick array from the provided JSON/string array
 * @param data JSON/string array to return to original state
 * @returns the original Pick array back from its JSON/string form
 */
function fromJsonPick(data:any) : Pick[] {
    if (Array.isArray(data)) {
        let i = 0;
        let pickArray = [];
        //Turns the string array back into a Pick array
        //{{ Inv: pickArray[0..i] = fromJSON(data[0..i]) }}
        while (i != data.length) {
            pickArray.push(makePick(data[i][0], data[i][1]));
            i = i + 1;
        }
        return pickArray;
    } else {
        throw new Error(`type ${typeof data} is not a valid pick array`);
    }
}
/** Gets the array of drafters from the given draft */
export function getDrafters(draft:Draft) : string[] {
    return draft.drafters;
}

/** Gets the array of options from the given draft */
export function getOptions(draft:Draft) : string[] {
    return draft.options;
}

/** Gets the total rounds from the given draft */
export function getTotalRounds(draft:Draft) : number {
    return draft.totalRounds;
}
/** Gets the current round from the given draft */
export function getCurrRound(draft:Draft) : number {
    return draft.currRound;
}
/** Gets the index of the person currently picking */
export function getCurrIndex(draft:Draft) : number {
    return draft.currIndex;
}

/** Gets the picks from the given draft */
export function getPicks(draft:Draft) : Pick[] {
    return draft.picks;
}

/**
 * Removes the gives option from the given draft if it exists
 * @param draft the draft to remove the option from
 * @param option the option to remove
 * @returns given draft without the given option if it exists in draft, else the draft unchanged
 */
export function removeOption(draft:Draft, option:string) : Draft {
    const newArray = [];
    let i = 0;
    //{{ Inv: newArray[0..i] = remove(draft.options, option) }}
    while (i !== draft.options.length) {
        if (draft.options[i] !== option) {
            newArray.push(draft.options[i]);
        }
        i = i + 1;
    }
    return makeDraft(draft.drafters, newArray, draft.totalRounds, draft.currRound, draft.currIndex, draft.picks);
}

/**
 * Adds the given pick to the given draft
 * @param draft draft to add the given pick to
 * @param pick the pick to add
 * @returns given draft with pick added
 */
export function addPick(draft:Draft, pick:Pick) : Draft {
    const newPicks = [];
    // newPicks[0..i] = draft.picks[0..i]
    for (let i = 0; i < draft.picks.length; i++) {
        newPicks.push(draft.picks[i]);
    }
    newPicks.push(pick); //makes newpicks[0..n] = draft.picks[0..n] ++ [pick]
    return makeDraft(draft.drafters, draft.options, draft.totalRounds, draft.currRound, draft.currIndex, newPicks);
}

/**
 * Increments the current round of the given draft
 * @param draft the draft to increment the current round of
 * @returns the given draft with the current round = current round + 1
 */
export function incrementCurrRound(draft:Draft) : Draft {
    return makeDraft(draft.drafters, draft.options, draft.totalRounds, draft.currRound + 1, draft.currIndex, draft.picks);
}

/**
 * Sets the index of the person currently picking of the given draft
 * @param draft the draft to set the current index of
 * @returns the given draft with the current index set to the given index
 */
export function setIndex(draft:Draft, index:number) : Draft {
    return makeDraft(draft.drafters, draft.options, draft.totalRounds, draft.currRound, index, draft.picks);
}
