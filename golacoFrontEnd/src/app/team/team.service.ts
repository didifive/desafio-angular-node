import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Team } from '../models/team';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  protected baseUrl: string = "http://localhost:3000/"

  constructor(private http: HttpClient) {}

  getAll(): Observable<any>{
    return this.http.get<any>(this.baseUrl +"v1/teams");
  }

  getById(id: number): Observable<Team>{
    return this.http.get<Team>(`${this.baseUrl}/${id}`)
  }

}
