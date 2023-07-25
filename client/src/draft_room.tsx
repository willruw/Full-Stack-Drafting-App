import React, { Component, ChangeEvent, MouseEvent } from "react";
import { Draft, fromJsonDraft, getCurrRound, addPick, getCurrIndex, getDrafters, getOptions, getPicks, incrementCurrRound, makePick, removeOption, setIndex } from "./draft";
import { getTotalRounds } from "./draft";

//Defines the expected arguments from parent (App)
interface DraftRoomProps {
    initialState: Draft,
    draftID: string,
    drafter:string,
    onSave: (draft:Draft) => void,
    onRefresh: (draftID:string) => void,
    onBack: () => void
  };
  
  //Defines the state of the draft room
  interface DraftRoomState {

    draft : Draft,
    drafter: string,
    draftID: string,
    selected: string
  
  }
  
  /**
   * Class that represents a draft room in this app
   */
  export class DraftRoom extends Component<DraftRoomProps, DraftRoomState> {
  
    constructor(props:DraftRoomProps) {
      super(props);
      this.state = { draft: props.initialState, draftID:props.draftID.trim(), drafter:props.drafter.trim(), selected:this.props.initialState.options[0]};
    }
  
    render = (): JSX.Element => {
        const options: JSX.Element[] = [];
        this.initializeOptions(options);
        const elements: JSX.Element[] = [<tr key={0}><td key={0} style={{ fontWeight: 'bold', width:"100px"}}>Num</td><td key={1} style={{ fontWeight: 'bold', width:"100px"}}>Pick</td><td key={2} style={{ fontWeight: 'bold', width:"100px"}}>Drafter</td></tr>];
        this.intializeTable(elements);

        if (this.draftCompleteCheck()) { //Show that draft is complete
          return <div>
                      <div style={{marginBottom:"20px"}}>
                      <span style={{ fontWeight: 'bold', fontSize:"large"}}>Status of Draft "{this.state.draftID}"</span>
                      </div>
                      <table>
                      <tbody>
                      <tr>
                      <td>
                      <table>
                      <tbody>{elements}</tbody>
                      </table>
                      </td>
                      </tr>
                      </tbody>
                      </table>
                      <div style={{marginTop:"15px"}}>Draft is complete.</div>
                      <div style={{marginTop:"15px"}}><button onClick={this.props.onBack}>Back</button></div>
                </div>
        } else if (getPicks(this.state.draft).length === 0 && this.checkIfDrafter()) { //Show that no picks are made yet and that user is picking
          return <div>
                  <div style={{marginBottom:"20px"}}>
                  <span style={{ fontWeight: 'bold', fontSize:"large"}}>Status of Draft "{this.state.draftID}"</span>
                  </div>
                  <div>No picks made yet</div>
                  <div style={{marginTop:"15px"}}>It's your pick!</div>
                  <div style={{marginTop:"15px"}}>
                  <select value={this.state.selected} onChange={this.handleDraftSelectChange}>{options}</select>
                  {" "}<button onClick={this.handleDraft}>Draft</button><button style={{marginLeft:"100px"}} onClick={this.props.onBack}>Back</button>
                  </div>
                  </div>
        } else if (getPicks(this.state.draft).length === 0 && !(this.checkIfDrafter())) { //Show that no picks are made yet and someone else is picking
          return <div>
                  <div style={{marginBottom:"20px"}}>
                  <span style={{ fontWeight: 'bold', fontSize:"large"}}>Status of Draft "{this.state.draftID}"</span>
                  </div>
                  <div>No picks made yet</div>
                  <div style={{marginTop:"15px"}}>
                  <span>Waiting for {getDrafters(this.state.draft)[this.state.draft.currIndex]} to pick.</span>
                  </div>
                  <div style={{marginTop:"15px"}}>
                  <button onClick={this.handleRefresh}>Refresh</button><button style={{marginLeft:"100px"}} onClick={this.props.onBack}>Back</button>
                  </div>
                  </div>
        
        } else if (this.checkIfDrafter()) { //Shat that > 1 picks have been made and the user is picking
            return <div>
                      <div style={{marginBottom:"20px"}}>
                      <span style={{ fontWeight: 'bold', fontSize:"large"}}>Status of Draft "{this.state.draftID}"</span>
                      </div>
                      <table>
                      <tbody>
                      <tr>
                      <td>
                      <table>
                      <tbody>{elements}</tbody>
                      </table>
                      </td>
                      </tr>
                      </tbody>
                      </table>
                      <div style={{marginTop:"15px"}}>It's your pick!</div>
                      <div style={{marginTop:"15px"}}>
                      <select value={this.state.selected} onChange={this.handleDraftSelectChange}>{options}</select>
                      {" "}<button onClick={this.handleDraft}>Draft</button><button style={{marginLeft:"100px"}} onClick={this.props.onBack}>Back</button>
                      </div>
                </div>
        } else { //Show that 1 > picks have been made and someone else is picking
            return <div>
            <div style={{marginBottom:"20px"}}>
            <span style={{ fontWeight: 'bold', fontSize:"large"}}>Status of Draft "{this.state.draftID}"</span>
            </div>
            <table>
            <tbody>
            <tr>
            <td>
            <table>
            <tbody>{elements}</tbody>
            </table>
            </td>
            </tr>
            </tbody>
            </table>
            <div style={{marginTop:"15px"}}>
            <span>Waiting for {getDrafters(this.state.draft)[this.state.draft.currIndex]} to pick.</span>
            </div>
            <div style={{marginTop:"15px"}}>
            <button onClick={this.handleRefresh}>Refresh</button><button style={{marginLeft:"100px"}} onClick={this.props.onBack}>Back</button>
            </div>
            
        </div>
          }
        } 

    //Initializes the JSX.Element array that will be used to display all picks
    intializeTable = (table:JSX.Element[]): void => {
      const picks = getPicks(this.state.draft);
      let i = 0;
      //Makes an array of JSX elements that contain the current picks 
      //when put into the table
      while (i !== picks.length) {
        table.push(<tr key={i + 1}>{this.getRows(i)}</tr>);
        i = i + 1;
      }
    }

    //Checks whether the draft is over
    draftCompleteCheck = (): boolean => {
      const currRound = getCurrRound(this.state.draft);
      const totalRounds = getTotalRounds(this.state.draft);
      const numOptions = getOptions(this.state.draft).length;
      return (currRound > totalRounds) || (numOptions === 0);
    }

    //Puts in the Num, Pick, and Drafter cells for a row in the table
    getRows = (i:number) : JSX.Element[] => {
      const picks = getPicks(this.state.draft);
      const rows = [];
      rows.push(<td key={0} style={{width:"100px"}}>{i + 1}</td>);
      rows.push(<td key={1} style={{width:"100px"}}>{picks[i].drafted}</td>);
      rows.push(<td key={2} style={{width:"100px"}}>{picks[i].drafter}</td>);
      return rows;
    }

    //Initializes all the JSX.Element array that will be used to show all options in select object
    initializeOptions = (option:JSX.Element[]) : void => {
      const options = getOptions(this.state.draft);
      //Initializes the array of JSX elements that contain the options for the drafter
      for (let i = 0; i < options.length; i++) {
        option.push(<option key={i} value={options[i]}>{options[i]}</option>);
      }
    }

    //Sets the currently selected option based off of the option the user picks in the select object
    handleDraftSelectChange =  (evt: ChangeEvent<HTMLSelectElement>): void => {
      this.setState({selected:evt.target.value});
    }

    //Handles what happens when the 'Draft' button is pressed
    //Adds the new Pick to the Draft object and increments the
    //index representing who is currently picking
    //and also increments the current round, if necessary
    handleDraft = (_: MouseEvent<HTMLButtonElement>): void => {
      const drafters = getDrafters(this.state.draft);
      const index = getCurrIndex(this.state.draft);
      let newDraft = addPick(this.state.draft, makePick(drafters[index], this.state.selected));
      newDraft = removeOption(newDraft, this.state.selected);
      if (newDraft.currIndex === newDraft.drafters.length - 1) {
        newDraft = incrementCurrRound(newDraft);
      }
      newDraft = setIndex(newDraft, (newDraft.currIndex + 1) % newDraft.drafters.length);
      this.props.onSave(newDraft);
      this.setState({draft:newDraft});
      this.setState({selected:newDraft.options[0]})
    }

    //Checks whether the user is the one picking
    checkIfDrafter = () : boolean => {
      const drafters = getDrafters(this.state.draft);
      const index = getCurrIndex(this.state.draft);
      return (drafters[index].trim().toLowerCase() === this.state.drafter.trim().toLowerCase());
    }

    //Handles the event that the user presses refresh (loads Draft from server)
    //handleLoad --> handleLoadResponse --> handleLoadJSON
    handleRefresh = (_: MouseEvent<HTMLButtonElement>): void => {
      this.handleLoad(this.state.draftID);
    }

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
        this.setState({selected:newDraft.options[0]})
      } else {
        console.log("Error: load not successful because 'val' not a string", val);
      }
    };

    handleServerError = (_: Response) => {
      console.error(`unknown error talking to server`);
    };

}