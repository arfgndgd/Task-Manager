import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit {

  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) { }

  listId: string;

  ngOnInit(): void {
    // active route belirtir
    this.route.params.subscribe(
      (params: Params) => {
        this.listId = params['listId'];
      }
    )
  }

  createTask(title: string) {
    this.taskService.createTask(title, this.listId).subscribe((newTask: any) => { //any değil Task olması lazım hata veriyor
      //relativeTo: this.route sayesinde taskı ekledikten sonra navigate ile önceki dizine gelip listenin altındaki taskları gösterir
      this.router.navigate(['../'], {relativeTo: this.route}); 
    });
  }
}
