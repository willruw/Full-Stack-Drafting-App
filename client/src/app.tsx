import React, { Component, ChangeEvent, MouseEvent } from "react";
import { Draft, fromJsonDraft, getDrafters, getOptions, getTotalRounds, makeDraft, toJsonDraft } from "./draft";
import { DraftRoom } from "./draft_room";

//Defines the state of the App
interface AppState {
  page:string,
  drafter:string,
  draft:Draft,
  draftID:string,
  createErrorMessage:string,
  joinErrorMessage:string,
}

/**
 * Class that implements a draft app
 */
export class App extends Component<{}, AppState> {

  constructor(props: any) {
    super(props);
    this.state = {draftID:"", page:"start", drafter:"", draft:makeDraft([],[],1,1,0,[]), createErrorMessage:"", joinErrorMessage:""};
  }
  
  render = (): JSX.Element => {
    if (this.state.page === "start") {
    return <div>
      <div>
      <label htmlFor="drafter">Drafter: </label>
        <input id="drafter" type="text" value={this.state.drafter}
            onChange={this.handleDrafterChange}></input><span style={{ marginLeft:"5px", fontWeight: 'bold' }}>(required for either option)</span>
      </div>
      <div style={{marginTop:'20px'}}>
      <span style={{ fontWeight: 'bold', fontSize:'large'}}>Join Existing Draft</span>
      </div>
      <div style={{marginTop:'20px'}}>
      <label htmlFor="draftid">Draft ID: </label>
      <input id="draftid" type="text" value={this.state.draftID}
            onChange={this.handleDraftIDChange}></input>
      </div>
      <div style={{marginTop:'10px'}}>
      <button onClick={this.handleJoin}>Join</button><span style={{marginLeft:"5px", color:"red", fontSize:"medium"}}>{this.state.joinErrorMessage}</span>
      </div>
      <div style={{marginTop:'20px'}}>
      <span style={{ fontWeight: 'bold', marginTop:'50px', fontSize:'large'}}>Create New Draft</span>
      </div>
      <div style={{marginTop:'20px'}}>
      <label htmlFor="rounds">Rounds: </label>
      <input id="rounds" type="number" value={this.state.draft.totalRounds} size={3} min={1} max={Number.MAX_VALUE}
            onChange={this.handleRoundsChange}></input>
      </div>
      <div style={{display: "inline-block", marginTop:"20px"}}>
        <div>
        <label htmlFor="options">Options (one per line)</label>
        </div>
        <div>
        <textarea id="options" name="options" rows={23} cols={26} onChange={this.handleOptionsChange}>
        </textarea>
        </div>
        </div>
        <div style={{display: "inline-block", marginLeft:"5px"}}>
          <div>
        <label htmlFor="drafters">Drafters (one per line, in order)</label>
        </div>
        <div>
        <textarea id="drafters" name="drafters" rows={23} cols={26} onChange={this.handleDraftersChange}>
        </textarea>
        </div>
        </div>
        <div style={{marginTop:"3px"}}>
        <button onClick={this.handleCreate}>Create</button>
        </div>
        <div style={{marginTop:"5px", color:"red", fontSize:"medium"}}>{this.state.createErrorMessage}</div>
      
    </div>
      } else {
      return <DraftRoom initialState={this.state.draft} draftID={this.state.draftID} drafter={this.state.drafter}
        onSave={this.handleSave} onRefresh={this.handleLoad} onBack={this.handleBack}/>
    }
  };

  //Checks whether the Create process can happen / whether the user input is bad (i.e., not enough options for rounds and drafters)
  //If bad, sets the appropriate error messages and returns false
  createCheck = () : boolean => {
    const numDrafters = this.getRealDrafters().length;
    const numRounds = getTotalRounds(this.state.draft);
    const minNumOfOptions = numRounds * numDrafters;
    const numOptions = this.getRealOptions().length
    const drafter = this.state.drafter.trim().length;
    if (drafter === 0 || numDrafters === 0 || numOptions === 0) {
      this.setState({joinErrorMessage:""});
      this.setState({createErrorMessage:"Error: Please fill in all required fields (Drafter, Drafters, and Options)"});
      return false;
    } else if (numOptions < minNumOfOptions) {
      this.setState({joinErrorMessage:""});
      this.setState({createErrorMessage:"Error: Not enough options for " + numDrafters + " drafters and " + numRounds +
       " rounds. Minimum number of options needed: " + minNumOfOptions})
      return false;
    }
    this.setState({joinErrorMessage:""});
    this.setState({createErrorMessage:""});
    return true;
  }

  //Checks whether the Create process can happen / whether the user input is bad
  //If bad, sets the appropriate error messages and returns false
  joinCheck = () : boolean => {
    const drafter = this.state.drafter.trim().length;
    const draftID = this.state.draftID.trim();
    if (drafter === 0 || draftID.length === 0) {
      this.setState({createErrorMessage:""});
      this.setState({joinErrorMessage:"Error: Please fill in all required fields (Drafter and DraftID)"});
      return false;
    } else {
      return true;
    }
  }

  //Sets the state of the Drafter whenever the Drafter field changes
  handleDrafterChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({drafter: evt.target.value});
    this.setState({createErrorMessage:""});
    this.setState({joinErrorMessage:""});
  };
  //Sets the state of the DraftID whenever the DraftID field changes
  handleDraftIDChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({draftID: evt.target.value});
    this.setState({createErrorMessage:""});
    this.setState({joinErrorMessage:""});
  };

  //Handles the event that the 'Join' button is pressed
  //First checks that user filled in all fields by calling JoinCheck
  //Then makes sure the draftID entered is present in server
  //handleJoin --> handleJoinResponse --> handleJoinErrorJSON / handleJoinJSON
  handleJoin = (_: MouseEvent<HTMLButtonElement>): void => {
    if (this.joinCheck()) {
      const url = "/api/load" +
      "?name=" + encodeURIComponent(this.state.draftID.trim())
      fetch(url)
      .then(this.handleJoinResponse)
      .catch(this.handleServerError);
    } else {
      //do nothing
    }
  };

  handleJoinResponse = (res:Response) => {
    if (res.status === 200) {
      res.json().then(this.handleJoinJSON).catch(this.handleServerError)
    } else {
      res.json().then(this.handleJoinErrorJSON).catch(this.handleServerError);
    }
  };

  handleJoinErrorJSON = (val:unknown) => {
    if(typeof val === 'string' && val === "Draft ID doesn't exist") {
      this.setState({createErrorMessage:""});
      this.setState({joinErrorMessage:"Error: Draft ID not valid. Please check that it was typed in correctly and try again"});
    } else {
      console.error(`unknown error talking to server`);
    }
  }

  handleJoinJSON = (val:unknown) => {
    if (typeof val === 'string') {
      const newDraft = fromJsonDraft(JSON.parse(val));
      this.setState({drafter:this.state.drafter.trim()});
      this.setState({draft:newDraft});
      this.setState({page:"draftroom"});
    } else {
      console.log("Error: load not successful because 'val' not a string", val);
    }
  }

  //Sets the round when the round field changes
  handleRoundsChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    if (!Number.isNaN(evt.target.valueAsNumber)) {
      this.setState({draft: makeDraft(this.state.draft.drafters, this.state.draft.options, evt.target.valueAsNumber, this.state.draft.currRound, this.state.draft.currIndex, this.state.draft.picks)});
      this.setState({createErrorMessage:""});
      this.setState({joinErrorMessage:""});
    }
  };

  //Sets the options when the options field changes
  handleOptionsChange = (evt: ChangeEvent<HTMLTextAreaElement>): void => {
    this.setState({draft: makeDraft(this.state.draft.drafters, evt.target.value.split('\n'), this.state.draft.totalRounds, this.state.draft.currRound, this.state.draft.currIndex, this.state.draft.picks)});
    this.setState({createErrorMessage:""});
    this.setState({joinErrorMessage:""});
  };

  //Sets the drafters when the drafters field changes
  handleDraftersChange = (evt: ChangeEvent<HTMLTextAreaElement>): void => {
    this.setState({draft: makeDraft(evt.target.value.split('\n'), this.state.draft.options, this.state.draft.totalRounds, this.state.draft.currRound, this.state.draft.currIndex, this.state.draft.picks)});
    this.setState({createErrorMessage:""});
    this.setState({joinErrorMessage:""});
  };

  //Parses / reformats user input for valid drafters entries (i.e., no whitespace elements and no whitespace after text)
  getRealDrafters = () : string[] => {
    const drafters = getDrafters(this.state.draft);
    const realDrafters = [];
    let i = 0;
    //Makes it so realDrafters only contains non-whitespace elements
    while(i !== drafters.length) {
      if (drafters[i].trim() !== "") {
        realDrafters.push(drafters[i].trim());
      }
      i = i + 1;
    }
    return realDrafters;
  }

  //Parses / reformats user input for valid options entries (i.e., no whitespace elements and no whitespace after text)
  getRealOptions = () : string[] => {
    const options = getOptions(this.state.draft);
    const realOptions = [];
    let j = 0;
    //Makes it so realOptions only contains non-whitespace elements
    while(j !== options.length) {
      if (options[j].trim() !== "") {
        realOptions.push(options[j].trim());
      }
      j = j + 1;
    }
    return realOptions;
  }

  //Handles the event that the 'Create' button is pressed
  //Formats draft object and sends to server
  //Server then returns ID of the draft
  //handleCreate --> handleCreateResponse --> handleCreateJson
  handleCreate = (_: MouseEvent<HTMLButtonElement>): void => {
    if (this.createCheck()) {
      const realDrafters = this.getRealDrafters();
      const realOptions = this.getRealOptions();
      const realDraft = makeDraft(realDrafters, realOptions, this.state.draft.totalRounds, this.state.draft.currRound, this.state.draft.currIndex, this.state.draft.picks);
      this.setState({draft:realDraft});
      this.setState({drafter:this.state.drafter.trim()});
      const url = "/api/save"+
      "?name=" + encodeURIComponent("");
      fetch(url, {method: "POST", body:JSON.stringify({content:JSON.stringify(toJsonDraft(realDraft))}), headers: { 'Content-Type': 'application/json' }})
      .then(this.handleCreateResponse)
      .catch(this.handleServerError);
    } else {
      //Do nothing
    }
  };

  handleCreateResponse  = (res: Response) => {
    if (res.status === 200) {
      res.json().then(this.handleCreateJson).catch(this.handleServerError);
    } else {
      this.handleServerError(res);
    }
  };

  handleCreateJson = (val: any) => {
    if (typeof val !== "string" || val === null) {
      console.error("bad data from /save: not a record", val)
      return;
    } else {
      this.setState({draftID:val});
      this.setState({page:"draftroom"});
    }
  }

  handleServerError = (_: Response) => {
    console.error(`unknown error talking to server`);
  };

  //Handles the onSave functionality passed into the DraftRoom
  //Sends / saves the draft argument in the server (with the current draftID)
  //handleSave --> handleSaveResponse --> handleSaveJson
  handleSave = (draft:Draft) : void => {
    const url = "/api/save" +
    "?name=" + encodeURIComponent(this.state.draftID)
    fetch(url, {method: "POST", body:JSON.stringify({content:JSON.stringify(toJsonDraft(draft))}), headers: { 'Content-Type': 'application/json' }})
    .then(this.handleSaveResponse)
    .catch(this.handleServerError);
  };

  handleSaveResponse  = (res: Response) => {
    if (res.status === 200) {
      res.json().then(this.handleSaveJson).catch(this.handleServerError);
    } else {
      this.handleServerError(res);
    }
  };

  handleSaveJson = (val: any) => {
    if (typeof val !== "string" || val === null) {
      console.error("bad data from /save: not a record", val)
      return;
    }
  }

  //handles the onRefresh functionality passed into the draftRoom
  //Loads the Draft object of the provided draftID from the server
  //hanldeLoad --> handleLoadResponse --> handleLoadJSON
  handleLoad = (draftID:string) : void => {
    const url = "/api/load" +
    "?name=" + encodeURIComponent(draftID)
    fetch(url)
    .then(this.handleLoadResponse)
    .catch(this.handleServerError);
  };

  handleLoadResponse = (res:Response) => {
    if (res.status === 200) {
      res.json().then(this.handleLoadJSON).catch(this.handleServerError);
    } else {
      this.handleServerError(res);
    }
  };

  handleLoadJSON = (val:unknown) => {
    if (typeof val === 'string') {
      const newDraft = fromJsonDraft(JSON.parse(val));
      this.setState({draft:newDraft});
      this.setState({page:"start"});
      this.setState({page:"draftroom"});
    } else {
      console.log("Error: load not successful because 'val' not a string", val);
    }
  };

  //Handles the onBack functionality passed into the draftRoom
  //Sets the draft fields to default and changes the page
  handleBack = (): void => {
    //draftID:"", page:"start", drafter:"", draft:makeDraft([],[],1,1,0,[]), createErrorMessage:"", joinErrorMessage:""
    this.setState({draftID:"", drafter:"", createErrorMessage:"", joinErrorMessage:"", draft:makeDraft([],[],1,1,0,[]), page:"start"});
    return;
  }

  handleKeyDown = () : boolean => {
    return false;
  }

}