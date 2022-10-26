import { Component, OnInit } from '@angular/core';
import { Team } from '../models/team';
import { TeamService } from './team.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {

  public title = 'Seleções';
  public teamSelect?: string;

  public teams: Team[] = [];

  teamSelected(team:any){
    this.teamSelect = team.name;
  }
  voltar(){
    this.teamSelect= '';
  }
  constructor(private teamService: TeamService) { }

  ngOnInit(){
    this.loadTeams();
  }

  loadTeams(){
    this.teamService.getAll().forEach(
     (team)=>{ this.teams = team.data
     }
    )
   }

}
