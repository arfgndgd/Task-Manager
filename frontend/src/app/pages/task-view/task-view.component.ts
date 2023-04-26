import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { List } from 'src/app/models/list.model';
import { Task } from 'src/app/models/task.model';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {

  lists: List[];
  tasks?: Task[]; //? nedeni aşağıda sıkıntı çıkarması

  selectedListId: string;

  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {

    // active route belirtir
    this.route.params.subscribe(
      (params: Params) => {
        if (params['listId']) {
          this.selectedListId = (params['listId']);
          console.log(params)
          this.taskService.getTasks(params['listId']).subscribe((tasks: any) => {
            this.tasks = tasks;
          })
        } else {
          this.tasks = undefined;
        }

      }
    )

    // listenin elamanlarını döndürür
    this.taskService.getLists().subscribe((lists: any) => {
      this.lists = lists;
      console.log(this.lists)
    })
  }

  onTaskClick(task: Task) {
    // set task to completed
    this.taskService.complete(task).subscribe(() => {
      // the task has been set to completed successfully
      console.log("Completed successfully");
      task.completed = !task.completed; // üstünü çizer/kaldırır
    })
  }

  //TODO: task routerlink hatalı

  onDeleteListClick() {
    this.taskService.deleteList(this.selectedListId).subscribe((res: any) => {
      this.router.navigate(['/lists']);
      console.log(res)
    });
  }
}
