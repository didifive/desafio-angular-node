import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { People } from '../models/people';

@Injectable({
  providedIn: 'root'
})
export class PeopleService {

 // protected baseUrl = `${environment.mainUrl}/v1/people`;
 protected baseUrl: string = "http://localhost:3000/"

  constructor(private http: HttpClient) {}

  getAll(): Observable<any>{
    return this.http.get<any>(this.baseUrl +"v1/people");
  }

  getById(id: number): Observable<People>{
    return this.http.get<People>(`${this.baseUrl}/${id}`)
  }

  post(people: People){
    return this.http.post(this.baseUrl +"v1/people",people);
  }

  put(id: number, people: People){
    return this.http.put(this.baseUrl + "v1/people/" +`${id}`, people);
  }

  delete(id: number){
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
