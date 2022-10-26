import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { People } from '../models/people';
import { PeopleService } from './people.service';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent implements OnInit {


  public peopleForm!: FormGroup;
  public title = 'Usuários';
  public userSelect!: People;
  public ver = false;
  public textsimple!: string;
  public users: People[] = [];


  constructor(private peopleService: PeopleService, private fb: FormBuilder) {
    this.createForm();
  }

  ngOnInit() {
    this.loadUsers();
  }

  createForm(){
    this.peopleForm = this.fb.group({
      id:[''],
      name: ['', Validators.required],
      email: ['', Validators.required],
      street: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }

  userSelected(user: People){
    this.userSelect = user;
    this.peopleForm.patchValue(user);
    this.ver = true;
  }

  savePeople(people: People){
    this.peopleService.put(people.id, people).subscribe();
    (user: People) => {
      console.log(user);
      this.loadUsers();
    }
    (error: any) => { console.log(error)}
  }

  voltar(){
    this.ver = false;
  }

  peopleSubmit(){
    this.savePeople(this.peopleForm.value);
  }

  loadUsers(){
   this.peopleService.getAll().forEach(
    (people)=>{ this.users = people.data
    }
   )
  }

}
