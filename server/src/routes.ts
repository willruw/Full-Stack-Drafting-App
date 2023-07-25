import { Request, Response } from "express";

const files:Map<string, string> = new Map();

/**
 * Saves the file to files with the provided draft ID and provided draft content
 * @param req draft ID and content
 * @param res result of operation
 * @returns "Saved" if provided draft ID is not blank. 
 * If it is blank, returns the assigned draft ID. 
 * Else error message.
 */
export function saveFile(req: Request, res: Response) {
  let draftID =  first(req.query.name);
  const draft = req.body.content;
  if (draftID === undefined || typeof draftID !== 'string') {
    res.status(400).json("invalid 'draftID' parameter")
    return;
  }
  if (draft === undefined || typeof draft !== 'string') {
    res.status(400).json("invalid 'draft' parameter");
    return;
  }
  if (draftID !== "") {
    files.set(draftID, draft);
    res.json("Saved");
  } else {
    draftID = (Array.from(files.keys()).length + 1).toString();
    files.set(draftID, draft);
    res.json(draftID);
    return;
  }
}

/**
 * Loads the file with the given draft ID, if it exists
 * @param req draft ID
 * @param res result of operation
 * @returns the draft associated with the draft ID, else error message
 */
export function loadFile(req: Request, res: Response) {
  const draftID = first(req.query.name);
  if (draftID === undefined || typeof draftID !== 'string') {
    res.status(400).json("invalid 'draftid' parameter");
    return;
  } else if (files.get(draftID) === undefined) {
    res.status(400).json("Draft ID doesn't exist");
    return;
  }
  const draft = files.get(draftID);
  res.json(draft);
  return;
}

/** Simple reset function used for testing */
export function reset() {
  files.clear();
}

// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
function first(param: any): string|undefined {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
}
