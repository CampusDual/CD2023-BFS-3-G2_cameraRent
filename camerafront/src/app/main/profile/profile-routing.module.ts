import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileHomeComponent } from './profile-home/profile-home.component';
import { MyproductsHomeComponent } from './myproducts-home/myproducts-home.component';
import { MyproductsDetailComponent } from './myproducts-detail/myproducts-detail.component';
import { MyproductsNewComponent } from './myproducts-new/myproducts-new.component';
import { MyRentalsHomeComponent } from './my-rentals-home/my-rentals-home.component';


const routes: Routes = [{
  path : 'mydata',
  component: ProfileHomeComponent
},
{
  path : 'myRentals',
  component: MyRentalsHomeComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
